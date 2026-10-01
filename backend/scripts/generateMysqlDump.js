const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const knex = require("knex")({ client: "mysql2" });

async function generate() {
  const statements = [];

  function record(sql) {
    if (!sql) return;
    const clean = sql.trim().replace(/;+$/, "") + ";";
    statements.push(clean);
  }

  const fakeKnex = new Proxy(knex, {
    get(target, prop) {
      if (prop === "schema") {
        return new Proxy(target.schema, {
          get(sTarget, sProp) {
            if (sProp === "createTable") {
              return (tableName, fn) => {
                const sqls = target.schema.createTable(tableName, fn).toSQL();
                sqls.forEach((s) => record(s.sql));
                return Promise.resolve();
              };
            }
            if (sProp === "table" || sProp === "alterTable") {
              return (tableName, fn) => {
                const sqls = target.schema.alterTable(tableName, fn).toSQL();
                sqls.forEach((s) => record(s.sql));
                return Promise.resolve();
              };
            }
            if (sProp === "hasTable") return () => Promise.resolve(false);
            if (sProp === "hasColumn") return () => Promise.resolve(false);
            return sTarget[sProp];
          },
        });
      }
      if (prop === "raw") {
        return (query) => {
          record(query);
          return Promise.resolve();
        };
      }
      if (prop === "fn") return target.fn;
      return target[prop];
    },
  });

  const migrationsDir = path.resolve(__dirname, "../src/db/migrations");
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".js") && !f.startsWith("."))
    .sort();

  for (const file of migrationFiles) {
    const migration = require(path.join(migrationsDir, file));
    if (typeof migration.up === "function") {
      try {
        await migration.up(fakeKnex);
      } catch (err) {
        // Some migrations might be data migrations, skip if they fail against mock
      }
    }
  }

  // Base Seeds
  const passwordHash = await bcrypt.hash("Admin@12345", 10);
  const now = "CURRENT_TIMESTAMP";

  const seedStatements = [
    `-- =============================================`,
    `-- INITIAL BASE SEED DATA`,
    `-- =============================================`,
    `INSERT INTO \`roles\` (\`id\`, \`name\`) VALUES (1, 'user'), (2, 'admin') ON DUPLICATE KEY UPDATE \`name\`=VALUES(\`name\`);`,
    `INSERT INTO \`users\` (\`id\`, \`role_id\`, \`name\`, \`email\`, \`phone\`, \`password_hash\`, \`is_verified\`, \`country\`) VALUES (1, 2, 'Admin User', 'admin@fairinvest.site', '+92 300 0000000', '${passwordHash}', 1, 'Pakistan') ON DUPLICATE KEY UPDATE \`email\`=VALUES(\`email\`);`,
    `INSERT INTO \`wallets\` (\`id\`, \`user_id\`, \`balance\`, \`locked_balance\`) VALUES (1, 1, 0.00, 0.00) ON DUPLICATE KEY UPDATE \`balance\`=VALUES(\`balance\`);`,
    `INSERT INTO \`settings\` (\`id\`, \`user_id\`, \`email_notifications\`, \`sms_notifications\`, \`investment_updates\`, \`referral_activity\`) VALUES (1, 1, 1, 0, 1, 1) ON DUPLICATE KEY UPDATE \`user_id\`=VALUES(\`user_id\`);`,
    `INSERT INTO \`investment_plans\` (\`id\`, \`slug\`, \`name\`, \`min_amount\`, \`max_amount\`, \`duration_days\`, \`daily_return_percent\`, \`total_return_percent\`, \`features\`, \`is_active\`) VALUES
(1, 'starter', 'Starter Plan', 1.00, 999.00, 365, 2.00, 730.00, '["24/7 tracking", "Fast activation", "Basic analytics", "Referral eligible"]', 1),
(2, 'professional', 'Professional Plan', 1000.00, 4999.00, 365, 3.00, 1095.00, '["Priority support", "Weekly reports", "Higher referral bonus"]', 1),
(3, 'elite', 'Elite Plan', 5000.00, NULL, 365, 4.00, 1460.00, '["VIP support", "Premium analytics", "Unlimited allocation"]', 1)
ON DUPLICATE KEY UPDATE \`slug\`=VALUES(\`slug\`);`,
    `INSERT INTO \`social_links\` (\`id\`, \`platform\`, \`url\`, \`is_active\`) VALUES
(1, 'whatsapp', 'https://chat.whatsapp.com/', 1),
(2, 'telegram', 'https://t.me/fairinvest', 1)
ON DUPLICATE KEY UPDATE \`platform\`=VALUES(\`platform\`);`,
    `INSERT INTO \`site_links\` (\`id\`, \`title\`, \`url\`, \`sort_order\`, \`is_active\`) VALUES
(1, 'Official WhatsApp Channel', 'https://whatsapp.com', 1, 1),
(2, 'Telegram VIP Community', 'https://telegram.org', 2, 1)
ON DUPLICATE KEY UPDATE \`title\`=VALUES(\`title\`);`,
    `-- Track migrations as applied so knex won't re-run them`,
    `INSERT INTO \`knex_migrations\` (\`name\`, \`batch\`, \`migration_time\`) VALUES
${migrationFiles.map((f, i) => `('${f}', 1, ${now})`).join(",\n")}
ON DUPLICATE KEY UPDATE \`name\`=VALUES(\`name\`);`,
  ];

  const header = `-- =======================================================
-- FairInvest Production MySQL / MariaDB Database Dump
-- Generated for cPanel phpMyAdmin / MySQL Import
-- Domain: fairinvest.site / api.fairinvest.site
-- Default Admin: admin@fairinvest.site
-- Default Admin Password: Admin@12345
-- =======================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS 
  \`audit_logs\`, 
  \`admin_actions\`, 
  \`chat_messages\`, 
  \`chat_rooms\`, 
  \`notifications\`, 
  \`commissions\`, 
  \`referral_relations\`, 
  \`referral_links\`, 
  \`referral_codes\`, 
  \`transactions\`, 
  \`withdrawals\`, 
  \`deposits\`, 
  \`investments\`, 
  \`investment_plans\`, 
  \`wallet_ledger\`, 
  \`wallets\`, 
  \`settings\`, 
  \`two_factor\`, 
  \`sessions\`, 
  \`users\`, 
  \`roles\`, 
  \`social_links\`, 
  \`site_links\`, 
  \`payment_accounts\`, 
  \`investment_daily_profits\`, 
  \`otps\`, 
  \`knex_migrations\`, 
  \`knex_migrations_lock\`;
`;

  const footer = `
SET FOREIGN_KEY_CHECKS = 1;
`;

  const fullSql = header + statements.join("\n") + "\n\n" + seedStatements.join("\n") + footer;

  const out1 = path.resolve(__dirname, "../../fairinvest_mysql_schema.sql");
  const out2 = path.resolve(__dirname, "../fairinvest_mysql_schema.sql");
  fs.writeFileSync(out1, fullSql, "utf8");
  fs.writeFileSync(out2, fullSql, "utf8");

  console.log(`Generated: ${out1} (${fullSql.length} bytes)`);
}

generate().catch(console.error);
