/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  const exists = await knex.schema.hasTable("social_links");
  if (!exists) {
    await knex.schema.createTable("social_links", (table) => {
      table.increments("id").primary();
      table.string("platform", 32).notNullable().unique();
      table.string("url", 500).nullable();
      table.boolean("is_active").notNullable().defaultTo(false);
      table.timestamps(true, true);
    });
  }
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("social_links");
};
