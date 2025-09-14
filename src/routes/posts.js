import express from "express";
import userAuth from "../utils/userAuth.js";
import Post from "../models/postModel.js";
const postRouter=express.Router()
postRouter.post('/posts',userAuth,async(req,res)=>{
    try {
        const{caption,imageUrl}=req.body
        if (!caption) {
      return res.status(400).json({ message: "Caption is required" });
    }
    const post=new Post({
        caption,imageUrl,createdBy:req.user._id
    })
    await post.save()
    res.status(201).json({ message: "Post created successfully", post });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})
postRouter.get("/posts/me", userAuth, async (req, res) => {
  try {
    const myPosts = await Post.find({ createdBy: req.user._id })
      .populate("createdBy", "firstName lastName photoUrl")
      .sort({ createdAt: -1 });

    res.json(myPosts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ✅ Like or Unlike a post
postRouter.put("/posts/:id/like", userAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user._id;

    if (post.likes.includes(userId)) {
      // Unlike
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();
    res.json({ message: "Updated likes", likes: post.likes.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// backend/routes/postRoutes.js
postRouter.delete("/posts/:id", userAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Post.findOneAndDelete({
      _id: id,
      createdBy: req.user._id, // only allow deleting own post
    });

    if (!deleted) {
      return res.status(404).json({ message: "Post not found or not yours" });
    }

    res.json({ message: "Post deleted successfully", deleted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


export default postRouter