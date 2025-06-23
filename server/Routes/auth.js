import express from "express";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import User from "../models/user.js";
// import PendingUser from '../models/PendingUser.js';
// import bcrypt from 'bcrypt';
// import nodemailer from 'nodemailer';

import { auth } from "../middleware/auth.js";
import { sendEmailNotification } from '../utils/email.js';

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
  isVerified:user.isVerified,
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

    // Send welcome email
    try {
      await sendEmailNotification({
        to: user.email,
        subject: 'Welcome to SkillSync!',
        text: `Hi ${user.name},\n\nWelcome to SkillSync! Your account has been successfully created. We're excited to have you on board.\n\nStart exploring, connect with others, and make the most of your journey!\n\nBest regards,\nThe SkillSync Team`
      });
    } catch (err) {
      console.error('Failed to send welcome email:', err);
    }

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

      // Send login notification email if enabled
      try {
        if (user.notificationSettings?.emailNotifications) {
          await sendEmailNotification({
            to: user.email,
            subject: 'New Login Detected',
            text: `Your account was just logged in from a new device or location. If this wasn't you, please secure your account immediately.`
          });
        }
      } catch (err) {
        console.error('Failed to send login notification email:', err);
      }

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

// Forgot Password: Send Reset Password OTP
router.post('/send-reset-password-otp', [
  body('email').isEmail().withMessage('Please enter a valid email'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    const { email } = req.body;
    const user = await User.findOne({ email });
    // Always respond with success to avoid leaking which emails exist
    if (!user) {
      return res.json({ message: "can't find user with this email" });
    }
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationOtp = otp;
    user.verificationOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save();
    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: 'SkillSync Password Reset Code',
      text: `Your password reset code is ${otp}. It expires in 10 minutes.`,
    });
    return res.json({ message: 'If this email exists, a reset code has been sent.' });
  } catch (error) {
    console.error('Send reset password OTP error:', error);
    res.status(500).json({ message: 'Server error while sending reset code' });
  }
});

// Forgot Password: Reset Password
router.post('/reset-password', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.verificationOtp || user.verificationOtp !== otp) {
      return res.status(400).json({ message: 'Invalid code or email' });
    }
    if (user.verificationOtpExpiresAt < new Date()) {
      return res.status(400).json({ message: 'Code has expired. Please request a new one.' });
    }
    user.password = newPassword

    user.verificationOtp = null;
    user.verificationOtpExpiresAt = null;
    await user.save();
    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error while resetting password' });
  }
});

export default router;
