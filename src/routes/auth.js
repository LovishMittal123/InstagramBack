import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import userAuth from "../utils/userAuth.js";
import upload from "../utils/multer.js";

const authrouter = express.Router();

/* ===========================
   SIGNUP
=========================== */
authrouter.post(
  "/signup",
  upload.single("photo"),
  async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        age,
        gender,
        email,
        password,
        about,
      } = req.body;

      if (!firstName || !email || !password) {
        return res.status(400).json({ message: "Required fields missing" });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      /* ===========================
         HANDLE IMAGE
      =========================== */
      let photoUrl = "";

      if (req.file) {
        photoUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString(
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
        photoUrl,
      });

      const savedUser = await user.save();

      const token = jwt.sign(
        { _id: savedUser._id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "30d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        _id: savedUser._id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email,
        photoUrl: savedUser.photoUrl,
        age: savedUser.age,
        gender: savedUser.gender,
        about: savedUser.about,
      });
    } catch (err) {
      console.error("Signup error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

/* ===========================
   LOGIN
=========================== */
authrouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

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

    res.json({
      _id: existingUser._id,
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      email: existingUser.email,
      photoUrl: existingUser.photoUrl,
      age: existingUser.age,
      gender: existingUser.gender,
      about: existingUser.about,
      skills: existingUser.skills,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ===========================
   LOGOUT
=========================== */
authrouter.post("/logout", userAuth, async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default authrouter;
