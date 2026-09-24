const env = require("../config/env");

function getProfitUtcOffsetHours() {
  const offset = Number(env.profitUtcOffsetHours);
  return Number.isFinite(offset) ? Math.round(offset) : 5;
}

function getProfitDayMode() {
  return String(env.profitDayMode || "calendar").toLowerCase();
}

/** True when MySQL session already uses Pakistan timezone via knex. */
function usesSessionTimezone() {
  return env.mysqlSessionTimezoneConfigured === true;
}

/**
 * Calendar completed days SQL expression.
 * Prefer CURDATE() when connection timezone is Asia/Karachi / +05:00
 * to avoid double-shifting midnight.
 */
function buildCompletedDaysSql({ planAlias = "p", investmentAlias = "i" } = {}) {
  const isSqlite = process.env.DB_CLIENT === 'sqlite3' || (!process.env.DB_HOST && !process.env.DB_USER);
  if (isSqlite) {
    return `
      MIN(
        ${planAlias}.duration_days,
        MAX(0, CAST(julianday('now') - julianday(COALESCE(${investmentAlias}.created_at, ${investmentAlias}.start_date)) AS INTEGER))
      )
    `;
  }

  const mode = getProfitDayMode();
  if (mode === "rolling") {
    return `
      LEAST(
        ${planAlias}.duration_days,
        GREATEST(0, FLOOR(TIMESTAMPDIFF(HOUR, COALESCE(${investmentAlias}.created_at, ${investmentAlias}.start_date), NOW()) / 24))
      )
    `;
  }

  // Session TZ already Pakistan → use CURDATE() (no DATE_ADD).
  if (usesSessionTimezone()) {
    return `
      LEAST(
        ${planAlias}.duration_days,
        GREATEST(0, DATEDIFF(CURDATE(), DATE(COALESCE(${investmentAlias}.created_at, ${investmentAlias}.start_date))))
      )
    `;
  }

  const offsetHours = getProfitUtcOffsetHours();
  const nowLocal = offsetHours === 0 ? "NOW()" : `DATE_ADD(NOW(), INTERVAL ${offsetHours} HOUR)`;
  const startLocal =
    offsetHours === 0
      ? `COALESCE(${investmentAlias}.created_at, ${investmentAlias}.start_date)`
      : `DATE_ADD(COALESCE(${investmentAlias}.created_at, ${investmentAlias}.start_date), INTERVAL ${offsetHours} HOUR)`;

  return `
    LEAST(
      ${planAlias}.duration_days,
      GREATEST(0, DATEDIFF(DATE(${nowLocal}), DATE(${startLocal})))
    )
  `;
}

function buildMaturedWhereSql({ planAlias = "investment_plans", investmentAlias = "investments" } = {}) {
  const isSqlite = process.env.DB_CLIENT === 'sqlite3' || (!process.env.DB_HOST && !process.env.DB_USER);
  if (isSqlite) {
    return `CAST(julianday('now') - julianday(${investmentAlias}.start_date) AS INTEGER) >= ${planAlias}.duration_days`;
  }
  if (usesSessionTimezone()) {
    return `DATEDIFF(CURDATE(), DATE(${investmentAlias}.start_date)) >= ${planAlias}.duration_days`;
  }
  const offsetHours = getProfitUtcOffsetHours();
  if (offsetHours === 0) {
    return `DATEDIFF(CURDATE(), DATE(${investmentAlias}.start_date)) >= ${planAlias}.duration_days`;
  }
  return `DATEDIFF(
    DATE(DATE_ADD(NOW(), INTERVAL ${offsetHours} HOUR)),
    DATE(DATE_ADD(${investmentAlias}.start_date, INTERVAL ${offsetHours} HOUR))
  ) >= ${planAlias}.duration_days`;
}

/** Shift a Date into the configured profit timezone (default UTC+5). */
function toProfitLocalDate(input = new Date()) {
  const date = input instanceof Date ? new Date(input.getTime()) : new Date(input);
  if (Number.isNaN(date.getTime())) return new Date(NaN);
  const offsetHours = getProfitUtcOffsetHours();
  return new Date(date.getTime() + offsetHours * 60 * 60 * 1000);
}

function formatProfitLocalYmd(input = new Date()) {
  const local = toProfitLocalDate(input);
  if (Number.isNaN(local.getTime())) return "";
  const y = local.getUTCFullYear();
  const m = String(local.getUTCMonth() + 1).padStart(2, "0");
  const d = String(local.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getCompletedDays(startDate, durationDays) {
  const safeDuration = Math.max(1, Number(durationDays || 1));
  if (!startDate) return 0;
  const mode = getProfitDayMode();
  if (mode === "rolling") {
    const elapsedMs = Math.max(0, Date.now() - new Date(startDate).getTime());
    const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
    return Math.min(safeDuration, Math.max(0, elapsedDays));
  }
  const startLocal = toProfitLocalDate(startDate);
  const nowLocal = toProfitLocalDate(new Date());
  if (Number.isNaN(startLocal.getTime()) || Number.isNaN(nowLocal.getTime())) return 0;
  const startUtcMidnight = Date.UTC(startLocal.getUTCFullYear(), startLocal.getUTCMonth(), startLocal.getUTCDate());
  const nowUtcMidnight = Date.UTC(nowLocal.getUTCFullYear(), nowLocal.getUTCMonth(), nowLocal.getUTCDate());
  const elapsedDays = Math.floor((nowUtcMidnight - startUtcMidnight) / (1000 * 60 * 60 * 24));
  return Math.min(safeDuration, Math.max(0, elapsedDays));
}

function getMaturityDate(startDate, durationDays) {
  const base = toProfitLocalDate(startDate);
  if (Number.isNaN(base.getTime())) return new Date(NaN);
  const days = Math.max(0, Number(durationDays || 0));
  base.setUTCDate(base.getUTCDate() + days);
  return base;
}

module.exports = {
  buildCompletedDaysSql,
  buildMaturedWhereSql,
  getCompletedDays,
  getMaturityDate,
  formatProfitLocalYmd,
  getProfitUtcOffsetHours,
  getProfitDayMode,
};
