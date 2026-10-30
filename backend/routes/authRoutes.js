import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

/* ================= REGISTER ================= */

router.post("/register", async (req, res) => {
  try {
    const { name, password } = req.body;
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const displayName = typeof name === "string" ? name.trim() : "";

    if (!displayName || !email || typeof password !== "string") {
      return res.status(400).json({
        msg: "Missing fields",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ msg: "Password must be at least 8 characters." });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        msg: "Database is not connected. Check the backend terminal and MONGO_URI.",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        msg: "JWT_SECRET is missing from backend/.env.",
      });
    }

    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(400).json({
        msg: "User already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: displayName,
      email,
      passwordHash,
    });

    const token = jwt.sign(
      {
        id: newUser._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      token,

      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ msg: "An account with this email already exists." });
    }

    console.error("REGISTER ERROR:", err.name, err.code || "");
    res.status(500).json({
      msg: "Registration failed. Check the backend terminal for the error details.",
    });
  }
});

/* ================= LOGIN ================= */

router.post("/login", async (req, res) => {
  try {

    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const { password } = req.body;

    if (!email || typeof password !== "string" || !password) {
      return res.status(400).json({ msg: "Email and password are required." });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ msg: "Database is not connected. Check the backend terminal and MONGO_URI." });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ msg: "JWT_SECRET is missing from backend/.env." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        msg: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!isMatch) {
      return res.status(400).json({
        msg: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (err) {

    console.log("LOGIN ERROR:", err);

    res.status(500).json({
      msg: "Server error",
    });
  }
});

/* ================= CHANGE PASSWORD ================= */

router.put("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      !currentPassword ||
      !newPassword
    ) {
      return res.status(400).json({ msg: "Current and new passwords are required." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ msg: "New password must be at least 8 characters." });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ msg: "Account not found." });
    }

    const isCurrentPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPassword) {
      return res.status(400).json({ msg: "Current password is incorrect." });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ msg: "New password must be different from your current password." });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ msg: "Password changed successfully." });
  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err.name, err.code || "");
    return res.status(500).json({ msg: "Unable to change password. Please try again." });
  }
});

export default router;
