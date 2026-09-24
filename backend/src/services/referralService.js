const RATES_BY_LEVEL = {
  1: 10,
  2: 5,
  3: 2,
};

async function applyCommissions(db, { sourceUserId, sourceAmount, reference }, trx) {
  const q = trx || db;
  const relations = await q("referral_relations")
    .where({ referee_id: sourceUserId })
    .whereIn("level", [1, 2, 3]);
  const payouts = [];

  for (const relation of relations) {
    const rate = RATES_BY_LEVEL[relation.level] || 0;
    const amount = Number(sourceAmount) * (rate / 100);
    if (amount <= 0) continue;
    await q("commissions").insert({
      user_id: relation.referrer_id,
      source_user_id: sourceUserId,
      amount,
      rate_percent: rate,
      status: "completed",
      reference,
    });
    payouts.push({ referrerId: relation.referrer_id, amount, rate, level: relation.level });
  }

  return payouts;
}

module.exports = { applyCommissions };
