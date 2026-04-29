import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";

dotenv.config();

const app = express();

/* ================= MIDDLEWARE ================= */

app.use(cors());

app.use(express.json());

/* ================= ROUTES ================= */

app.use("/api/auth", authRoutes);

app.use("/api/resumes", resumeRoutes);

/* ================= TEST ================= */

app.get("/", (req, res) => {
  res.send("Resume API Running ");
});

/* ================= CONNECT DB ================= */

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log(" MongoDB Connected");
  } catch (error) {
    console.log(" MongoDB Error:", error.message);
  }
};

/* ================= START SERVER ================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(` Server running on ${PORT}`);

  await connectToMongoDB();
});

export default app;