// models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true } // createdAt, updatedAt
);

const Message= mongoose.model("Message", messageSchema);
export default Message
