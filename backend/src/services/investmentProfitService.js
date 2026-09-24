const { adjustWalletBalance } = require("./walletService");
const { getOrCreateWallet } = require("./walletService");
const { resolvePayoutDailyPercent, toNumber } = require("../utils/investmentPayout");
const env = require("../config/env");
const { buildCompletedDaysSql, buildMaturedWhereSql } = require("../utils/profitDays");

const USER_SYNC_COOLDOWN_MS = Math.max(
  60_000,
  Number(process.env.PROFIT_USER_SYNC_COOLDOWN_MS || 15 * 60 * 1000),
);
const lastSyncByUser = new Map();

function completedDaysSql() {
  return buildCompletedDaysSql();
}

function normalizeId(value) {
  const next = Number(value);
  return Number.isFinite(next) ? next : value;
}

function pickRowValue(row, ...keys) {
  if (!row || typeof row !== "object") return undefined;
  for (const key of keys) {
    if (row[key] != null) return row[key];
  }
  const lower = Object.fromEntries(Object.entries(row).map(([k, v]) => [k.toLowerCase(), v]));
  for (const key of keys) {
    if (lower[String(key).toLowerCase()] != null) return lower[String(key).toLowerCase()];
  }
  return undefined;
}

function isDuplicateEntryError(error) {
  const code = String(error?.code || "");
  const message = String(error?.message || "").toLowerCase();
  return code === "ER_DUP_ENTRY" || code === "SQLITE_CONSTRAINT" || message.includes("duplicate");
}

function readCountValue(row, ...keys) {
  const raw = pickRowValue(row, ...keys);
  const next = Number(raw);
  return Number.isFinite(next) ? Math.max(0, Math.floor(next)) : 0;
}

function extractRawRows(result) {
  if (Array.isArray(result?.[0]) && result[0].length && typeof result[0][0] === "object") {
    return result[0];
  }
  if (Array.isArray(result) && result.length && typeof result[0] === "object" && !Array.isArray(result[0])) {
    return result;
  }
  return [];
}

function mapInvestmentRows(result) {
  const rows = extractRawRows(result);
  return rows.map((row) => {
    const daysDue = readCountValue(row, "days_due", "daysDue", "completedDays", "completeddays");
    const daysCredited = readCountValue(row, "days_credited", "daysCredited", "creditedCount", "creditedcount");

    return {
      id: normalizeId(pickRowValue(row, "id")),
      userId: normalizeId(pickRowValue(row, "user_id", "userId")),
      amount: pickRowValue(row, "amount"),
      expectedReturn: pickRowValue(row, "expected_return", "expectedReturn"),
      startDate: pickRowValue(row, "start_date", "startDate"),
      createdAt: pickRowValue(row, "created_at", "createdAt"),
      claimedEarning: pickRowValue(row, "claimed_earning", "claimedEarning"),
      payoutDailyReturnPercent: pickRowValue(row, "payout_daily_return_percent", "payoutDailyReturnPercent"),
      durationDays: pickRowValue(row, "duration_days", "durationDays"),
      dailyReturnPercent: pickRowValue(row, "daily_return_percent", "dailyReturnPercent"),
      planPayoutDailyReturnPercent: pickRowValue(
        row,
        "plan_payout_daily_return_percent",
        "planPayoutDailyReturnPercent",
      ),
      totalReturnPercent: pickRowValue(row, "total_return_percent", "totalReturnPercent"),
      planName: pickRowValue(row, "plan_name", "planName", "name"),
      daysDue,
      daysCredited,
    };
  });
}

async function loadInvestmentsNeedingCredit(q, userId = null) {
  const params = userId ? [userId] : [];
  const userFilter = userId ? "AND i.user_id = ?" : "";
  const daysSql = completedDaysSql();

  const result = await q.raw(
    `
    SELECT
      i.id AS id,
      i.user_id AS user_id,
      i.amount AS amount,
      i.expected_return AS expected_return,
      i.start_date AS start_date,
      i.created_at AS created_at,
      i.claimed_earning AS claimed_earning,
      i.payout_daily_return_percent AS payout_daily_return_percent,
      p.duration_days AS duration_days,
      p.daily_return_percent AS daily_return_percent,
      p.payout_daily_return_percent AS plan_payout_daily_return_percent,
      p.total_return_percent AS total_return_percent,
      p.name AS plan_name,
      ${daysSql} AS days_due,
      COUNT(idp.id) AS days_credited
    FROM investments i
    INNER JOIN investment_plans p ON p.id = i.plan_id
    LEFT JOIN investment_daily_profits idp ON idp.investment_id = i.id
    WHERE i.status = 'active' ${userFilter}
    GROUP BY
      i.id,
      i.user_id,
      i.amount,
      i.expected_return,
      i.start_date,
      i.created_at,
      i.claimed_earning,
      i.payout_daily_return_percent,
      p.duration_days,
      p.daily_return_percent,
      p.payout_daily_return_percent,
      p.total_return_percent,
      p.name
    HAVING ${daysSql} > COUNT(idp.id)
    `,
    params,
  );

  return mapInvestmentRows(result);
}

