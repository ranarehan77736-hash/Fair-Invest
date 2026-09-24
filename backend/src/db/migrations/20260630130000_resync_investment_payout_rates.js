/**
 * Re-sync active investments to each plan's payout_daily_return_percent.
 * Fixes rows locked at display rate (e.g. 3.5%) after admin set payout to 1%.
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  const hasPlanColumn = await knex.schema.hasColumn("investment_plans", "payout_daily_return_percent");
  const hasInvColumn = await knex.schema.hasColumn("investments", "payout_daily_return_percent");
  if (!hasPlanColumn || !hasInvColumn) return;

  if (knex.client.config.client === 'sqlite3') {
    const plans = await knex("investment_plans")
      .select("id", "payout_daily_return_percent")
      .whereNotNull("payout_daily_return_percent")
      .where("payout_daily_return_percent", ">", 0);
    for (const p of plans) {
      await knex("investments")
        .where("plan_id", p.id)
        .where("status", "active")
        .update({ payout_daily_return_percent: p.payout_daily_return_percent });
    }
  } else {
    await knex.raw(`
      UPDATE investments i
      INNER JOIN investment_plans p ON p.id = i.plan_id
      SET i.payout_daily_return_percent = p.payout_daily_return_percent
      WHERE i.status = 'active'
        AND p.payout_daily_return_percent IS NOT NULL
        AND p.payout_daily_return_percent > 0
    `);
  }
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down() {
  // no-op: cannot restore previous per-investment payout values
};
