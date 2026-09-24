const ApiError = require("../utils/ApiError");

async function getOrCreateWallet(db, userId, trx = null) {
  const q = trx || db;
  let wallet = await q("wallets").where({ user_id: userId }).first();
  if (!wallet) {
    const [id] = await q("wallets").insert({ user_id: userId, balance: 0, locked_balance: 0 });
    wallet = await q("wallets").where({ id }).first();
  }
  return wallet;
}

async function adjustWalletBalance(db, { userId, delta, reason, reference }, trx) {
  const q = trx || db;
  const wallet = await getOrCreateWallet(db, userId, q);
  const nextBalance = Number(wallet.balance) + Number(delta);
  if (nextBalance < 0) {
    throw new ApiError(400, "Insufficient wallet balance");
  }
  await q("wallets").where({ id: wallet.id }).update({ balance: nextBalance, updated_at: q.fn.now() });
  await q("wallet_ledger").insert({
    wallet_id: wallet.id,
    entry_type: Number(delta) >= 0 ? "credit" : "debit",
    amount: Math.abs(Number(delta)),
    reason,
    reference: reference || null,
  });
  return nextBalance;
}

module.exports = { getOrCreateWallet, adjustWalletBalance };