async function loadCreditedDayMap(q, investmentIds) {
  const ids = [...new Set(investmentIds.map((id) => normalizeId(id)).filter(Boolean))];
  if (!ids.length) return new Map();

  const rows = await q("investment_daily_profits")
    .whereIn("investment_id", ids)
    .select("investment_id as investmentId", "day_index as dayIndex", "amount");

  const byInvestment = new Map();
  for (const row of rows) {
    const investmentId = normalizeId(row.investmentId);
    const current = byInvestment.get(investmentId) || { paidSum: 0, days: new Set() };
    current.paidSum += toNumber(row.amount);
    current.days.add(Number(row.dayIndex));
    byInvestment.set(investmentId, current);
  }
  return byInvestment;
}

async function creditSingleDayProfit(db, trx, item, dayIndex, creditAmount) {
  const investmentId = normalizeId(item.id);
  const reference = `INV-DP-${investmentId}-${dayIndex}`;

  const existing = await trx("investment_daily_profits")
    .where({ investment_id: investmentId, day_index: dayIndex })
    .first();
  if (existing) return { credited: 0, skipped: true };

  await trx("investment_daily_profits").insert({
    investment_id: investmentId,
    user_id: item.userId,
    day_index: dayIndex,
    amount: creditAmount,
    reference,
  });
  await adjustWalletBalance(
    db,
    {
      userId: item.userId,
      delta: creditAmount,
      reason: "investment_daily_profit",
      reference,
    },
    trx,
  );
  await trx("transactions").insert({
    user_id: item.userId,
    type: "earning",
    amount: creditAmount,
    status: "completed",
    method: `${item.planName} daily profit`,
    reference,
  });

  return { credited: creditAmount, skipped: false };
}

