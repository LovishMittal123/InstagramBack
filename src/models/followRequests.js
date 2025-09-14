import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "accepted", "rejected"],
        message: "Invalid status value",
      },
      default: "pending", // when request is first created
    },
  },
  { timestamps: true }
);

// prevent duplicate follow requests
followSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

const followModel = mongoose.model("Follow", followSchema);
export default followModel;
