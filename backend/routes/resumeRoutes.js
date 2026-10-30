import express from "express";
import mongoose from "mongoose";
import Resume from "../models/Resume.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();
const resumeFields = [
  "name", "email", "phone", "address", "linkedin", "github", "portfolio", "headline", "summary",
  "skills", "meta", "education", "experiences", "projects", "achievements", "certifications",
];

const resumePayload = (body = {}) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) return {};
  return Object.fromEntries(
    resumeFields
      .filter((field) => Object.prototype.hasOwnProperty.call(body, field))
      .map((field) => [field, body[field]])
  );
};

/* ================= PUBLIC RESUME ================= */


router.get("/public/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ msg: "Invalid resume id." });
    const resume = await Resume.findById(req.params.id).select("-user");

    if (!resume) {
      return res.status(404).json({
        msg: "Resume not found",
      });
    }

    res.json(resume);

  } catch (err) {
    console.log(err);

    res.status(500).json({
      msg: "Server error",
    });
  }
});

/* ================= GET ALL RESUMES ================= */

router.get("/", auth, async (req, res) => {
  try {
    const resumes = await Resume.find({
      user: req.userId,
    }).select("-user").sort({
      updatedAt: -1,
    });

    res.json(resumes);

  } catch (err) {
    console.log(err);

    res.status(500).json({
      msg: "Server error",
    });
  }
});

/* ================= GET SINGLE RESUME ================= */

router.get("/:id", auth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ msg: "Invalid resume id." });
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.userId,
    }).select("-user");

    if (!resume) {
      return res.status(404).json({
        msg: "Resume not found",
      });
    }

    res.json(resume);

  } catch (err) {
    console.log(err);

    res.status(500).json({
      msg: "Server error",
    });
  }
});

/* ================= CREATE RESUME ================= */

router.post("/", auth, async (req, res) => {
  try {
    const payload = { ...resumePayload(req.body), user: req.userId };

    const created = await Resume.create(payload);

    res.status(201).json(created);

  } catch (err) {
    console.log(err);

    res.status(500).json({
      msg: "Server error",
    });
  }
});

/* ================= UPDATE RESUME ================= */

router.put("/:id", auth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ msg: "Invalid resume id." });

    const payload = resumePayload(req.body);
    if (!Object.keys(payload).length) {
      return res.status(400).json({ msg: "No resume fields were provided." });
    }

    const updated = await Resume.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.userId,
      },
      { $set: payload },
      {
        new: true,
        runValidators: true,
      }
    ).select("-user");

    if (!updated) {
      return res.status(404).json({
        msg: "Resume not found",
      });
    }

    res.json(updated);

  } catch (err) {
    console.log(err);

    res.status(500).json({
      msg: "Server error",
    });
  }
});

/* ================= DELETE RESUME ================= */

router.delete("/:id", auth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ msg: "Invalid resume id." });

    const deleted = await Resume.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!deleted) {
      return res.status(404).json({
        msg: "Resume not found",
      });
    }

    res.json({
      msg: "Resume deleted",
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      msg: "Server error",
    });
  }
});

export default router;