async function processInvestmentsForProfit(db, q, investments) {
  const needsCredit = investments.length;
  if (!needsCredit) {
    return {
      credited: 0,
      entries: 0,
      skipped: 0,
      notDue: 0,
      needsCredit: 0,
      errors: 0,
      skipZeroAmount: 0,
      skipZeroProfit: 0,
      skipLoopBlocked: 0,
    };
  }

  const creditedDayMap = await loadCreditedDayMap(
    q,
    investments.map((item) => item.id),
  );

  let totalCredited = 0;
  let totalEntries = 0;
  let skipped = 0;
  let errors = 0;
  let skipZeroAmount = 0;
  let skipZeroProfit = 0;
  let skipLoopBlocked = 0;

  for (const item of investments) {
    try {
      const investmentId = normalizeId(item.id);
      const amount = toNumber(item.amount);
      const expectedReturn = toNumber(item.expectedReturn);
      const durationDays = Math.max(1, toNumber(item.durationDays, 1));
      const daysDue = Math.max(1, Number(item.daysDue) || 1);
      const payoutDailyPct = resolvePayoutDailyPercent(item);
      const totalReturnPct = toNumber(item.totalReturnPercent);

      let totalProfit = 0;
      if (payoutDailyPct > 0) {
        totalProfit = Number((amount * (payoutDailyPct / 100) * durationDays).toFixed(4));
      } else if (totalReturnPct > 0) {
        totalProfit = Number((amount * (totalReturnPct / 100)).toFixed(4));
      } else {
        totalProfit = Math.max(0, Number((expectedReturn - amount).toFixed(4)));
      }

      if (amount <= 0) {
        skipZeroAmount += 1;
        skipped += 1;
        continue;
      }
      if (totalProfit <= 0) {
        skipZeroProfit += 1;
        skipped += 1;
        continue;
      }

      const meta = creditedDayMap.get(investmentId) || { paidSum: 0, days: new Set() };
      let runningPaid = toNumber(meta.paidSum);
      let insertedCount = 0;
      let insertedAmount = 0;
      const baseDaily =
        payoutDailyPct > 0
          ? Number((amount * (payoutDailyPct / 100)).toFixed(4))
          : Number((totalProfit / durationDays).toFixed(4));

      for (let dayIndex = 1; dayIndex <= daysDue; dayIndex += 1) {
        if (meta.days.has(dayIndex)) continue;

        let creditAmount =
          dayIndex === durationDays
            ? Math.max(0, Number((totalProfit - runningPaid).toFixed(4)))
            : baseDaily;
        if (creditAmount <= 0) {
          creditAmount = baseDaily;
        }
        creditAmount = Number(Math.max(creditAmount, 0.0001).toFixed(4));

        try {
          const dayResult = await db.transaction(async (dayTrx) =>
            creditSingleDayProfit(db, dayTrx, item, dayIndex, creditAmount),
          );

          if (dayResult.skipped) {
            meta.days.add(dayIndex);
            continue;
          }

          runningPaid = Number((runningPaid + creditAmount).toFixed(4));
          meta.days.add(dayIndex);
          insertedCount += 1;
          insertedAmount = Number((insertedAmount + creditAmount).toFixed(4));
          totalEntries += 1;
          totalCredited = Number((totalCredited + creditAmount).toFixed(4));
        } catch (error) {
          if (isDuplicateEntryError(error)) {
            meta.days.add(dayIndex);
            continue;
          }
          errors += 1;
          // eslint-disable-next-line no-console
          console.error(
            `Profit day credit failed for investment ${investmentId} day ${dayIndex}:`,
            error.message,
          );
        }
      }

      if (insertedCount > 0) {
        await q("investments")
          .where({ id: investmentId })
          .update({ claimed_earning: runningPaid, updated_at: q.fn.now() });
        await q("notifications").insert({
          user_id: item.userId,
          title: "Daily investment profit added",
          message: `${insertedCount} day(s) profit totaling $${insertedAmount.toFixed(4)} added from ${item.planName}.`,
        });
      } else if (daysDue > Number(item.daysCredited || 0)) {
        skipLoopBlocked += 1;
        skipped += 1;
      }
    } catch (error) {
      errors += 1;
      // eslint-disable-next-line no-console
      console.error(`Profit credit failed for investment ${item.id} (user ${item.userId}):`, error.message);
    }
  }

  return {
    credited: totalCredited,
    entries: totalEntries,
    skipped,
    notDue: 0,
    needsCredit,
    errors,
    skipZeroAmount,
    skipZeroProfit,
    skipLoopBlocked,
  };
}

async function creditPendingDailyProfits(db, userId, trx = null) {
  const q = trx || db;
  const investments = await loadInvestmentsNeedingCredit(q, userId);
  return processInvestmentsForProfit(db, q, investments);
}

async function creditPendingDailyProfitsIfDue(db, userId, options = {}) {
  const { force = false, trx = null } = options;
  if (force || trx) {
    const result = await creditPendingDailyProfits(db, userId, trx);
    if (!trx) lastSyncByUser.set(Number(userId), Date.now());
    return result;
  }

  const normalizedUserId = Number(userId);
  const lastRun = lastSyncByUser.get(normalizedUserId) || 0;
  if (Date.now() - lastRun < USER_SYNC_COOLDOWN_MS) {
    return { credited: 0, entries: 0, skipped: true };
  }

  lastSyncByUser.set(normalizedUserId, Date.now());
  return creditPendingDailyProfits(db, userId);
}

async function getProfitBacklogSummary(db) {
  const daysSql = completedDaysSql();
  const result = await db.raw(`
    SELECT
      COUNT(DISTINCT t.user_id) AS users_still_behind,
      COUNT(*) AS investments_still_behind
    FROM (
      SELECT
        i.user_id,
        i.id
      FROM investments i
      JOIN investment_plans p ON p.id = i.plan_id
      LEFT JOIN investment_daily_profits idp ON idp.investment_id = i.id
      WHERE i.status = 'active'
      GROUP BY i.id, i.user_id, i.created_at, i.start_date, p.duration_days
      HAVING ${daysSql} > COUNT(idp.id)
    ) t
  `);

  const row = extractRawRows(result)[0] || {};
  const activeRow = await db("investments").where({ status: "active" }).count({ count: "*" }).first();

  return {
    activeInvestments: Number(activeRow?.count || 0),
    usersStillBehind: Number(pickRowValue(row, "users_still_behind") || 0),
    investmentsStillBehind: Number(pickRowValue(row, "investments_still_behind") || 0),
  };
}

