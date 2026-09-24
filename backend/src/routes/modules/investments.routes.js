const express = require("express");
const { z } = require("zod");

const db = require("../../db/knex");
const { requireAuth } = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/ApiError");
const { adjustWalletBalance, getOrCreateWallet } = require("../../services/walletService");
const { applyCommissions } = require("../../services/referralService");
const { creditPendingDailyProfits, creditPendingDailyProfitsIfDue } = require("../../services/investmentProfitService");
const { resolvePayoutDailyPercent, resolvePlanPayoutDailyPercent } = require("../../utils/investmentPayout");
const env = require("../../config/env");
const {
  getCompletedDays,
  getMaturityDate,
  formatProfitLocalYmd,
} = require("../../utils/profitDays");

const router = express.Router();

const investSchema = z.object({
  planId: z.number().int().positive(),
  amount: z.number().positive(),
});

router.get(
  "/plans",
  asyncHandler(async (_req, res) => {
    const plans = await db("investment_plans")
      .select(
        "id",
        "slug",
        "name",
        "min_amount as minAmount",
        "max_amount as maxAmount",
        "duration_days as durationDays",
        "daily_return_percent as dailyReturn",
        "total_return_percent as totalReturn",
        "features",
        "image_path as imagePath",
      )
      .where({ is_active: 1 });

    res.json({
      success: true,
      data: plans.map((p) => ({ ...p, features: p.features ? JSON.parse(p.features) : [] })),
    });
  }),
);

router.get(
  "/mine",
  requireAuth,
  asyncHandler(async (req, res) => {
    await creditPendingDailyProfitsIfDue(db, req.user.id);
    const rows = await db("investments")
      .join("investment_plans", "investments.plan_id", "investment_plans.id")
      .select(
        "investments.id",
        "investments.amount",
        "investments.status",
        "investments.start_date as startDate",
        "investments.end_date as endDate",
        "investments.expected_return as expectedReturn",
        "investments.claimed_earning as claimedEarning",
        "investments.payout_daily_return_percent as payoutDailyReturnPercent",
        "investment_plans.duration_days as durationDays",
        "investment_plans.daily_return_percent as dailyReturnPercent",
        "investment_plans.payout_daily_return_percent as planPayoutDailyReturnPercent",
        "investment_plans.total_return_percent as totalReturnPercent",
        "investment_plans.name as planName",
      )
      .where("investments.user_id", req.user.id)
      .orderBy("investments.created_at", "desc");

    const profitRows = await db("investment_daily_profits")
      .where("user_id", req.user.id)
      .select("investment_id as investmentId")
      .sum({ total: "amount" })
      .groupBy("investment_id");
    const creditedByInvestment = new Map(profitRows.map((item) => [Number(item.investmentId), Number(item.total || 0)]));

    res.json({
      success: true,
      data: rows.map((item) => {
        const amount = Number(item.amount || 0);
        const durationDays = Math.max(1, Number(item.durationDays || 1));
        const displayDailyPct = Number(item.dailyReturnPercent || 0);
        const payoutDailyPct = resolvePayoutDailyPercent(item);
        const totalReturnPct = Number(item.totalReturnPercent || 0);
        const profitFromDaily =
          displayDailyPct > 0 ? Number((amount * (displayDailyPct / 100) * durationDays).toFixed(4)) : 0;
        const payoutProfitFromDaily =
          payoutDailyPct > 0 ? Number((amount * (payoutDailyPct / 100) * durationDays).toFixed(4)) : 0;
        const profitFromTotal =
          totalReturnPct > 0 ? Number((amount * (totalReturnPct / 100)).toFixed(4)) : 0;
        const storedExpected = Number(item.expectedReturn || 0);
        const expectedReturn =
          profitFromDaily > 0
            ? Number((amount + profitFromDaily).toFixed(4))
            : profitFromTotal > 0
              ? Number((amount + profitFromTotal).toFixed(4))
              : storedExpected;
        const profit = Math.max(0, Number((expectedReturn - amount).toFixed(4)));
        const payoutProfit =
          payoutProfitFromDaily > 0
            ? payoutProfitFromDaily
            : profitFromTotal > 0
              ? profitFromTotal
              : Math.max(0, Number((storedExpected - amount).toFixed(4)));
        const claimedEarning = Number(creditedByInvestment.get(Number(item.id)) || item.claimedEarning || 0);
        const accruedEarning = claimedEarning;
        const availableEarning = Math.max(0, Number((payoutProfit - claimedEarning).toFixed(4)));
        const completedDays = getCompletedDays(item.startDate, item.durationDays);
        const progressPercent = Number(((completedDays / Math.max(1, Number(item.durationDays || 1))) * 100).toFixed(2));
        const maturityDate = getMaturityDate(item.startDate, item.durationDays);
        return {
          ...item,
          amount,
          expectedReturn,
          profit,
          claimedEarning,
          accruedEarning,
          availableEarning,
          completedDays,
          progressPercent,
          maturityDate: formatProfitLocalYmd(maturityDate),
          canClaim: false,
          canWithdrawEarning: item.status === "active" && availableEarning > 0,
        };
      }),
    });
  }),
);

