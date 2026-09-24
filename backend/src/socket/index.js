const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const env = require("../config/env");
const db = require("../db/knex");

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: env.clientUrl,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.replace("Bearer ", "");
    if (!token) return next(new Error("Unauthorized"));
    try {
      const user = jwt.verify(token, env.jwtAccessSecret);
      socket.user = user;
      return next();
    } catch (_error) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("chat:join", async ({ roomKey }) => {
      if (!roomKey) return;
      const room = await db("chat_rooms").where({ room_key: roomKey }).first();
      if (room) socket.join(roomKey);
    });

    socket.on("chat:message", async ({ roomKey, content }) => {
      if (!roomKey || !content) return;
      const room = await db("chat_rooms").where({ room_key: roomKey }).first();
      if (!room) return;
      const [id] = await db("chat_messages").insert({
        room_id: room.id,
        sender_id: socket.user.id,
        sender_role: socket.user.role === "admin" ? "admin" : "user",
        content,
      });
      await db("chat_rooms")
        .where({ id: room.id })
        .update({
          updated_at: db.fn.now(),
          ...(socket.user.role === "admin" ? { admin_last_read_at: db.fn.now() } : {}),
        });
      const saved = await db("chat_messages")
        .where({ id })
        .select("id", "content", "sender_role as senderRole", "sender_id as senderId", "created_at as createdAt")
        .first();
      io.to(roomKey).emit("chat:new-message", saved);
    });
  });
}

module.exports = { initializeSocket };
