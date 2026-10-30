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

app.use(express.json({ limit: "1mb" }));

let mongoConnectionPromise;
const connectToMongoDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing from backend/.env.");
  if (!mongoConnectionPromise) {
    mongoConnectionPromise = mongoose.connect(process.env.MONGO_URI)
      .finally(() => { mongoConnectionPromise = null; });
  }
  await mongoConnectionPromise;
};

app.get("/api/health", (req, res) => {
  res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({
    ok: mongoose.connection.readyState === 1,
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/api", async (req, res, next) => {
  try {
    await connectToMongoDB();
    next();
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    res.status(503).json({ msg: "Database is unavailable. Check the backend database connection." });
  }
});

/* ================= ROUTES ================= */

app.use("/api/auth", authRoutes);

app.use("/api/resumes", resumeRoutes);

/* ================= TEST ================= */

app.get("/", (req, res) => {
  res.send("Resume API Running");
});

/* ================= START SERVER ================= */

if (process.env.VERCEL !== "1") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
    connectToMongoDB().then(() => console.log("MongoDB connected")).catch((error) => console.error("MongoDB connection error:", error.message));
  });
}

export default app;