router.post(
  "/invest",
  requireAuth,
  validate(investSchema),
  asyncHandler(async (req, res) => {
    const plan = await db("investment_plans").where({ id: req.body.planId, is_active: 1 }).first();
    if (!plan) throw new ApiError(404, "Plan not found");
    if (Number(req.body.amount) < Number(plan.min_amount)) throw new ApiError(400, "Amount below minimum");
    if (plan.max_amount && Number(req.body.amount) > Number(plan.max_amount)) throw new ApiError(400, "Amount above maximum");

    await db.transaction(async (trx) => {
      const amount = Number(req.body.amount);
      const durationDays = Math.max(1, Number(plan.duration_days || 1));
      const displayDailyPct = Number(plan.daily_return_percent || 0);
      const payoutDailyPct = resolvePlanPayoutDailyPercent(plan);
      const totalPct = Number(plan.total_return_percent || 0);
      const profitAmount =
        displayDailyPct > 0
          ? Number((amount * (displayDailyPct / 100) * durationDays).toFixed(4))
          : Number((amount * (totalPct / 100)).toFixed(4));
      const expectedReturn = Number((amount + profitAmount).toFixed(4));
      const reference = `INV-${Date.now()}`;

      // Deposits stay locked until used in an investment.
      const wallet = await getOrCreateWallet(db, req.user.id, trx);
      const current = await trx("wallets").where({ id: wallet.id }).forUpdate().first();
      const lockedBalance = Number(current.locked_balance || 0);
      const consumeLocked = Math.min(lockedBalance, amount);
      if (consumeLocked > 0) {
        await trx("wallets")
          .where({ id: wallet.id })
          .update({
            locked_balance: Number((lockedBalance - consumeLocked).toFixed(2)),
            updated_at: trx.fn.now(),
          });
      }

      await adjustWalletBalance(db, { userId: req.user.id, delta: -amount, reason: "investment", reference }, trx);
      await trx("investments").insert({
        user_id: req.user.id,
        plan_id: plan.id,
        amount,
        status: "active",
        start_date: trx.fn.now(),
        expected_return: expectedReturn,
        payout_daily_return_percent: payoutDailyPct,
        claimed_earning: 0,
      });
      await trx("transactions").insert({
        user_id: req.user.id,
        type: "investment",
        amount,
        status: "active",
        method: plan.name,
        reference,
      });
      await trx("notifications").insert({
        user_id: req.user.id,
        title: "Investment activated",
        message: `${plan.name} investment of $${amount.toFixed(2)} is now active.`,
      });

      const commissions = await applyCommissions(db, {
        sourceUserId: req.user.id,
        sourceAmount: amount,
        reference,
      }, trx);

      for (const commission of commissions) {
        await adjustWalletBalance(db, {
          userId: commission.referrerId,
          delta: commission.amount,
          reason: "commission",
          reference,
        }, trx);
        await trx("transactions").insert({
          user_id: commission.referrerId,
          type: "commission",
          amount: commission.amount,
          status: "completed",
          method: `referral_level_${commission.level}`,
          reference,
        });
      }
    });

    res.status(201).json({ success: true, message: "Investment placed successfully" });
  }),
);

