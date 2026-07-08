const express = require("express");
const crypto = require("crypto");
const fetch = require("node-fetch");
const { MongoClient, ServerApiVersion } = require("mongodb");
const router = express.Router();

// ── Constants ─────────────────────────────────────────────────────────────────
const VIDEO_CREDIT_COST = 1500;

// Models that reject &image= param (content/API policy)
const NO_IMAGE_MODELS = ["seedance-2.0", "seedance-pro", "seedance", "ltx-2", "grok-video-pro", "p-video"];

// UI model ID → exact Pollinations API model ID
const MODEL_MAP = {
  "wan-2.6":        "wan",           // Wan 2.6 ($0.075/s)
  "wan-fast":       "wan-fast",      // Wan 2.2 Fast ($0.015/s)
  "ltx-2":          "ltx-2",         // LTX-2.3 Alpha ($0.005/s)
  "p-video":        "p-video",       // Pruna P-Video ($0.036/s)
  "nova-reel":      "nova-reel",     // Amazon Nova Reel ($0.080/s)
  "veo":            "veo",           // Google Veo 3.1 Fast ($0.150/s)
  "grok-video-pro": "grok-video-pro",// xAI Grok Video ($0.075/s)
  "seedance-2.0":   "seedance-2.0",  // Seedance 2.0 ($0.270/s)
  "seedance-pro":   "seedance-pro",  // Seedance Pro-Fast
  "seedance":       "seedance",      // Seedance Lite
};

// Snap duration to nearest valid value per model (safety net)
const VALID_DURATIONS = {
  "veo":       [4, 6, 8],
  "nova-reel": [6, 12, 18, 24],
};
function snapDuration(model, requested) {
  const valid = VALID_DURATIONS[model];
  if (!valid) return requested;
  return valid.reduce((prev, curr) =>
    Math.abs(curr - requested) < Math.abs(prev - requested) ? curr : prev
  );
}

// ── MongoDB client ────────────────────────────────────────────────────────────
let mongoClient = null;
async function getDB() {
  if (!mongoClient) {
    mongoClient = new MongoClient(process.env.MONGODB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    await mongoClient.connect();
    console.log("[db] Connected to MongoDB");
  }
  return mongoClient.db();
}

// ── Ticket verification ───────────────────────────────────────────────────────
// Next.js /api/video-ticket issues HMAC-signed tokens.
// We verify them here using the shared VIDEO_BACKEND_SECRET.
function verifyTicket(ticketStr) {
  try {
    const [data, sig] = ticketStr.split(".");
    if (!data || !sig) return null;
    const expected = crypto
      .createHmac("sha256", process.env.VIDEO_BACKEND_SECRET)
      .update(data)
      .digest("hex");
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(data, "base64").toString("utf8"));
    if (Date.now() > payload.exp) return null; // expired
    return payload;
  } catch {
    return null;
  }
}

// ── Upload base64 image to Cloudinary ────────────────────────────────────────
async function uploadImageToCloudinary(base64DataUri) {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary not configured");
  }
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "eromify-video-refs";
  const sigStr = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
  const signature = crypto.createHash("sha1").update(sigStr).digest("hex");

  // Use node-fetch FormData approach
  const FormData = require("./form-data-compat"); // handled below
  const formData = new FormData();
  formData.append("file", base64DataUri);
  formData.append("api_key", CLOUDINARY_API_KEY);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );
  if (!res.ok) throw new Error(`Cloudinary upload failed: ${res.status}`);
  const data = await res.json();
  // Force JPEG — Pollinations video models prefer JPEG over WebP
  return data.secure_url.replace(/\.(webp|png|gif|avif)$/i, ".jpg");
}

