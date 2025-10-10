import express from 'express';
import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userAuth from '../utils/userAuth.js';

const authrouter = express.Router();

// ✅ Signup
authrouter.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, age, gender, photoUrl, email, password, about } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      age,
      gender,
      photoUrl,
      email,
      password: hashedPassword,
      about
    });

    const savedUser = await user.save();

    const token = jwt.sign({ _id: savedUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: "30d" });

    // ✅ Production-safe cookie for cross-domain login
    res.cookie("token", token, {
      httpOnly: true,      // prevent JS access
      secure: true,        // HTTPS only
      sameSite: "none",    // allows cross-domain cookies (Vercel → Render)
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.status(201).json({ data: savedUser });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Login
authrouter.post('/login', async (req, res) => {
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

    const token = jwt.sign({ _id: existingUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: "30d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 30 * 24 * 60 * 60 * 1000
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
      skills: existingUser.skills
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Logout
authrouter.post('/logout', userAuth, async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default authrouter;
