import express from 'express'
import userAuth from '../utils/userAuth.js'
import User from '../models/user.js'
import followModel from '../models/followRequests.js'

const requestRouter = express.Router()

requestRouter.post('/request/send/:toUserId', userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const { toUserId } = req.params;

    // Prevent self-follow
    if (fromUserId.toString() === toUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    // Validate target user
    const toUser = await User.findById(toUserId);
    if (!toUser) {
      return res.status(404).json({ message: "User doesn't exist" });
    }

    // Check if a follow request already exists
    const existingRequest = await followModel.findOne({
      fromUserId,
      toUserId,
    });

    if (existingRequest) {
      return res.status(400).json({ message: "You already sent a follow request" });
    }

    // Create new follow request (status: "pending")
    const connectionRequest = new followModel({
      fromUserId,
      toUserId,
      status: "pending"
    });

    const data = await connectionRequest.save();
    res.json({
      message: "Follow request sent successfully",
      data
    });

  } catch (error) {
    res.status(500).json({ message: "Error: " + error.message });
  }
});
requestRouter.get("/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const receivedRequests = await followModel
      .find({ toUserId: loggedInUser._id, status: "pending" })
      .populate("fromUserId", "firstName lastName photoUrl about skills age gender"); 

    res.json(receivedRequests);
  } catch (err) {
    console.error("Error fetching requests:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
requestRouter.post('/request/review/:status/:requestId', userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { status, requestId } = req.params;

    const allowedStatus = ["accepted", "rejected"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Find the request for the logged-in user
    const followRequest = await followModel.findOne({
      _id: requestId,
      toUserId: loggedInUser._id
    });

    if (!followRequest) {
      return res.status(404).json({ message: "Follow request not found or not for you" });
    }

    if (followRequest.status !== "pending") {
      return res.status(400).json({ message: "This request has already been reviewed" });
    }

    followRequest.status = status;
    const data = await followRequest.save();

    res.json({
      message: "Follow request " + status,
      data
    });

  } catch (error) {
    res.status(500).json({ message: "Something went wrong!", error: error.message });
  }
});

export default requestRouter