// ── POST /generate-video ──────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    // 1. Verify ticket
    const authHeader = req.headers.authorization || "";
    const ticketStr = authHeader.replace("Bearer ", "").trim();
    const ticket = verifyTicket(ticketStr);
    if (!ticket) {
      return res.status(401).json({ error: "Invalid or expired ticket. Please try again." });
    }

    const { email } = ticket;

    // 2. Verify user in DB
    const db = await getDB();
    const user = await db.collection("users").findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const currentCredits = typeof user.credits === "number" ? user.credits : 0;

    if (!user.videoAccess) {
      return res.status(403).json({
        error: "Video generation requires Pro Pack (₹199) or Mega Pack (₹499).",
        code: "NO_VIDEO_ACCESS",
      });
    }

    if (currentCredits < VIDEO_CREDIT_COST) {
      return res.status(402).json({
        error: `Insufficient credits. Video generation costs ${VIDEO_CREDIT_COST} credits. You have ${currentCredits}.`,
        code: "INSUFFICIENT_CREDITS",
      });
    }

    // 3. Parse body
    const { prompt, model = "wan", duration = 5, aspectRatio = "16:9", image } = req.body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // 4. Sanitise prompt (prevent URL overflow)
    const safePrompt = prompt
      .trim()
      .replace(/[\r\n]+/g, " ")
      .replace(/\s{2,}/g, " ")
      .replace(/STRICT [A-Z ]+:/gi, "")
      .replace(/Negative Prompt:.*/i, "")
      .trim()
      .slice(0, 350);

    const apiKey = process.env.POLLINATIONS_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "POLLINATIONS_API_KEY not configured" });

    // 5. Resolve model
    const pollinationsModel = MODEL_MAP[model] ?? model;
    const modelSupportsImage = !NO_IMAGE_MODELS.includes(model);

    // 6. Handle reference image
    let imageUrl = null;
    if (image && typeof image === "string" && modelSupportsImage) {
      if (image.startsWith("data:")) {
        imageUrl = await uploadImageToCloudinary(image);
        console.log("[video] Image uploaded:", imageUrl);
      } else if (image.startsWith("http")) {
        imageUrl = image;
      }
    } else if (image && !modelSupportsImage) {
      console.log(`[video] Skipping image — ${pollinationsModel} does not support it`);
    }

    // 7. Build URL — snap duration to nearest valid value for this model
    const safeDuration = snapDuration(model, duration);
    let pollinationsUrl =
      `https://gen.pollinations.ai/video/${encodeURIComponent(safePrompt)}` +
      `?model=${encodeURIComponent(pollinationsModel)}` +
      `&duration=${safeDuration}` +
      `&aspectRatio=${encodeURIComponent(aspectRatio)}` +
      `&key=${apiKey}`;

    if (imageUrl) {
      pollinationsUrl += `&image=${encodeURIComponent(imageUrl)}`;
    }

    console.log(`[video] model=${pollinationsModel} duration=${safeDuration}s image=${imageUrl ? "yes" : "no"} url_len=${pollinationsUrl.length}`);

    // Seedance models take 4-5 min; Veo/Nova can be slow too — use 360s.
    // Other models (Wan, LTX) are faster — 180s is enough.
    const slowModels = ["seedance-2.0", "seedance-pro", "seedance", "veo", "nova-reel", "grok-video-pro"];
    const TIMEOUT_MS = slowModels.includes(model) ? 360_000 : 180_000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let pollinationsRes = await fetch(pollinationsUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    // Retry without image if image caused 400
    if (!pollinationsRes.ok && pollinationsRes.status === 400 && imageUrl) {
      console.warn("[video] Image caused 400 — retrying without image");
      const urlNoImage = pollinationsUrl.split("&image=")[0];
      const ctrl2 = new AbortController();
      const t2 = setTimeout(() => ctrl2.abort(), TIMEOUT_MS);
      pollinationsRes = await fetch(urlNoImage, { signal: ctrl2.signal });
      clearTimeout(t2);
    }

    if (!pollinationsRes.ok) {
      const errText = await pollinationsRes.text();
      return res.status(pollinationsRes.status).json({
        error: `Video generation failed: ${pollinationsRes.status} — ${errText}`,
      });
    }

    // 9. Read video buffer
    const videoBuffer = await pollinationsRes.buffer();

    // 10. Deduct credits only after success
    await db.collection("users").updateOne(
      { email },
      { $inc: { credits: -VIDEO_CREDIT_COST } }
    );
    console.log(`[video] ✅ Done — deducted ${VIDEO_CREDIT_COST} credits from ${email}`);

    // 11. Send video back to frontend
    res.set({
      "Content-Type": "video/mp4",
      "Content-Disposition": `attachment; filename="eromify-video-${Date.now()}.mp4"`,
      "X-Credits-Deducted": String(VIDEO_CREDIT_COST),
      "X-Credits-Remaining": String(currentCredits - VIDEO_CREDIT_COST),
    });
    res.send(videoBuffer);
  } catch (err) {
    if (err.name === "AbortError") {
      console.error("[video] Timeout — Pollinations took too long");
      return res.status(504).json({ error: "Video generation timed out. Please try a shorter duration or simpler prompt." });
    }
    console.error("[video] Error:", err.message);
    res.status(500).json({ error: err.message || "Unknown error" });
  }
});

module.exports = router;
