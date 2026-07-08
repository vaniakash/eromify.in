require("dotenv").config();
const express = require("express");
const cors = require("cors");
const generateVideoRoute = require("./routes/generate-video");

const app = express();
const PORT = process.env.PORT || 3001;

// ── CORS ─────────────────────────────────────────────────────────────────────
// Allow requests from your Vercel frontend only
const allowedOrigins = [
  "https://eromify.in",
  "https://www.eromify.in",
  "https://eromify.com",
  "https://www.eromify.com",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Render health checks, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "20mb" })); // allow base64 image in body

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "ai-video-backend", version: "1.0.0" });
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy", ts: new Date().toISOString() });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/generate-video", generateVideoRoute);

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("[server error]", err.message);
  res.status(500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`✅ ai-video-backend running on port ${PORT}`);
});
