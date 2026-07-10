/**
 * mcp-internal-video.js
 *
 * Internal Express route for MCP-triggered video generation.
 * Called by the Next.js MCP server at /api/mcp to avoid Vercel's
 * serverless timeout (videos can take 2–3 minutes).
 *
 * Auth: Bearer <VIDEO_BACKEND_SECRET> (shared secret from .env)
 * The Next.js MCP layer handles user auth and credit deduction;
 * this route only handles generation + Cloudinary upload.
 *
 * POST /mcp-internal/generate-video
 * Body: { prompt, model, duration, aspectRatio, imageUrl? }
 * Returns: { videoUrl } on success, { error } on failure
 */

const express = require("express");
const crypto  = require("crypto");
const fetch   = require("node-fetch");
const router  = express.Router();

// ── Model map (same as generate-video.js) ─────────────────────────────────────
const MODEL_MAP = {
  "wan":        "wan",
  "wan-fast":   "wan-fast",
  "ltx-2":      "ltx-2",
  "seedance-2.0": "seedance-2.0",
  "veo":        "veo",
};

// Models that reject &image= param
const NO_IMAGE_MODELS = new Set(["seedance-2.0", "ltx-2"]);

// ── Cloudinary upload helper ──────────────────────────────────────────────────

async function uploadVideoToCloudinary(videoBuffer) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary not configured");
  }

  const timestamp  = Math.floor(Date.now() / 1000);
  const folder     = "eromify-mcp-videos";
  const publicId   = `mcp-video-${Date.now()}`;

  // Build SHA-1 signature
  const sigStr    = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(sigStr).digest("hex");

  // Convert buffer to base64 data URI for Cloudinary upload
  const base64   = videoBuffer.toString("base64");
  const dataUri  = `data:video/mp4;base64,${base64}`;

  const formData = new (require("form-data"))();
  formData.append("file",      dataUri);
  formData.append("api_key",   apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder",    folder);
  formData.append("public_id", publicId);
  formData.append("resource_type", "video");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`Cloudinary upload failed (${res.status}): ${errBody.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.secure_url;
}

// ── POST /mcp-internal/generate-video ────────────────────────────────────────

router.post("/", async (req, res) => {
  const t0 = Date.now();

  // ── Auth: verify Bearer secret ────────────────────────────────────────────
  const authHeader = req.headers["authorization"] ?? "";
  const secret     = process.env.VIDEO_BACKEND_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    console.warn("[mcp-internal-video] Unauthorized request");
    return res.status(401).json({ error: "Unauthorized" });
  }

  const {
    prompt,
    model       = "wan",
    duration    = 5,
    aspectRatio = "16:9",
    imageUrl    = null,
  } = req.body ?? {};

  // ── Basic input validation ─────────────────────────────────────────────────
  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return res.status(400).json({ error: "prompt is required" });
  }

  const safePrompt = prompt.trim()
    .replace(/[\r\n]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .slice(0, 350);

  const resolvedModel = MODEL_MAP[model] ?? "wan";
  const safeDuration  = Math.min(Math.max(Number(duration) || 5, 3), 8);

  const apiKey = process.env.POLLINATIONS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "POLLINATIONS_API_KEY not configured" });
  }

  // ── Build Pollinations URL ─────────────────────────────────────────────────
  let generationUrl =
    `https://gen.pollinations.ai/video/${encodeURIComponent(safePrompt)}` +
    `?model=${encodeURIComponent(resolvedModel)}` +
    `&duration=${safeDuration}` +
    `&aspectRatio=${encodeURIComponent(aspectRatio)}` +
    `&key=${apiKey}`;

  // Attach reference image if model supports it
  if (imageUrl && !NO_IMAGE_MODELS.has(resolvedModel)) {
    generationUrl += `&image=${encodeURIComponent(imageUrl)}`;
  }

  console.log(`[mcp-internal-video] Starting generation: model=${resolvedModel} duration=${safeDuration}s`);

  // ── Call Pollinations ──────────────────────────────────────────────────────
  let pollinationsRes;
  try {
    pollinationsRes = await fetch(generationUrl, {
      signal: AbortSignal.timeout(240_000), // 4 min
    });

    // If reference image caused a 400, retry without it
    if (!pollinationsRes.ok && pollinationsRes.status === 400 && imageUrl) {
      console.warn("[mcp-internal-video] Image caused 400 — retrying without it");
      const urlNoImage = generationUrl.split("&image=")[0];
      pollinationsRes = await fetch(urlNoImage, {
        signal: AbortSignal.timeout(240_000),
      });
    }
  } catch (err) {
    console.error("[mcp-internal-video] Pollinations fetch error:", err.message);
    return res.status(502).json({ error: "Video generation timed out or failed" });
  }

  if (!pollinationsRes.ok) {
    const errText = await pollinationsRes.text().catch(() => "");
    console.error(`[mcp-internal-video] Pollinations error ${pollinationsRes.status}:`, errText.slice(0, 300));
    return res.status(502).json({ error: "Video generation failed" });
  }

  // ── Upload to Cloudinary ───────────────────────────────────────────────────
  let videoUrl;
  try {
    const videoArrayBuffer = await pollinationsRes.arrayBuffer();
    const videoBuffer      = Buffer.from(videoArrayBuffer);
    console.log(`[mcp-internal-video] Got ${Math.round(videoBuffer.length / 1024)} KB video in ${Date.now() - t0}ms — uploading to Cloudinary`);
    videoUrl = await uploadVideoToCloudinary(videoBuffer);
    console.log(`[mcp-internal-video] Cloudinary upload complete: ${videoUrl}`);
  } catch (err) {
    console.error("[mcp-internal-video] Cloudinary upload error:", err.message);
    return res.status(500).json({ error: "Failed to upload video to CDN" });
  }

  return res.json({
    videoUrl,
    durationMs: Date.now() - t0,
  });
});

module.exports = router;
