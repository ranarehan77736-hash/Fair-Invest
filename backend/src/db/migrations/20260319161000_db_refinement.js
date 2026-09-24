/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .table('transactions', table => {
      if (!knex.schema.hasColumn('transactions', 'reason')) {
        table.string('reason', 120).nullable().after('amount');
      }
    })
    .table('otps', table => {
      table.string('type', 32).notNullable().defaultTo('verification').after('code');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .table('otps', table => {
      table.dropColumn('type');
    })
    .table('transactions', table => {
      table.dropColumn('reason');
    });
};
