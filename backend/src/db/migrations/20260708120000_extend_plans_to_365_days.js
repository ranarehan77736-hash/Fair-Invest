/**
 * Extend active plans to 365 days continuous earning.
 * Also disables automatic 30-day principal refund cycle by aligning
 * existing incomplete-duration plans with the new long term.
 *
 * @param { import("knex").Knex } knex
 */
exports.up = async function up(knex) {
  // Convert common short plans (30/60/90) to 365 continuous days.
  await knex("investment_plans")
    .whereIn("duration_days", [30, 60, 90])
    .update({
      duration_days: 365,
      // Keep existing daily_return / payout_daily as-is.
      // total_return ≈ daily_return display × 365 when daily exists; otherwise leave.
      updated_at: knex.fn.now(),
    });

  // Recalculate total_return for plans that have a display daily %.
  const plans = await knex("investment_plans").select("id", "daily_return_percent", "total_return_percent", "duration_days");
  for (const plan of plans) {
    const daily = Number(plan.daily_return_percent || 0);
    if (daily > 0 && Number(plan.duration_days) === 365) {
      await knex("investment_plans")
        .where({ id: plan.id })
        .update({
          total_return_percent: Number((daily * 365).toFixed(2)),
          updated_at: knex.fn.now(),
        });
    }
  }
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = async function down(knex) {
  // Non-reversible safely — leave durations as-is.
};