async function creditPendingDailyProfitsForAllUsers(db) {
  const investments = await loadInvestmentsNeedingCredit(db);
  const result = await processInvestmentsForProfit(db, db, investments);

  const userIds = [...new Set(investments.map((item) => Number(item.userId)).filter(Boolean))];
  for (const userId of userIds) {
    lastSyncByUser.set(userId, Date.now());
  }

  const activeUserRows = await db("investments").where({ status: "active" }).distinct("user_id");
  const summary = await getProfitBacklogSummary(db);

  return {
    usersProcessed: userIds.length,
    activeUsers: activeUserRows.length,
    failedUsers: 0,
    credited: result.credited,
    entries: result.entries,
    skipped: result.skipped,
    needsCredit: result.needsCredit,
    errors: result.errors,
    skipZeroAmount: result.skipZeroAmount,
    skipZeroProfit: result.skipZeroProfit,
    skipLoopBlocked: result.skipLoopBlocked,
    usersStillBehind: summary.usersStillBehind,
    investmentsStillBehind: summary.investmentsStillBehind,
    activeInvestments: summary.activeInvestments,
    profitDayMode: env.profitDayMode || "calendar",
  };
}

async function creditPendingDailyProfitsForUserIds(db, userIds = []) {
  const normalized = [...new Set(userIds.map((id) => Number(id)).filter(Boolean))];
  let credited = 0;
  let entries = 0;
  let failedUsers = 0;
  let needsCredit = 0;

  for (const userId of normalized) {
    try {
      const result = await creditPendingDailyProfits(db, userId);
      lastSyncByUser.set(userId, Date.now());
      credited = Number((credited + Number(result.credited || 0)).toFixed(4));
      entries += Number(result.entries || 0);
      needsCredit += Number(result.needsCredit || 0);
    } catch (error) {
      failedUsers += 1;
      // eslint-disable-next-line no-console
      console.error(`Profit catch-up failed for user ${userId}:`, error.message);
    }
  }

  return { usersProcessed: normalized.length - failedUsers, failedUsers, credited, entries, needsCredit };
}

async function settleMaturedPrincipalsForAllUsers(db) {
  // Default: no principal refund. Plans stay active through durationDays and then
  // complete WITHOUT returning principal (stops reinvest → referral commission loop).
  const refundEnabled = env.enablePrincipalRefund === true;

  const matured = await db("investments")
    .join("investment_plans", "investments.plan_id", "investment_plans.id")
    .where("investments.status", "active")
    .whereRaw(buildMaturedWhereSql())
    .select(
      "investments.id",
      "investments.user_id as userId",
      "investments.amount",
      "investment_plans.name as planName",
    );
  let settledCount = 0;

  for (const item of matured) {
    await db.transaction(async (trx) => {
      const fresh = await trx("investments").where({ id: item.id }).forUpdate().first();
      if (!fresh || fresh.status !== "active") return;
      const principal = Number(fresh.amount || 0);

      if (refundEnabled) {
        const reference = `INV-AUTO-CLM-${fresh.id}-${Date.now()}`;
        await adjustWalletBalance(
          db,
          {
            userId: fresh.user_id,
            delta: principal,
            reason: "investment_principal_return",
            reference,
          },
          trx,
        );
        const wallet = await getOrCreateWallet(db, fresh.user_id, trx);
        const lockedRow = await trx("wallets").where({ id: wallet.id }).forUpdate().first();
        await trx("wallets")
          .where({ id: wallet.id })
          .update({
            locked_balance: Number((Number(lockedRow.locked_balance || 0) + principal).toFixed(2)),
            updated_at: trx.fn.now(),
          });
      }

      await trx("investments")
        .where({ id: fresh.id })
        .update({ status: "completed", end_date: trx.fn.now(), updated_at: trx.fn.now() });
      await trx("notifications").insert({
        user_id: fresh.user_id,
        title: "Investment completed",
        message: refundEnabled
          ? `Principal $${principal.toFixed(2)} from ${item.planName} returned automatically and locked for reinvestment.`
          : `${item.planName} term completed. Principal stays invested in the program and is not returned to your wallet.`,
      });
    });
    settledCount += 1;
  }
  return { settledCount };
}

module.exports = {
  creditPendingDailyProfits,
  creditPendingDailyProfitsIfDue,
  creditPendingDailyProfitsForAllUsers,
  settleMaturedPrincipalsForAllUsers,
  creditPendingDailyProfitsForUserIds,
  getProfitBacklogSummary,
};
