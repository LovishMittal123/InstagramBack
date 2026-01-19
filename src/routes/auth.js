import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import User from "../models/user.js";
import userAuth from "../utils/userAuth.js";

const authrouter = express.Router();

/* =======================
   MULTER CONFIG
======================= */
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/* =======================
   SIGNUP
======================= */
authrouter.post("/signup", upload.single("photo"), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      age,
      gender,
      email,
      password,
      about,
      photoUrl,
    } = req.body;

    // basic validation
    if (!firstName || !email || !password) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    /* =======================
       PHOTO HANDLING
    ======================= */
    let finalPhotoUrl = photoUrl || "";

    if (req.file) {
      // convert image to base64 (TEMP solution)
      finalPhotoUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString(
        "base64"
      )}`;
    }

    const user = new User({
      firstName,
      lastName,
      age,
      gender,
      email,
      password: hashedPassword,
      about,
      photoUrl: finalPhotoUrl,
    });

    const savedUser = await user.save();

    const token = jwt.sign(
      { _id: savedUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "30d" }
    );

    // cross-domain cookie (Vercel → Render)
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ data: savedUser });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* =======================
   LOGIN
======================= */
authrouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(401).json({ message: "User does not exist" });
    }

    const isValid = await bcrypt.compare(password, existingUser.password);
    if (!isValid) {
      return res.status(401).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { _id: existingUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "30d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json(existingUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =======================
   LOGOUT
======================= */
authrouter.post("/logout", userAuth, async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default authrouter;
