/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  const hasDeposits = await knex.schema.hasTable("deposits");
  if (!hasDeposits) return;

  const hasProofPath = await knex.schema.hasColumn("deposits", "proof_path");
  const hasPaymentAccountId = await knex.schema.hasColumn("deposits", "payment_account_id");

  await knex.schema.alterTable("deposits", (table) => {
    if (!hasProofPath) table.string("proof_path", 255).nullable();
    if (!hasPaymentAccountId) table.integer("payment_account_id").unsigned().nullable().references("id").inTable("payment_accounts");
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  const hasDeposits = await knex.schema.hasTable("deposits");
  if (!hasDeposits) return;

  const hasProofPath = await knex.schema.hasColumn("deposits", "proof_path");
  const hasPaymentAccountId = await knex.schema.hasColumn("deposits", "payment_account_id");

  await knex.schema.alterTable("deposits", (table) => {
    if (hasProofPath) table.dropColumn("proof_path");
    if (hasPaymentAccountId) table.dropColumn("payment_account_id");
  });
};
