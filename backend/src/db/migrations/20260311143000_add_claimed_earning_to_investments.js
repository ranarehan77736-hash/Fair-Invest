/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  const hasInvestments = await knex.schema.hasTable("investments");
  if (!hasInvestments) return;
  const hasClaimedEarning = await knex.schema.hasColumn("investments", "claimed_earning");
  if (hasClaimedEarning) return;
  await knex.schema.alterTable("investments", (table) => {
    table.decimal("claimed_earning", 18, 4).notNullable().defaultTo(0);
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  const hasInvestments = await knex.schema.hasTable("investments");
  if (!hasInvestments) return;
  const hasClaimedEarning = await knex.schema.hasColumn("investments", "claimed_earning");
  if (!hasClaimedEarning) return;
  await knex.schema.alterTable("investments", (table) => {
    table.dropColumn("claimed_earning");
  });
};