router.post(
  "/:id/withdraw-earning",
  requireAuth,
  asyncHandler(async (req, res) => {
    const investmentId = Number(req.params.id);
    if (!investmentId) throw new ApiError(400, "Invalid investment ID");

    const investment = await db("investments").where({ id: investmentId, user_id: req.user.id }).first();
    if (!investment) throw new ApiError(404, "Investment not found");

    const credited = await creditPendingDailyProfitsIfDue(db, req.user.id, { force: true });
    if (credited.credited <= 0) throw new ApiError(400, "No new daily profit is available yet");
    res.json({
      success: true,
      message: "Daily profit credited to wallet",
      data: { credited: credited.credited, entries: credited.entries },
    });
  }),
);

router.post(
  "/:id/claim",
  requireAuth,
  asyncHandler(async (req, res) => {
    const investmentId = Number(req.params.id);
    if (!investmentId) throw new ApiError(400, "Invalid investment ID");

    if (!env.enablePrincipalRefund) {
      throw new ApiError(
        400,
        "Principal refund is disabled. Your investment stays active for the full plan term and principal is not returned to wallet.",
      );
    }

    const payout = await db.transaction(async (trx) => {
      await creditPendingDailyProfits(db, req.user.id, trx);
      const investment = await trx("investments")
        .join("investment_plans", "investments.plan_id", "investment_plans.id")
        .select(
          "investments.id",
          "investments.user_id as userId",
          "investments.status",
          "investments.amount",
          "investments.start_date as startDate",
          "investment_plans.duration_days as durationDays",
          "investment_plans.name as planName",
        )
        .where("investments.id", investmentId)
        .where("investments.user_id", req.user.id)
        .first();
      if (!investment) throw new ApiError(404, "Investment not found");
      if (investment.status !== "active") throw new ApiError(400, "Investment already claimed");

      const completedDays = getCompletedDays(investment.startDate, investment.durationDays);
      if (completedDays < Math.max(1, Number(investment.durationDays || 1))) {
        const maturityDate = formatProfitLocalYmd(getMaturityDate(investment.startDate, investment.durationDays));
        throw new ApiError(400, `Investment matures on ${maturityDate}`);
      }

      const principal = Number(investment.amount || 0);
      const reference = `INV-CLM-${investment.id}-${Date.now()}`;
      await adjustWalletBalance(
        db,
        {
          userId: req.user.id,
          delta: principal,
          reason: "investment_principal_return",
          reference,
        },
        trx,
      );
      const wallet = await getOrCreateWallet(db, req.user.id, trx);
      const lockedRow = await trx("wallets").where({ id: wallet.id }).forUpdate().first();
      await trx("wallets")
        .where({ id: wallet.id })
        .update({
          locked_balance: Number((Number(lockedRow.locked_balance || 0) + principal).toFixed(2)),
          updated_at: trx.fn.now(),
        });

      await trx("investments")
        .where({ id: investment.id })
        .update({ status: "completed", end_date: trx.fn.now(), updated_at: trx.fn.now() });
      await trx("notifications").insert({
        user_id: req.user.id,
        title: "Investment completed",
        message: `Principal $${principal.toFixed(2)} from ${investment.planName} returned to wallet and remains locked for reinvestment.`,
      });
      return principal;
    });

    res.json({
      success: true,
      message: "Investment principal credited to wallet",
      data: { payout },
    });
  }),
);

module.exports = router;
