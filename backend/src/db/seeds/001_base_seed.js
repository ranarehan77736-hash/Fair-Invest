const bcrypt = require("bcryptjs");

/**
 * @param {import('knex').Knex} knex
 */
exports.seed = async function seed(knex) {
  await knex("audit_logs").del();
  await knex("admin_actions").del();
  await knex("chat_messages").del();
  await knex("chat_rooms").del();
  await knex("notifications").del();
  await knex("commissions").del();
  await knex("referral_relations").del();
  await knex("referral_links").del();
  await knex("referral_codes").del();
  await knex("transactions").del();
  await knex("withdrawals").del();
  await knex("deposits").del();
  await knex("investments").del();
  await knex("investment_plans").del();
  await knex("wallet_ledger").del();
  await knex("wallets").del();
  await knex("settings").del();
  await knex("two_factor").del();
  await knex("sessions").del();
  await knex("users").del();
  await knex("roles").del();

  await knex("roles").insert([{ id: 1, name: "user" }, { id: 2, name: "admin" }]);

  const password = await bcrypt.hash("Admin@12345", 10);
  await knex("users").insert([
    {
      id: 1,
      role_id: 2,
      name: "Admin User",
      email: "admin@fairinvest.site",
      phone: "+92 300 0000000",
      password_hash: password,
      is_verified: true,
      country: "Pakistan",
    },
    {
      id: 2,
      role_id: 1,
      name: "Rana Rehan",
      email: "ranarehan77736@gmail.com",
      phone: "+92 300 1234567",
      password_hash: password,
      is_verified: true,
      country: "Pakistan",
    },
  ]);

  await knex("wallets").insert([
    { user_id: 1, balance: 0, locked_balance: 0 },
    { user_id: 2, balance: 1000, locked_balance: 0 },
  ]);

  await knex("settings").insert([
    { user_id: 1, email_notifications: true, sms_notifications: false, investment_updates: true, referral_activity: true },
  ]);

  await knex("investment_plans").insert([
    {
      slug: "starter",
      name: "Starter Plan",
      min_amount: 1,
      max_amount: 999,
      duration_days: 365,
      daily_return_percent: 2,
      total_return_percent: 730,
      features: JSON.stringify(["24/7 tracking", "Fast activation", "Basic analytics", "Referral eligible"]),
    },
    {
      slug: "professional",
      name: "Professional Plan",
      min_amount: 1000,
      max_amount: 4999,
      duration_days: 365,
      daily_return_percent: 3,
      total_return_percent: 1095,
      features: JSON.stringify(["Priority support", "Weekly reports", "Higher referral bonus"]),
    },
    {
      slug: "elite",
      name: "Elite Plan",
      min_amount: 5000,
      max_amount: null,
      duration_days: 365,
      daily_return_percent: 4,
      total_return_percent: 1460,
      features: JSON.stringify(["VIP support", "Premium analytics", "Unlimited allocation"]),
    },
  ]);

  const hasPaymentAccountsTable = await knex.schema.hasTable("payment_accounts");
  let paymentAccountId = null;
  if (hasPaymentAccountsTable) {
    await knex("payment_accounts").del();
    const insertedAccounts = await knex("payment_accounts").insert([
      {
        id: 1,
        method: "digit_plus",
        display_name: "Digitt+ / Raast (Scan & Pay)",
        account_title: "MashAllah Bhatti Mobilee",
        account_number: "346584733",
        phone: "346584733",
        instructions: "Scan the QR code or enter Till ID 346584733 in Digitt+ / Raast / banking apps. Make payment, take screenshot, and upload proof below.",
        logo_path: "/images/digitt_plus_scan_pay.png",
        is_active: true,
        sort_order: 1,
      },
      {
        id: 2,
        method: "bank_transfer",
        display_name: "Meezan Bank",
        account_title: "FairInvest Treasury",
        account_number: "0101-0203040506",
        iban: "PK36MEZN0001010203040506",
        instructions: "Send deposit to this account and upload the receipt screenshot.",
        logo_path: "/bank-logos/meezan.png",
        is_active: true,
        sort_order: 2,
      },
      {
        id: 3,
        method: "easypaisa",
        display_name: "Easypaisa Official",
        account_title: "FairInvest Official",
        account_number: "0300-1234567",
        phone: "0300-1234567",
        instructions: "Send via Easypaisa and submit transaction ID with screenshot.",
        logo_path: "/bank-logos/easypaisa.png",
        is_active: true,
        sort_order: 3,
      },
    ]);
    paymentAccountId = (Array.isArray(insertedAccounts) ? insertedAccounts[0] : insertedAccounts) || 1;
  }

  await knex("deposits").insert([
    {
      id: 1,
      user_id: 2,
      payment_account_id: paymentAccountId,
      amount: 100.00,
      method: "easypaisa",
      status: "pending",
      reference: "DEP-100201",
      proof_path: null,
      created_at: new Date(),
    },
    {
      id: 2,
      user_id: 2,
      payment_account_id: paymentAccountId,
      amount: 250.00,
      method: "bank_transfer",
      status: "completed",
      reference: "DEP-100202",
      proof_path: null,
      created_at: new Date(Date.now() - 86400000),
    },
  ]);

  await knex("withdrawals").insert([
    {
      id: 1,
      user_id: 2,
      amount: 50.00,
      method: "bank_transfer",
      account_details: JSON.stringify({ walletAddress: "TQ1a2b3c4d5e6f7g8h9i0j" }),
      status: "pending",
      created_at: new Date(),
    },
  ]);

  await knex("transactions").insert([
    {
      id: 1,
      user_id: 2,
      amount: 250.00,
      type: "deposit",
      status: "completed",
      method: "easypaisa",
      reference: "DEP-100202",
      created_at: new Date(Date.now() - 86400000),
    },
    {
      id: 2,
      user_id: 2,
      amount: 100.00,
      type: "deposit",
      status: "pending",
      method: "easypaisa",
      reference: "DEP-100201",
      created_at: new Date(),
    },
  ]);

  const hasSocialTable = await knex.schema.hasTable("social_links");
  if (hasSocialTable) {
    await knex("social_links").del();
    await knex("social_links").insert([
      { platform: "whatsapp", url: "https://whatsapp.com/channel/0029Vb9YnsS4dTnBGIVclZ1r", is_active: true },
      { platform: "telegram", url: "https://t.me/fairinvest", is_active: true },
    ]);
  }

  const hasSiteLinksTable = await knex.schema.hasTable("site_links");
  if (hasSiteLinksTable) {
    await knex("site_links").del();
    await knex("site_links").insert([
      { title: "Follow the Fair invest Official channel on WhatsApp", url: "https://whatsapp.com/channel/0029Vb9YnsS4dTnBGIVclZ1r", sort_order: 1, is_active: 1 },
      { title: "Telegram VIP Community", url: "https://t.me/fairinvest", sort_order: 2, is_active: 1 },
    ]);
  }
};
