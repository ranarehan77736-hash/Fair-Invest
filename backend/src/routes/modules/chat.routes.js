const express = require("express");
const { z } = require("zod");
const crypto = require("crypto");

const db = require("../../db/knex");
const { requireAuth, requireRole } = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const asyncHandler = require("../../utils/asyncHandler");

const router = express.Router();

const messageSchema = z.object({
  roomKey: z.string().min(3),
  content: z.string().min(1),
});

const adminReplySchema = z.object({
  content: z.string().min(1),
});

router.use(requireAuth);

function canAccessRoom(room, user) {
  if (!room || !user) return false;
  if (user.role === "admin") return true;
  return Number(room.user_id) === Number(user.id);
}

async function touchChatRoom(roomId, extra = {}) {
  await db("chat_rooms")
    .where({ id: roomId })
    .update({ updated_at: db.fn.now(), ...extra });
}

router.post(
  "/room",
  asyncHandler(async (req, res) => {
    let room = await db("chat_rooms").where({ user_id: req.user.id }).orderBy("id", "desc").first();
    if (!room) {
      const [roomId] = await db("chat_rooms").insert({
        room_key: crypto.randomUUID(),
        user_id: req.user.id,
        status: "open",
      });
      room = await db("chat_rooms").where({ id: roomId }).first();
    } else if (room.status !== "open") {
      await db("chat_rooms").where({ id: room.id }).update({ status: "open", updated_at: db.fn.now() });
      room.status = "open";
    }
    res.status(201).json({ success: true, data: room });
  }),
);

router.get(
  "/rooms/mine",
  asyncHandler(async (req, res) => {
    const rooms = await db("chat_rooms")
      .where({ user_id: req.user.id })
      .select("id", "room_key as roomKey", "status", "created_at as createdAt")
      .orderBy("created_at", "desc");
    res.json({ success: true, data: rooms });
  }),
);

router.get(
  "/:roomKey/messages",
  asyncHandler(async (req, res) => {
    const room = await db("chat_rooms").where({ room_key: req.params.roomKey }).first();
    if (!room) return res.json({ success: true, data: [] });
    if (!canAccessRoom(room, req.user)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const messages = await db("chat_messages")
      .where({ room_id: room.id })
      .select("id", "sender_id as senderId", "sender_role as senderRole", "content", "created_at as createdAt")
      .orderBy("created_at", "asc");
    res.json({ success: true, data: messages });
  }),
);

router.post(
  "/message",
  validate(messageSchema),
  asyncHandler(async (req, res) => {
    const room = await db("chat_rooms").where({ room_key: req.body.roomKey }).first();
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });
    if (!canAccessRoom(room, req.user)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    if (room.status === "closed" && req.user.role !== "admin") {
      return res.status(400).json({ success: false, message: "Room is closed" });
    }
    const senderRole = req.user.role === "admin" ? "admin" : "user";
    await db("chat_messages").insert({
      room_id: room.id,
      sender_id: req.user.id,
      sender_role: senderRole,
      content: req.body.content,
    });
    await touchChatRoom(room.id, {
      admin_id: req.user.role === "admin" ? req.user.id : room.admin_id,
      ...(senderRole === "admin" ? { admin_last_read_at: db.fn.now() } : {}),
    });
    res.status(201).json({ success: true, message: "Message sent" });
  }),
);

router.get(
  "/admin/rooms",
  requireRole("admin"),
  asyncHandler(async (_req, res) => {
    const rooms = await db("chat_rooms as cr")
      .select(
        "cr.id",
        "cr.room_key as roomKey",
        "cr.user_id as userId",
        "cr.admin_id as adminId",
        "cr.status",
        "cr.created_at as createdAt",
        "cr.updated_at as updatedAt",
        "cr.admin_last_read_at as adminLastReadAt",
        db.raw(
          `(SELECT COUNT(*) FROM chat_messages cm
            WHERE cm.room_id = cr.id
              AND cm.sender_role = 'user'
              AND (cr.admin_last_read_at IS NULL OR cm.created_at > cr.admin_last_read_at)
          ) as unreadCount`,
        ),
        db.raw(`(SELECT MAX(cm.created_at) FROM chat_messages cm WHERE cm.room_id = cr.id) as lastMessageAt`),
      )
      .orderByRaw(
        `(SELECT COUNT(*) FROM chat_messages cm
          WHERE cm.room_id = cr.id
            AND cm.sender_role = 'user'
            AND (cr.admin_last_read_at IS NULL OR cm.created_at > cr.admin_last_read_at)
        ) DESC, lastMessageAt DESC, cr.updated_at DESC`,
      );

    res.json({
      success: true,
      data: rooms.map((room) => ({
        ...room,
        unreadCount: Number(room.unreadCount || 0),
        lastMessageAt: room.lastMessageAt || room.updatedAt || room.createdAt,
      })),
    });
  }),
);

router.patch(
  "/admin/rooms/:id/close",
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    await db("chat_rooms").where({ id: Number(req.params.id) }).update({ status: "closed", admin_id: req.user.id, updated_at: db.fn.now() });
    res.json({ success: true, message: "Room closed" });
  }),
);

router.patch(
  "/admin/rooms/:id/read",
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const roomId = Number(req.params.id);
    const room = await db("chat_rooms").where({ id: roomId }).first();
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });
    await db("chat_rooms").where({ id: roomId }).update({ admin_last_read_at: db.fn.now(), updated_at: db.fn.now() });
    res.json({ success: true, message: "Room marked as read" });
  }),
);

router.get(
  "/admin/rooms/:id/messages",
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const roomId = Number(req.params.id);
    const room = await db("chat_rooms").where({ id: roomId }).first();
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });
    const messages = await db("chat_messages")
      .where({ room_id: room.id })
      .select("id", "sender_id as senderId", "sender_role as senderRole", "content", "created_at as createdAt")
      .orderBy("created_at", "asc");
    await db("chat_rooms").where({ id: roomId }).update({ admin_last_read_at: db.fn.now() });
    res.json({ success: true, data: messages });
  }),
);

router.post(
  "/admin/rooms/:id/reply",
  requireRole("admin"),
  validate(adminReplySchema),
  asyncHandler(async (req, res) => {
    const roomId = Number(req.params.id);
    const room = await db("chat_rooms").where({ id: roomId }).first();
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });
    await db("chat_messages").insert({
      room_id: room.id,
      sender_id: req.user.id,
      sender_role: "admin",
      content: req.body.content,
    });
    await touchChatRoom(room.id, {
      admin_id: req.user.id,
      status: "open",
      admin_last_read_at: db.fn.now(),
    });
    res.status(201).json({ success: true, message: "Reply sent" });
  }),
);

module.exports = router;
