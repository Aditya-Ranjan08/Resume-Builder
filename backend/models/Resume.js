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

    /* ================= EDUCATION ================= */

    education: [
      {
        degree: String,
        college: String,
        year: String,
        gradeType: String,
        grade: String,
      },
    ],

    /* ================= EXPERIENCE ================= */

    experiences: [
      {
        title: String,
        company: String,
        desc: String,
        startDate: String,
        endDate: String,
        isCurrent: Boolean,
      },
    ],

    /* ================= PROJECTS ================= */

    projects: [
      {
        title: String,
        role: String,
        tech: String,
        description: String,
        startDate: String,
        endDate: String,
        githubUrl: String,
        liveUrl: String,
      },
    ],

    /* ================= ACHIEVEMENTS ================= */

    achievements: [String],
    certifications: [String],

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
