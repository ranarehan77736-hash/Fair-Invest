-- =======================================================
-- FairInvest Production MySQL / MariaDB Database Dump
-- Compatible with cPanel phpMyAdmin / MySQL 5.7+ / MariaDB 10+
-- Database: devsynxc_fairinvest
-- Default Admin: admin@fairinvest.site
-- Default Admin Password: Admin@12345
-- =======================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS 
  `audit_logs`, 
  `admin_actions`, 
  `chat_messages`, 
  `chat_rooms`, 
  `notifications`, 
  `commissions`, 
  `referral_relations`, 
  `referral_links`, 
  `referral_codes`, 
  `transactions`, 
  `withdrawals`, 
  `deposits`, 
  `investment_daily_profits`,
  `investments`, 
  `investment_plans`, 
  `wallet_ledger`, 
  `wallets`, 
  `settings`, 
  `two_factor`, 
  `sessions`, 
  `otps`,
  `payment_accounts`,
  `site_links`,
  `social_links`,
  `users`, 
  `roles`, 
  `knex_migrations_lock`,
  `knex_migrations`;

-- 1. ROLES
CREATE TABLE `roles` (
  `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(32) NOT NULL UNIQUE,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. USERS
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `role_id` int unsigned NOT NULL,
  `name` varchar(120) NOT NULL,
  `email` varchar(190) NOT NULL UNIQUE,
  `phone` varchar(32) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `is_blocked` tinyint(1) NOT NULL DEFAULT 0,
  `is_two_factor_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `avatar_url` varchar(255) DEFAULT NULL,
  `country` varchar(64) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(120) DEFAULT NULL,
  `postal_code` varchar(40) DEFAULT NULL,
  `national_id` varchar(64) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `users_role_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. SESSIONS
CREATE TABLE `sessions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` int unsigned NOT NULL,
  `refresh_token` varchar(512) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `sessions_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. TWO FACTOR
CREATE TABLE `two_factor` (
  `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` int unsigned NOT NULL,
  `secret` varchar(255) DEFAULT NULL,
  `backup_code` varchar(255) DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `two_factor_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. SETTINGS
CREATE TABLE `settings` (
  `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` int unsigned NOT NULL,
  `email_notifications` tinyint(1) DEFAULT 1,
  `sms_notifications` tinyint(1) DEFAULT 0,
  `investment_updates` tinyint(1) DEFAULT 1,
  `referral_activity` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `settings_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. WALLETS
CREATE TABLE `wallets` (
  `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` int unsigned NOT NULL UNIQUE,
  `balance` decimal(18,2) NOT NULL DEFAULT 0.00,
  `locked_balance` decimal(18,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `wallets_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. WALLET LEDGER
CREATE TABLE `wallet_ledger` (
  `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `wallet_id` int unsigned NOT NULL,
  `entry_type` enum('credit','debit') NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `reason` varchar(120) NOT NULL,
  `reference` varchar(120) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `wallet_ledger_wallet_id_fk` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. INVESTMENT PLANS
CREATE TABLE `investment_plans` (
  `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `slug` varchar(64) NOT NULL UNIQUE,
  `name` varchar(120) NOT NULL,
  `min_amount` decimal(18,2) NOT NULL,
  `max_amount` decimal(18,2) DEFAULT NULL,
  `duration_days` int NOT NULL,
  `daily_return_percent` decimal(8,2) NOT NULL,
  `total_return_percent` decimal(8,2) NOT NULL,
  `payout_daily_return_percent` decimal(8,2) DEFAULT NULL,
  `features` json DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. INVESTMENTS
CREATE TABLE `investments` (
  `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` int unsigned NOT NULL,
  `plan_id` int unsigned NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `status` enum('active','completed','cancelled') DEFAULT 'active',
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `expected_return` decimal(18,2) DEFAULT NULL,
  `claimed_earning` decimal(18,2) DEFAULT 0.00,
  `payout_daily_return_percent` decimal(8,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `inv_user_status_idx` (`user_id`, `status`),
  CONSTRAINT `investments_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `investments_plan_id_fk` FOREIGN KEY (`plan_id`) REFERENCES `investment_plans` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. INVESTMENT DAILY PROFITS
CREATE TABLE `investment_daily_profits` (
  `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `investment_id` int unsigned NOT NULL,
  `user_id` int unsigned NOT NULL,
  `day_index` int NOT NULL,
  `amount` decimal(18,4) NOT NULL,
  `reference` varchar(120) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `inv_day_idx` (`investment_id`, `day_index`),
  CONSTRAINT `inv_daily_profit_inv_fk` FOREIGN KEY (`investment_id`) REFERENCES `investments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `inv_daily_profit_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. PAYMENT ACCOUNTS
CREATE TABLE `payment_accounts` (
  `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `method` enum('bank_transfer','easypaisa','jazzcash','nayapay','sadapay','digit_plus','crypto') NOT NULL,
  `display_name` varchar(120) NOT NULL,
  `account_title` varchar(120) DEFAULT NULL,
  `account_number` varchar(120) DEFAULT NULL,
  `iban` varchar(120) DEFAULT NULL,
  `phone` varchar(40) DEFAULT NULL,
  `instructions` text,
  `logo_path` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. DEPOSITS
CREATE TABLE `deposits` (
  `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` int unsigned NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `method` enum('bank_transfer','easypaisa','jazzcash','nayapay','sadapay','digit_plus','crypto') NOT NULL,
  `status` enum('pending','completed','rejected') NOT NULL DEFAULT 'pending',
  `reference` varchar(120) DEFAULT NULL,
  `proof_path` varchar(255) DEFAULT NULL,
  `payment_account_id` int unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `dep_user_status_idx` (`user_id`, `status`),
  CONSTRAINT `deposits_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. WITHDRAWALS
CREATE TABLE `withdrawals` (
  `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` int unsigned NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `fee` decimal(18,2) NOT NULL DEFAULT 0.00,
  `method` enum('bank_transfer','easypaisa','jazzcash','nayapay','sadapay','digit_plus','crypto') NOT NULL,
  `status` enum('pending','processing','completed','rejected') DEFAULT 'pending',
  `reference` varchar(120) DEFAULT NULL,
  `account_details` json DEFAULT NULL,
  `approved_amount` decimal(18,2) DEFAULT NULL,
  `refund_amount` decimal(18,2) DEFAULT NULL,
  `admin_reason` text,
  `processed_at` timestamp NULL DEFAULT NULL,
  `processed_by` int unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `wth_user_status_idx` (`user_id`, `status`),
  CONSTRAINT `withdrawals_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `withdrawals_processed_by_fk` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. TRANSACTIONS
CREATE TABLE `transactions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` int unsigned NOT NULL,
  `type` enum('deposit','withdrawal','investment','earning','commission') NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `status` enum('pending','processing','completed','failed','active') NOT NULL,
  `method` varchar(64) DEFAULT NULL,
  `reference` varchar(120) DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `tx_user_status_idx` (`user_id`, `status`),
  CONSTRAINT `transactions_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 15. REFERRAL CODES
CREATE TABLE `referral_codes` (
  `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` int unsigned NOT NULL UNIQUE,
  `code` varchar(32) NOT NULL UNIQUE,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `referral_codes_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 16. REFERRAL LINKS
CREATE TABLE `referral_links` (
  `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` int unsigned NOT NULL,
  `token` varchar(64) NOT NULL UNIQUE,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `referral_links_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 17. REFERRAL RELATIONS
CREATE TABLE `referral_relations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `referrer_id` int unsigned NOT NULL,
  `referee_id` int unsigned NOT NULL,
  `level` int NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `ref_rel_unique` (`referrer_id`, `referee_id`),
  CONSTRAINT `ref_rel_referrer_fk` FOREIGN KEY (`referrer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ref_rel_referee_fk` FOREIGN KEY (`referee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 18. COMMISSIONS
CREATE TABLE `commissions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` int unsigned NOT NULL,
  `source_user_id` int unsigned NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `rate_percent` decimal(6,2) NOT NULL,
  `status` enum('pending','completed') DEFAULT 'completed',
  `reference` varchar(120) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `commissions_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `commissions_source_user_fk` FOREIGN KEY (`source_user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 19. NOTIFICATIONS
CREATE TABLE `notifications` (
  `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` int unsigned NOT NULL,
  `title` varchar(160) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `notifications_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 20. CHAT ROOMS
CREATE TABLE `chat_rooms` (
  `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `room_key` varchar(80) NOT NULL UNIQUE,
  `user_id` int unsigned NOT NULL,
  `admin_id` int unsigned DEFAULT NULL,
  `status` enum('open','closed') DEFAULT 'open',
  `admin_last_read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `chat_rooms_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chat_rooms_admin_id_fk` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 21. CHAT MESSAGES
CREATE TABLE `chat_messages` (
  `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `room_id` int unsigned NOT NULL,
  `sender_id` int unsigned DEFAULT NULL,
  `sender_role` varchar(32) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `chat_messages_room_id_fk` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chat_messages_sender_id_fk` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 22. ADMIN ACTIONS
CREATE TABLE `admin_actions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `admin_id` int unsigned NOT NULL,
  `action` varchar(120) NOT NULL,
  `target_type` varchar(64) DEFAULT NULL,
  `target_id` varchar(64) DEFAULT NULL,
  `meta` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `admin_actions_admin_id_fk` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 23. AUDIT LOGS
CREATE TABLE `audit_logs` (
  `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` int unsigned DEFAULT NULL,
  `event` varchar(120) NOT NULL,
  `ip_address` varchar(64) DEFAULT NULL,
  `method` varchar(12) DEFAULT NULL,
  `path` varchar(255) DEFAULT NULL,
  `payload` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `audit_logs_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 24. SOCIAL LINKS
CREATE TABLE `social_links` (
  `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `platform` varchar(32) NOT NULL UNIQUE,
  `url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 25. SITE LINKS
CREATE TABLE `site_links` (
  `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `title` varchar(120) NOT NULL,
  `url` varchar(500) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 26. OTPS
CREATE TABLE `otps` (
  `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` int unsigned DEFAULT NULL,
  `email` varchar(190) NOT NULL,
  `code` varchar(6) NOT NULL,
  `type` varchar(32) NOT NULL DEFAULT 'verification',
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `otps_email_code_idx` (`email`, `code`),
  CONSTRAINT `otps_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 27. KNEX MIGRATIONS
CREATE TABLE `knex_migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `batch` int NOT NULL,
  `migration_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 28. KNEX MIGRATIONS LOCK
CREATE TABLE `knex_migrations_lock` (
  `index` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `is_locked` int DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- INITIAL BASE SEED DATA
-- =============================================
INSERT INTO `roles` (`id`, `name`) VALUES 
(1, 'user'), 
(2, 'admin') 
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

INSERT INTO `users` (`id`, `role_id`, `name`, `email`, `phone`, `password_hash`, `is_verified`, `country`) VALUES 
(1, 2, 'Admin User', 'admin@fairinvest.site', '+92 300 0000000', '$2a$10$nQsETJSZigIGmUhbm8qyrefLw83UsxGp0soJ04Id0m.nHsbxcQK3K', 1, 'Pakistan') 
ON DUPLICATE KEY UPDATE `email`=VALUES(`email`);

INSERT INTO `wallets` (`id`, `user_id`, `balance`, `locked_balance`) VALUES 
(1, 1, 0.00, 0.00) 
ON DUPLICATE KEY UPDATE `balance`=VALUES(`balance`);

INSERT INTO `settings` (`id`, `user_id`, `email_notifications`, `sms_notifications`, `investment_updates`, `referral_activity`) VALUES 
(1, 1, 1, 0, 1, 1) 
ON DUPLICATE KEY UPDATE `user_id`=VALUES(`user_id`);

INSERT INTO `investment_plans` (`id`, `slug`, `name`, `min_amount`, `max_amount`, `duration_days`, `daily_return_percent`, `total_return_percent`, `payout_daily_return_percent`, `features`, `image_path`, `is_active`) VALUES
(1, 'starter', 'Starter Plan', 1.00, 999.00, 365, 2.00, 730.00, 2.00, '["24/7 tracking", "Fast activation", "Basic analytics", "Referral eligible"]', '/images/fair_starter_v2.png', 1),
(2, 'professional', 'Professional Plan', 1000.00, 4999.00, 365, 3.00, 1095.00, 3.00, '["Priority support", "Weekly reports", "Higher referral bonus"]', '/images/fair_pro_v2.png', 1),
(3, 'elite', 'Elite Plan', 5000.00, NULL, 365, 4.00, 1460.00, 4.00, '["VIP support", "Premium analytics", "Unlimited allocation"]', '/images/fair_elite_v2.png', 1)
ON DUPLICATE KEY UPDATE `slug`=VALUES(`slug`), `image_path`=VALUES(`image_path`);

INSERT INTO `social_links` (`id`, `platform`, `url`, `is_active`) VALUES
(1, 'whatsapp', 'https://whatsapp.com/channel/0029Vb9YnsS4dTnBGIVclZ1r', 1),
(2, 'telegram', 'https://t.me/fairinvest', 1)
ON DUPLICATE KEY UPDATE `platform`=VALUES(`platform`), `url`=VALUES(`url`), `is_active`=VALUES(`is_active`);

INSERT INTO `site_links` (`id`, `title`, `url`, `sort_order`, `is_active`) VALUES
(1, 'Follow the Fair invest Official channel on WhatsApp', 'https://whatsapp.com/channel/0029Vb9YnsS4dTnBGIVclZ1r', 1, 1),
(2, 'Telegram VIP Community', 'https://t.me/fairinvest', 2, 1)
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`), `url`=VALUES(`url`), `is_active`=VALUES(`is_active`);

INSERT INTO `payment_accounts` (`id`, `method`, `display_name`, `account_title`, `account_number`, `iban`, `phone`, `instructions`, `logo_path`, `is_active`, `sort_order`) VALUES
(1, 'digit_plus', 'Digitt+ / Raast (Scan & Pay)', 'MashAllah Bhatti Mobilee', '346584733', NULL, '346584733', 'Scan the QR code or enter Till ID 346584733 in Digitt+ / Raast / banking apps. Make payment, take screenshot, and upload proof below.', '/images/digitt_plus_scan_pay.png', 1, 1),
(2, 'bank_transfer', 'Meezan Bank', 'FairInvest Treasury', '0101-0203040506', 'PK36MEZN0001010203040506', NULL, 'Send deposit to this account and upload the receipt screenshot.', '/bank-logos/meezan.png', 1, 2),
(3, 'easypaisa', 'Easypaisa', 'FairInvest Official', '0300-1234567', NULL, '0300-1234567', 'Send via Easypaisa and submit transaction ID with screenshot.', '/bank-logos/easypaisa.png', 1, 3)
ON DUPLICATE KEY UPDATE `display_name`=VALUES(`display_name`), `account_title`=VALUES(`account_title`), `account_number`=VALUES(`account_number`), `instructions`=VALUES(`instructions`), `logo_path`=VALUES(`logo_path`);

-- Track migrations as applied so knex won't re-run them
INSERT INTO `knex_migrations` (`name`, `batch`, `migration_time`) VALUES
('20260304110000_init_schema.js', 1, CURRENT_TIMESTAMP),
('20260310173000_add_social_links_table.js', 1, CURRENT_TIMESTAMP),
('20260310191500_add_site_links_table.js', 1, CURRENT_TIMESTAMP),
('20260310200000_add_payment_accounts_table.js', 1, CURRENT_TIMESTAMP),
('20260311110000_add_media_fields.js', 1, CURRENT_TIMESTAMP),
('20260311123000_add_deposit_proof_fields.js', 1, CURRENT_TIMESTAMP),
('20260311143000_add_claimed_earning_to_investments.js', 1, CURRENT_TIMESTAMP),
('20260312001000_upgrade_finance_rules.js', 1, CURRENT_TIMESTAMP),
('20260319150000_add_otp_verification.js', 1, CURRENT_TIMESTAMP),
('20260319161000_add_reason_to_transactions.js', 1, CURRENT_TIMESTAMP),
('20260319161000_db_refinement.js', 1, CURRENT_TIMESTAMP),
('20260512140000_otps_user_id_nullable.js', 1, CURRENT_TIMESTAMP),
('20260630120000_add_payout_percent_and_chat_read_state.js', 1, CURRENT_TIMESTAMP),
('20260630130000_resync_investment_payout_rates.js', 1, CURRENT_TIMESTAMP),
('20260701120000_add_performance_indexes.js', 1, CURRENT_TIMESTAMP),
('20260702120000_investment_start_datetime.js', 1, CURRENT_TIMESTAMP),
('20260708120000_extend_plans_to_365_days.js', 1, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

INSERT INTO `knex_migrations_lock` (`index`, `is_locked`) VALUES (1, 0)
ON DUPLICATE KEY UPDATE `is_locked`=0;

SET FOREIGN_KEY_CHECKS = 1;
