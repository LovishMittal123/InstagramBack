// routes/messageRoutes.js
import express from "express";
import Message from "../models/chat.js";
const MessageRouter = express.Router();

// GET chat between two users
MessageRouter.get("/chat/:userId/:targetUserId", async (req, res) => {
  const { userId, targetUserId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: targetUserId },
        { senderId: targetUserId, receiverId: userId },
      ],
    }).sort({ createdAt: 1 }); // oldest → newest

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default MessageRouter;
