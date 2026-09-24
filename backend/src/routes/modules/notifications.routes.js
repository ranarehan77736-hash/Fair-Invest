const express = require("express");
const db = require("../../db/knex");
const { requireAuth } = require("../../middleware/auth");
const asyncHandler = require("../../utils/asyncHandler");

const router = express.Router();

router.use(requireAuth);

router.get(
  "/mine",
  asyncHandler(async (req, res) => {
    const rows = await db("notifications")
      .where({ user_id: req.user.id })
      .select("id", "title", "message", "is_read as isRead", "created_at as createdAt")
      .orderBy("created_at", "desc");
    res.json({ success: true, data: rows });
  }),
);

router.patch(
  "/:id/read",
  asyncHandler(async (req, res) => {
    await db("notifications")
      .where({ id: Number(req.params.id), user_id: req.user.id })
      .update({ is_read: true, updated_at: db.fn.now() });
    res.json({ success: true, message: "Notification marked as read" });
  }),
);

module.exports = router;
