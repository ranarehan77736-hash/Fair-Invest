/**
 * Store exact investment start time (not date-only) so 24h profit cycles are accurate.
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  const hasTable = await knex.schema.hasTable("investments");
  if (!hasTable) return;

  if (knex.client.config.client !== 'sqlite3') {
    await knex.raw(`
      ALTER TABLE investments
      MODIFY start_date DATETIME NOT NULL
    `);

    await knex.raw(`
      UPDATE investments
      SET start_date = created_at
      WHERE start_date IS NULL OR start_date = '0000-00-00 00:00:00'
    `);
  }
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  if (knex.client.config.client !== 'sqlite3') {
    await knex.raw(`
      ALTER TABLE investments
      MODIFY start_date DATE NOT NULL
    `);
  }
};
