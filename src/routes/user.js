import express from 'express'
import userAuth from '../utils/userAuth.js'
import followModel from '../models/followRequests.js'
import User from '../models/user.js'
import Post from '../models/postModel.js'
import mongoose from 'mongoose'

const userRouter = express.Router()
const selectedFields = "firstName lastName photoUrl about skills age gender"

// 📌 Get all pending follow requests received
userRouter.get('/allUsers',userAuth,async(req,res)=>{
  try {
    const users=await User.find({},"firstName lastName photoUrl")
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
userRouter.get('/user/request/received', userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user

    const pendingRequests = await followModel.find({
      toUserId: loggedInUser._id,
      status: "pending"
    }).populate("fromUserId", selectedFields)

    res.json({
      message: "Pending requests fetched successfully",
      data: pendingRequests
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 📌 Get all accepted connections (followers + following)
userRouter.get('/user/connections', userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user

    const connections = await followModel.find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" }
      ]
    })
      .populate("fromUserId", selectedFields)
      .populate("toUserId", selectedFields)

    const result = connections.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId
      }
      return row.fromUserId
    })

    res.json({
      message: "Connections fetched successfully",
      data: result
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 📌 Feed (posts from people I follow OR who follow me)
userRouter.get("/user/feed", userAuth, async (req, res) => {
  try {
    const loggedInUserId = new mongoose.Types.ObjectId(req.user._id)

    // Find all follow relations where I'm either follower or followee
    const relations = await followModel.find({
      $or: [
        { fromUserId: loggedInUserId },
        { toUserId: loggedInUserId },
      ]
    })

    // Collect IDs of both sides
    const followingIds = relations.map(r => r.fromUserId.toString())
    const followersIds = relations.map(r => r.toUserId.toString())

    const allIds = new Set([...followingIds, ...followersIds])

    allIds.delete(loggedInUserId.toString())

    // Fetch posts from these users
    const posts = await Post.find({
      createdBy: { $in: Array.from(allIds) }
    })
      .populate("createdBy", "firstName lastName photoUrl")
      .sort({ createdAt: -1 })

    res.json(posts)
  } catch (error) {
    console.error("Feed error:", error)
    res.status(500).json({ error: "Something went wrong" })
  }
})

// 📌 Suggestions (people I don’t follow & no pending requests)
userRouter.get("/user/suggestions", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user

    const relations = await followModel.find({
      $or: [
        { fromUserId: loggedInUser._id },
        { toUserId: loggedInUser._id }
      ]
    })

    const excludedIds = new Set([loggedInUser._id.toString()])
    relations.forEach(r => {
      excludedIds.add(r.fromUserId.toString())
      excludedIds.add(r.toUserId.toString())
    })

    const suggestions = await User.find({
      _id: { $nin: Array.from(excludedIds) }
    }).select(selectedFields)

    res.json({data:suggestions})
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
})
// 📌 Get single user by ID
userRouter.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "firstName lastName photoUrl about skills age gender"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Fetch all posts created by this user
    const posts = await Post.find({ createdBy: req.params.id })
      .sort({ createdAt: -1 })
      .populate("createdBy", "firstName lastName imageUrl");

    res.json({ user, posts });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});



export default userRouter
