import express from "express";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import User from "../models/user.js";
// import PendingUser from '../models/PendingUser.js';
// import bcrypt from 'bcrypt';
// import nodemailer from 'nodemailer';

import { auth } from "../middleware/auth.js";

const router = express.Router();

const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const getUserData = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  profilePicture: user.profilePicture,
  backgroundPicture: user.backgroundPicture,
  bio: user.bio,
  skills: user.skills,
  interests: user.interests,
  country: user.country,
  city: user.city,
  availability: user.availability,
  experience: user.experience,
  lookingFor: user.lookingFor,
  githubUrl: user.githubUrl,
  linkedinUrl: user.linkedinUrl,
  website: user.website,
  profileViews: user.profileViews,
  lastSeen: user.lastSeen,
});
// Register
import PendingUser from "../models/PendingUser.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

router.post(
  "/register",
  [
    body("name")
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Name must be between 3-100 characters")
      .custom((value) => {
        const cleaned = value.replace(/\s/g, "");
        if (cleaned.length < 3) {
          throw new Error("Name must have at least 3 non-space characters");
        }
        return true;
      }),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ message: errors.array()[0], errors: errors.array() });
      }

      const { name, email, password } = req.body;

      const existingUser = await User.findOne({ email });
      const existingPending = await PendingUser.findOne({ email });

      if (existingUser || existingPending) {
        return res
          .status(400)
          .json({
            message:
              "A user already exists with this email or pending verification",
          });
      }

      // const hashedPassword = await bcrypt.hash(password, 12);
      const otp = generateOTP();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

      const pendingUser = new PendingUser({
        name,
        email,
        password,
        otp,
        otpExpiresAt,
      });
      await pendingUser.save();

      // Send OTP via email
      // console.log("EMAIL:", process.env.EMAIL);
      // console.log("EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD);

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "Your SkillSync OTP Verification",
        text: `Your OTP is ${otp}. It expires in 10 minutes.`,
      });

      res
        .status(200)
        .json({
          message:
            "OTP sent to your email. Please verify to complete registration.",
        });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error during registration" });
    }
  }
);

router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const pendingUser = await PendingUser.findOne({ email });

    if (!pendingUser) {
      return res.status(404).json({ message: "No pending registration found" });
    }

    if (pendingUser.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (pendingUser.otpExpiresAt < new Date()) {
      await PendingUser.deleteOne({ email });
      return res
        .status(400)
        .json({ message: "OTP expired. Please register again." });
    }

    // Create real user
    const user = new User({
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password,
      isVerified:true
    });

    await user.save();
    await PendingUser.deleteOne({ email });

    const token = generateToken(user._id);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: getUserData(user),
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Server error during OTP verification" });
  }
});

// Login
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email"),
    body("password").exists().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ message: "Validation failed", errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Update last seen
      await user.updateLastSeen();

      // Generate token
      const token = generateToken(user._id);

      res.json({
        message: "Login successful",
        token,
        user: getUserData(user),
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error during login" });
    }
  }
);

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("connections.user", "name avatar skills")
      .populate("sentRequests", "name avatar skills")
      .populate("receivedRequests", "name avatar skills");

    res.json(getUserData(user));
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Verify token
router.get("/verify", auth, (req, res) => {
  res.json({ valid: true, user: getUserData(req.user) });
});

export default router;
