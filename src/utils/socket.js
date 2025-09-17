import { Server } from "socket.io";
import Message from "../models/chat.js";

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ New client connected:", socket.id);

    // Join room
    socket.on("joinChat", ({ userId, targetUserId }) => {
      const roomId = [userId, targetUserId].sort().join("_");
      socket.join(roomId);
      console.log(`User ${userId} joined room ${roomId}`);
    });

    // Send message to room
    socket.on("sendMessage", async({ firstName, userId, targetUserId, text }) => {
      const roomId = [userId, targetUserId].sort().join("_");
       const newMessage = new Message({
    senderId: userId,
    receiverId: targetUserId,
    text,
  });
  await newMessage.save();
      console.log(`📩 ${userId} -> ${targetUserId}: ${text}`);
      socket.to(roomId).emit("messageReceived", { firstName, text, senderId: userId });
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });
};

export default initializeSocket;
