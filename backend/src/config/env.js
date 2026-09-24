const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const findEnvPaths = () => {
  const paths = [
    path.resolve(__dirname, "../../.env"), // backend/.env
    path.resolve(process.cwd(), "backend/.env"),
    path.resolve(process.cwd(), ".env"),
    path.resolve(__dirname, "../../../.env"),
  ];
  return Array.from(new Set(paths.filter(p => fs.existsSync(p))));
};

const envFiles = findEnvPaths();
if (envFiles.length > 0) {
  // Load in reverse order so backend/.env overrides root .env
  for (const envPath of envFiles.reverse()) {
    dotenv.config({ path: envPath, override: true });
    console.log(`[Env] Loaded environment from: ${envPath}`);
  }
} else {
  console.log("[Env] Warning: No .env file found. using environment variables or defaults.");
}

function sanitizeEnvValue(value) {
  if (value == null) return value;
  const trimmed = String(value).trim();
  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  clientUrl: (process.env.CLIENT_URL || "https://horizoneinvest.com").replace(/\/$/, ""),
  frontendRoot: process.env.FRONTEND_ROOT || "",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "dev_access_secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "dev_refresh_secret",
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 100),
  smtp: {
    host: sanitizeEnvValue(process.env.SMTP_HOST),
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE === "true",
    user: sanitizeEnvValue(process.env.SMTP_USER),
    pass: sanitizeEnvValue(process.env.SMTP_PASS),
    fromName: sanitizeEnvValue(process.env.SMTP_FROM_NAME) || "Horizoneinvest",
    fromEmail: sanitizeEnvValue(process.env.SMTP_FROM_EMAIL),
  },
  // Signup OTP is off by default. Set REQUIRE_SIGNUP_OTP=true in .env to turn it back on.
  skipSignupOtp: process.env.REQUIRE_SIGNUP_OTP !== "true",
  // Password-reset OTP is on by default. Set ENABLE_FORGOT_PASSWORD_OTP=false to disable.
  enableForgotPasswordOtp: process.env.ENABLE_FORGOT_PASSWORD_OTP !== "false",
  // Profit: calendar = credit when local date changes (midnight). rolling = every 24h from invest time.
  profitDayMode: process.env.PROFIT_DAY_MODE || "calendar",
  // Pakistan = 5. Used to align profit day with website date (UTC+5).
  profitUtcOffsetHours: Number(process.env.PROFIT_UTC_OFFSET_HOURS || 5),
  // Prefer Asia/Karachi so CURDATE()/NOW() match Pakistan midnight without DATE_ADD.
  mysqlTimezone: sanitizeEnvValue(process.env.MYSQL_TIMEZONE) || "+05:00",
  // Set true after knex successfully applied session timezone (see knex.js).
  mysqlSessionTimezoneConfigured: false,
  // When false (default), matured plans stay active for duration and principal is NEVER refunded.
  // This stops the 30-day refund → reinvest → commission loop.
  enablePrincipalRefund: process.env.ENABLE_PRINCIPAL_REFUND === "true",
  autoProfitEnabled: process.env.AUTO_PROFIT_ENABLED !== "false",
  autoProfitIntervalMinutes: Math.max(5, Number(process.env.AUTO_PROFIT_INTERVAL_MINUTES || 5)),
};


module.exports = env;
