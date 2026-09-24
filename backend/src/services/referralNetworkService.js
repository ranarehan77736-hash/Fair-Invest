/**
 * All users in referral_relations where referrer_id = this user (all levels).
 * @param {import("knex").Knex} db
 * @param {number} referrerUserId
 * @returns {Promise<Array<object>>}
 */
async function getEnrichedReferralNetwork(db, referrerUserId) {
  const refs = await db("referral_relations")
    .join("users", "referral_relations.referee_id", "users.id")
    .select(
      "users.id",
      "users.name",
      "users.email",
      "users.phone",
      "users.created_at as joinedAt",
      "referral_relations.level",
    )
    .where("referral_relations.referrer_id", referrerUserId)
    .orderBy("users.created_at", "desc");

  if (!refs.length) return [];

  const userIds = refs.map((item) => item.id);
  const investmentRows = await db("investments")
    .whereIn("user_id", userIds)
    .groupBy("user_id")
    .select("user_id as userId")
    .sum({ totalInvested: "amount" })
    .count({ investmentCount: "id" });
  const investmentByUser = new Map(
    investmentRows.map((item) => [
      Number(item.userId),
      {
        totalInvested: Number(item.totalInvested || 0),
        investmentCount: Number(item.investmentCount || 0),
      },
    ]),
  );

  const depositRows = await db("deposits")
    .whereIn("user_id", userIds)
    .where("status", "completed")
    .groupBy("user_id")
    .select("user_id as userId")
    .sum({ totalDeposits: "amount" })
    .count({ completedDepositCount: "id" });
  const depositByUser = new Map(
    depositRows.map((item) => [
      Number(item.userId),
      {
        totalDeposits: Number(item.totalDeposits || 0),
        completedDepositCount: Number(item.completedDepositCount || 0),
      },
    ]),
  );

  const withdrawalRows = await db("withdrawals")
    .whereIn("user_id", userIds)
    .where("status", "completed")
    .groupBy("user_id")
    .select("user_id as userId")
    .sum({ totalWithdrawals: db.raw("COALESCE(approved_amount, amount)") })
    .count({ completedWithdrawalCount: "id" });
  const withdrawalByUser = new Map(
    withdrawalRows.map((item) => [
      Number(item.userId),
      {
        totalWithdrawals: Number(item.totalWithdrawals || 0),
        completedWithdrawalCount: Number(item.completedWithdrawalCount || 0),
      },
    ]),
  );

  return refs.map((item) => {
    const uid = Number(item.id);
    const investmentMeta = investmentByUser.get(uid) || { totalInvested: 0, investmentCount: 0 };
    const depositMeta = depositByUser.get(uid) || { totalDeposits: 0, completedDepositCount: 0 };
    const withdrawalMeta = withdrawalByUser.get(uid) || { totalWithdrawals: 0, completedWithdrawalCount: 0 };
    return {
      ...item,
      username: item.name,
      isDirect: Number(item.level) === 1,
      totalInvested: investmentMeta.totalInvested,
      investmentCount: investmentMeta.investmentCount,
      totalDeposits: depositMeta.totalDeposits,
      completedDepositCount: depositMeta.completedDepositCount,
      totalWithdrawals: withdrawalMeta.totalWithdrawals,
      completedWithdrawalCount: withdrawalMeta.completedWithdrawalCount,
    };
  });
}

module.exports = { getEnrichedReferralNetwork };
