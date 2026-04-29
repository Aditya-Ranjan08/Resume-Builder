import express from "express";
import Resume from "../models/Resume.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

/* ================= PUBLIC RESUME ================= */


router.get("/public/:id", async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

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
    }).sort({
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
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.userId,
    });

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
    const payload = {
      ...req.body,
      user: req.userId,
    };

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

    console.log("BODY:", req.body);

    const updated = await Resume.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.userId,
      },
      req.body,
      {
        new: true,
      }
    );

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