/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  const addIndex = async (table, columns, indexName) => {
    const hasTable = await knex.schema.hasTable(table);
    if (!hasTable) return;
    try {
      await knex.schema.alterTable(table, (t) => {
        t.index(columns, indexName);
      });
    } catch {
      // Index may already exist on some environments.
    }
  };

  await addIndex("investments", ["user_id", "status"], "idx_investments_user_status");
  await addIndex("investment_daily_profits", ["investment_id"], "idx_inv_daily_profits_investment");
  await addIndex("investment_daily_profits", ["user_id"], "idx_inv_daily_profits_user");
  await addIndex("transactions", ["user_id", "created_at"], "idx_transactions_user_created");
  await addIndex("chat_messages", ["room_id", "created_at"], "idx_chat_messages_room_created");
  await addIndex("chat_messages", ["room_id", "sender_role"], "idx_chat_messages_room_sender");
  await addIndex("notifications", ["user_id", "is_read"], "idx_notifications_user_read");
  await addIndex("withdrawals", ["user_id", "status"], "idx_withdrawals_user_status");
  await addIndex("deposits", ["user_id", "status"], "idx_deposits_user_status");
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  const dropIndex = async (table, indexName) => {
    const hasTable = await knex.schema.hasTable(table);
    if (!hasTable) return;
    try {
      await knex.schema.alterTable(table, (t) => {
        t.dropIndex([], indexName);
      });
    } catch {
      // ignore
    }
  };

  await dropIndex("investments", "idx_investments_user_status");
  await dropIndex("investment_daily_profits", "idx_inv_daily_profits_investment");
  await dropIndex("investment_daily_profits", "idx_inv_daily_profits_user");
  await dropIndex("transactions", "idx_transactions_user_created");
  await dropIndex("chat_messages", "idx_chat_messages_room_created");
  await dropIndex("chat_messages", "idx_chat_messages_room_sender");
  await dropIndex("notifications", "idx_notifications_user_read");
  await dropIndex("withdrawals", "idx_withdrawals_user_status");
  await dropIndex("deposits", "idx_deposits_user_status");
};
