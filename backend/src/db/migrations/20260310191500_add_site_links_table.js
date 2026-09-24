/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  const exists = await knex.schema.hasTable("site_links");
  if (!exists) {
    await knex.schema.createTable("site_links", (table) => {
      table.increments("id").primary();
      table.string("title", 120).notNullable();
      table.string("url", 500).notNullable();
      table.boolean("is_active").notNullable().defaultTo(true);
      table.integer("sort_order").notNullable().defaultTo(0);
      table.timestamps(true, true);
    });
  }
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("site_links");
};
