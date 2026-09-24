/**
 * Pre-signup OTP rows have no user yet; user_id must be nullable.
 * @param {import("knex").Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.alterTable("otps", (table) => {
    table.integer("user_id").unsigned().nullable().alter();
  });
};

exports.down = async function down(knex) {
  await knex("otps").whereNull("user_id").del();
  await knex.schema.alterTable("otps", (table) => {
    table.integer("user_id").unsigned().notNullable().alter();
  });
};
