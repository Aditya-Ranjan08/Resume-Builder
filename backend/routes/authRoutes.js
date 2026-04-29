import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

/* ================= REGISTER ================= */

router.post("/register", async (req, res) => {
  try {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        msg: "Missing fields",
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
      name,
      email,
      passwordHash,
    });

    console.log(" USER SAVED:", newUser);

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

    console.log("REGISTER ERROR:", err);

    res.status(500).json({
      msg: "Server error",
    });
  }
});

/* ================= LOGIN ================= */

router.post("/login", async (req, res) => {
  try {

    const { email, password } = req.body;

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

export default router;