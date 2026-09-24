/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable("roles", (table) => {
    table.increments("id").primary();
    table.string("name", 32).notNullable().unique();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.integer("role_id").unsigned().notNullable().references("id").inTable("roles");
    table.string("name", 120).notNullable();
    table.string("email", 190).notNullable().unique();
    table.string("phone", 32).nullable();
    table.string("password_hash", 255).notNullable();
    table.boolean("is_blocked").notNullable().defaultTo(false);
    table.boolean("is_two_factor_enabled").notNullable().defaultTo(false);
    table.string("avatar_url", 255).nullable();
    table.string("country", 64).nullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("sessions", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.string("refresh_token", 512).notNullable();
    table.timestamp("expires_at").notNullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("two_factor", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.string("secret", 255).nullable();
    table.string("backup_code", 255).nullable();
    table.boolean("is_verified").notNullable().defaultTo(false);
    table.timestamps(true, true);
  });

  await knex.schema.createTable("settings", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.boolean("email_notifications").defaultTo(true);
    table.boolean("sms_notifications").defaultTo(false);
    table.boolean("investment_updates").defaultTo(true);
    table.boolean("referral_activity").defaultTo(true);
    table.timestamps(true, true);
  });

  await knex.schema.createTable("wallets", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().notNullable().references("id").inTable("users").onDelete("CASCADE").unique();
    table.decimal("balance", 18, 2).notNullable().defaultTo(0);
    table.decimal("locked_balance", 18, 2).notNullable().defaultTo(0);
    table.timestamps(true, true);
  });

  await knex.schema.createTable("wallet_ledger", (table) => {
    table.increments("id").primary();
    table.integer("wallet_id").unsigned().notNullable().references("id").inTable("wallets").onDelete("CASCADE");
    table.enum("entry_type", ["credit", "debit"]).notNullable();
    table.decimal("amount", 18, 2).notNullable();
    table.string("reason", 120).notNullable();
    table.string("reference", 120).nullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("investment_plans", (table) => {
    table.increments("id").primary();
    table.string("slug", 64).notNullable().unique();
    table.string("name", 120).notNullable();
    table.decimal("min_amount", 18, 2).notNullable();
    table.decimal("max_amount", 18, 2).nullable();
    table.integer("duration_days").notNullable();
    table.decimal("daily_return_percent", 8, 2).notNullable();
    table.decimal("total_return_percent", 8, 2).notNullable();
    table.json("features").nullable();
    table.boolean("is_active").defaultTo(true);
    table.timestamps(true, true);
  });

  await knex.schema.createTable("investments", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.integer("plan_id").unsigned().notNullable().references("id").inTable("investment_plans");
    table.decimal("amount", 18, 2).notNullable();
    table.enum("status", ["active", "completed", "cancelled"]).defaultTo("active");
    table.date("start_date").notNullable();
    table.date("end_date").nullable();
    table.decimal("expected_return", 18, 2).nullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("deposits", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.decimal("amount", 18, 2).notNullable();
    table.enum("method", ["card", "bank_transfer", "easypaisa"]).notNullable();
    table.enum("status", ["pending", "completed", "failed"]).defaultTo("pending");
    table.string("reference", 120).nullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("withdrawals", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.decimal("amount", 18, 2).notNullable();
    table.decimal("fee", 18, 2).notNullable().defaultTo(0);
    table.enum("method", ["bank_transfer", "easypaisa"]).notNullable();
    table.enum("status", ["pending", "processing", "completed", "rejected"]).defaultTo("pending");
    table.string("reference", 120).nullable();
    table.json("account_details").nullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("transactions", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.enum("type", ["deposit", "withdrawal", "investment", "earning", "commission"]).notNullable();
    table.decimal("amount", 18, 2).notNullable();
    table.enum("status", ["pending", "processing", "completed", "failed", "active"]).notNullable();
    table.string("method", 64).nullable();
    table.string("reference", 120).nullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("referral_codes", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().notNullable().references("id").inTable("users").onDelete("CASCADE").unique();
    table.string("code", 32).notNullable().unique();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("referral_links", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.string("token", 64).notNullable().unique();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("referral_relations", (table) => {
    table.increments("id").primary();
    table.integer("referrer_id").unsigned().notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.integer("referee_id").unsigned().notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.integer("level").notNullable().defaultTo(1);
    table.timestamps(true, true);
    table.unique(["referrer_id", "referee_id"]);
  });

  await knex.schema.createTable("commissions", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.integer("source_user_id").unsigned().notNullable().references("id").inTable("users");
    table.decimal("amount", 18, 2).notNullable();
    table.decimal("rate_percent", 6, 2).notNullable();
    table.enum("status", ["pending", "completed"]).defaultTo("completed");
    table.string("reference", 120).nullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("notifications", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.string("title", 160).notNullable();
    table.text("message").notNullable();
    table.boolean("is_read").notNullable().defaultTo(false);
    table.timestamps(true, true);
  });

  await knex.schema.createTable("chat_rooms", (table) => {
    table.increments("id").primary();
    table.string("room_key", 80).notNullable().unique();
    table.integer("user_id").unsigned().notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.integer("admin_id").unsigned().nullable().references("id").inTable("users");
    table.enum("status", ["open", "closed"]).defaultTo("open");
    table.timestamps(true, true);
  });

  await knex.schema.createTable("chat_messages", (table) => {
    table.increments("id").primary();
    table.integer("room_id").unsigned().notNullable().references("id").inTable("chat_rooms").onDelete("CASCADE");
    table.integer("sender_id").unsigned().nullable().references("id").inTable("users");
    table.string("sender_role", 32).notNullable();
    table.text("content").notNullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("admin_actions", (table) => {
    table.increments("id").primary();
    table.integer("admin_id").unsigned().notNullable().references("id").inTable("users");
    table.string("action", 120).notNullable();
    table.string("target_type", 64).nullable();
    table.string("target_id", 64).nullable();
    table.json("meta").nullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("audit_logs", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().nullable().references("id").inTable("users");
    table.string("event", 120).notNullable();
    table.string("ip_address", 64).nullable();
    table.string("method", 12).nullable();
    table.string("path", 255).nullable();
    table.json("payload").nullable();
    table.timestamps(true, true);
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("audit_logs");
  await knex.schema.dropTableIfExists("admin_actions");
  await knex.schema.dropTableIfExists("chat_messages");
  await knex.schema.dropTableIfExists("chat_rooms");
  await knex.schema.dropTableIfExists("notifications");
  await knex.schema.dropTableIfExists("commissions");
  await knex.schema.dropTableIfExists("referral_relations");
  await knex.schema.dropTableIfExists("referral_links");
  await knex.schema.dropTableIfExists("referral_codes");
  await knex.schema.dropTableIfExists("transactions");
  await knex.schema.dropTableIfExists("withdrawals");
  await knex.schema.dropTableIfExists("deposits");
  await knex.schema.dropTableIfExists("investments");
  await knex.schema.dropTableIfExists("investment_plans");
  await knex.schema.dropTableIfExists("wallet_ledger");
  await knex.schema.dropTableIfExists("wallets");
  await knex.schema.dropTableIfExists("settings");
  await knex.schema.dropTableIfExists("two_factor");
  await knex.schema.dropTableIfExists("sessions");
  await knex.schema.dropTableIfExists("users");
  await knex.schema.dropTableIfExists("roles");
};
