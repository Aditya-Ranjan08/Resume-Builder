import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* ================= BASIC INFO ================= */

    name: String,
    email: String,
    phone: String,
    address: String,

    linkedin: String,
    github: String,
    portfolio: String,

    headline: String,
    summary: String,

    /* ================= SKILLS ================= */

        skills: [String],

    meta: {
      type: Object,
      default: {},
    },

    /* ================= EDUCATION ================= */

    education: [
      {
        degree: String,

        // 
        college: String,

        year: String,
      },
    ],

    /* ================= EXPERIENCE ================= */

    experiences: [
      {
        title: String,
        company: String,

        // 
        desc: String,
      },
    ],

    /* ================= PROJECTS ================= */

    projects: [
      {
        title: String,
        tech: String,
        description: String,
      },
    ],

    /* ================= ACHIEVEMENTS ================= */

    achievements: [String],

    meta: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Resume", resumeSchema);