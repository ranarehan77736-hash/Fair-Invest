/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  const hasPaymentAccounts = await knex.schema.hasTable("payment_accounts");
  if (hasPaymentAccounts) {
    const hasLogoPath = await knex.schema.hasColumn("payment_accounts", "logo_path");
    if (!hasLogoPath) {
      await knex.schema.alterTable("payment_accounts", (table) => {
        table.string("logo_path", 255).nullable();
      });
    }
  }

  const hasPlans = await knex.schema.hasTable("investment_plans");
  if (hasPlans) {
    const hasImagePath = await knex.schema.hasColumn("investment_plans", "image_path");
    if (!hasImagePath) {
      await knex.schema.alterTable("investment_plans", (table) => {
        table.string("image_path", 255).nullable();
      });
    }
  }
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  const hasPaymentAccounts = await knex.schema.hasTable("payment_accounts");
  if (hasPaymentAccounts) {
    const hasLogoPath = await knex.schema.hasColumn("payment_accounts", "logo_path");
    if (hasLogoPath) {
      await knex.schema.alterTable("payment_accounts", (table) => {
        table.dropColumn("logo_path");
      });
    }
  }

  const hasPlans = await knex.schema.hasTable("investment_plans");
  if (hasPlans) {
    const hasImagePath = await knex.schema.hasColumn("investment_plans", "image_path");
    if (hasImagePath) {
      await knex.schema.alterTable("investment_plans", (table) => {
        table.dropColumn("image_path");
      });
    }
  }
};
