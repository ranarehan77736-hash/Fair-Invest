/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  const exists = await knex.schema.hasTable("payment_accounts");
  if (!exists) {
    await knex.schema.createTable("payment_accounts", (table) => {
      table.increments("id").primary();
      table.enum("method", ["bank_transfer", "easypaisa"]).notNullable();
      table.string("display_name", 120).notNullable();
      table.string("account_title", 120).nullable();
      table.string("account_number", 120).nullable();
      table.string("iban", 120).nullable();
      table.string("phone", 40).nullable();
      table.text("instructions").nullable();
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
  await knex.schema.dropTableIfExists("payment_accounts");
};
