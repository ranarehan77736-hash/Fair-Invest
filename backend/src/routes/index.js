const express = require("express");
const db = require("../db/knex");
const authRoutes = require("./modules/auth.routes");
const userRoutes = require("./modules/users.routes");
const investmentRoutes = require("./modules/investments.routes");
const walletRoutes = require("./modules/wallet.routes");
const referralRoutes = require("./modules/referrals.routes");
const adminRoutes = require("./modules/admin.routes");
const chatRoutes = require("./modules/chat.routes");
const notificationRoutes = require("./modules/notifications.routes");

const router = express.Router();

router.get("/health", async (_req, res, next) => {
  try {
    await db.raw("SELECT 1");
    res.json({ success: true, message: "Backend healthy", db: "connected" });
  } catch (error) {
    next(error);
  }
});

router.get("/site-links", async (_req, res, next) => {
  try {
    const rows = await db("site_links")
      .select("id", "title", "url", "sort_order as sortOrder")
      .where({ is_active: 1 })
      .orderBy([{ column: "sort_order", order: "asc" }, { column: "id", order: "asc" }]);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
});

router.get("/payment-accounts", async (req, res, next) => {
  try {
    const method = req.query.method;
    const query = db("payment_accounts")
      .select(
        "id",
        "method",
        "display_name as displayName",
        "account_title as accountTitle",
        "account_number as accountNumber",
        "iban",
        "phone",
        "instructions",
        "logo_path as logoPath",
        "sort_order as sortOrder",
      )
      .where({ is_active: 1 });
    if (method) query.andWhere({ method });
    const rows = await query.orderBy([{ column: "sort_order", order: "asc" }, { column: "id", order: "asc" }]);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/investments", investmentRoutes);
router.use("/wallet", walletRoutes);
router.use("/referrals", referralRoutes);
router.use("/admin", adminRoutes);
router.use("/chat", chatRoutes);
router.use("/notifications", notificationRoutes);

module.exports = router;
