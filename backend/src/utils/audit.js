const db = require("../db/knex");

async function safeInsertAudit(entry) {
  try {
    await db("audit_logs").insert(entry);
  } catch (_error) {
    // Avoid breaking request lifecycle on audit failure.
  }
}

function writeAuditLog(req, res, next) {
  const start = Date.now();
  res.on("finish", async () => {
    if (req.path.startsWith("/api/health")) return;
    await safeInsertAudit({
      user_id: req.user?.id || null,
      event: `${req.method}_${req.path}_${res.statusCode}`,
      ip_address: req.ip,
      method: req.method,
      path: req.originalUrl,
      payload: JSON.stringify({
        statusCode: res.statusCode,
        durationMs: Date.now() - start,
      }),
    });
  });
  next();
}

module.exports = { writeAuditLog };
