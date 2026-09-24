function toNumber(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

/**
 * Wallet credit rate — must NEVER use display daily_return_percent.
 * Plan payout (admin) is authoritative so every active user on a plan gets the same rate.
 */
function resolvePayoutDailyPercent(item) {
  const planPayout = toNumber(item.planPayoutDailyReturnPercent);
  if (planPayout > 0) return planPayout;

  const locked = toNumber(item.payoutDailyReturnPercent);
  if (locked > 0) return locked;

  const durationDays = Math.max(1, toNumber(item.durationDays, 1));
  const totalReturnPct = toNumber(item.totalReturnPercent);
  if (totalReturnPct > 0) {
    return Number((totalReturnPct / durationDays).toFixed(4));
  }

  return 1;
}

function resolvePlanPayoutDailyPercent(plan) {
  const payout = toNumber(plan?.payout_daily_return_percent ?? plan?.payoutDailyReturnPercent);
  return payout > 0 ? payout : 1;
}

module.exports = { resolvePayoutDailyPercent, resolvePlanPayoutDailyPercent, toNumber };
