exports.up = async function (knex) {
  if (knex.client.config.client !== 'sqlite3') {
    await knex.raw(`
      ALTER TABLE payment_accounts
      MODIFY method ENUM('bank_transfer','opay','easypaisa','jazzcash','nayapay','sadapay','digit_plus','crypto') NOT NULL
    `);
    await knex.raw(`
      ALTER TABLE deposits
      MODIFY method ENUM('bank_transfer','opay','easypaisa','jazzcash','nayapay','sadapay','digit_plus','crypto') NOT NULL
    `);
    await knex.raw(`
      ALTER TABLE withdrawals
      MODIFY method ENUM('bank_transfer','opay','easypaisa','jazzcash','nayapay','sadapay','digit_plus','crypto') NOT NULL
    `);
    await knex.raw(`
      ALTER TABLE transactions
      MODIFY method ENUM('bank_transfer','opay','easypaisa','jazzcash','nayapay','sadapay','digit_plus','crypto') NOT NULL
    `);
  }
};

exports.down = async function () {};
