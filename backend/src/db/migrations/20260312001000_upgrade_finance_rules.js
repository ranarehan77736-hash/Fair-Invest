/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.alterTable("users", (table) => {
    table.string("address", 255).nullable();
    table.string("city", 120).nullable();
    table.string("postal_code", 40).nullable();
    table.string("national_id", 64).nullable();
    table.date("date_of_birth").nullable();
  });

  await knex.schema.alterTable("withdrawals", (table) => {
    table.decimal("approved_amount", 18, 2).nullable();
    table.decimal("refund_amount", 18, 2).nullable();
    table.text("admin_reason").nullable();
    table.timestamp("processed_at").nullable();
    table.integer("processed_by").unsigned().nullable().references("id").inTable("users").onDelete("SET NULL");
  });

  await knex.schema.createTable("investment_daily_profits", (table) => {
    table.increments("id").primary();
    table.integer("investment_id").unsigned().notNullable().references("id").inTable("investments").onDelete("CASCADE");
    table.integer("user_id").unsigned().notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.integer("day_index").notNullable();
    table.decimal("amount", 18, 4).notNullable();
    table.string("reference", 120).nullable();
    table.timestamps(true, true);
    table.unique(["investment_id", "day_index"]);
  });

  if (knex.client.config.client !== 'sqlite3') {
    await knex.raw(`
      ALTER TABLE payment_accounts
      MODIFY method ENUM('bank_transfer','easypaisa','jazzcash','nayapay','sadapay','digit_plus','crypto') NOT NULL
    `);
    await knex.raw(`
      ALTER TABLE deposits
      MODIFY method ENUM('bank_transfer','easypaisa','jazzcash','nayapay','sadapay','digit_plus','crypto') NOT NULL
    `);
    await knex.raw(`
      ALTER TABLE withdrawals
      MODIFY method ENUM('bank_transfer','easypaisa','jazzcash','nayapay','sadapay','digit_plus','crypto') NOT NULL
    `);
    await knex.raw(`
      ALTER TABLE deposits
      MODIFY status ENUM('pending','completed','rejected') NOT NULL DEFAULT 'pending'
    `);
  }
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  if (knex.client.config.client !== 'sqlite3') {
    await knex.raw(`
      ALTER TABLE deposits
      MODIFY status ENUM('pending','completed','failed') NOT NULL DEFAULT 'pending'
    `);
    await knex.raw(`
      ALTER TABLE withdrawals
      MODIFY method ENUM('bank_transfer','easypaisa') NOT NULL
    `);
    await knex.raw(`
      ALTER TABLE deposits
      MODIFY method ENUM('card','bank_transfer','easypaisa') NOT NULL
    `);
    await knex.raw(`
      ALTER TABLE payment_accounts
      MODIFY method ENUM('bank_transfer','easypaisa') NOT NULL
    `);
  }

  await knex.schema.dropTableIfExists("investment_daily_profits");

  await knex.schema.alterTable("withdrawals", (table) => {
    table.dropForeign(["processed_by"]);
    table.dropColumn("processed_by");
    table.dropColumn("processed_at");
    table.dropColumn("admin_reason");
    table.dropColumn("refund_amount");
    table.dropColumn("approved_amount");
  });

  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("date_of_birth");
    table.dropColumn("national_id");
    table.dropColumn("postal_code");
    table.dropColumn("city");
    table.dropColumn("address");
  });
};
