import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import {
  translateProviderStatus,
  safeError,
  logProviderError,
} from "@/lib/generation-error";

// Credit costs: 100 internal credits = 1 displayed credit
// Video = 15 displayed credits = 1500 internal credits
const VIDEO_CREDIT_COST = 1500;

// ── Upload base64 image to Cloudinary → returns short CDN URL ────────────────
async function uploadImageToCloudinary(base64DataUri: string): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) throw new Error("Cloudinary not configured");

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "eromify-video-refs";

  const crypto = await import("crypto");
  const sigStr = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(sigStr).digest("hex");

  const formData = new FormData();
  formData.append("file", base64DataUri);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );
  if (!res.ok) throw new Error(`Cloudinary upload failed: ${res.status}`);
  const data = await res.json();
  // Force JPEG delivery — video models require JPEG, not WebP
  const url = (data.secure_url as string).replace(/\.(webp|png|gif|avif)$/i, ".jpg");
  return url;
}

export async function POST(req: NextRequest) {
  const t0 = Date.now();
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentCredits = typeof user.credits === "number" ? user.credits : 0;

    // ── Video Access Gate ─────────────────────────────────────────────────────
    const hasVideoAccess = user.videoAccess === true;
    if (!hasVideoAccess) {
      return NextResponse.json(
        {
          error: "Video generation requires a plan that includes video access.",
          code: "NO_VIDEO_ACCESS",
        },
        { status: 403 }
      );
    }

    if (currentCredits < VIDEO_CREDIT_COST) {
      return NextResponse.json(
        {
          error: `You don't have enough credits. Video generation costs ${VIDEO_CREDIT_COST / 100} credits. Please top up and try again.`,
          code: "INSUFFICIENT_CREDITS",
          required: VIDEO_CREDIT_COST,
          available: currentCredits,
        },
        { status: 402 }
      );
    }

    const body = await req.json();
    const {
      prompt,
      model = "wan",
      duration = 5,
      aspectRatio = "16:9",
      image,
    } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // ── Prompt sanitisation ──────────────────────────────────────────────────
    const safePrompt = prompt
      .trim()
      .replace(/[\r\n]+/g, " ")
      .replace(/\s{2,}/g, " ")
      .replace(/STRICT [A-Z ]+:/gi, "")
      .replace(/Negative Prompt:.*/i, "")
      .trim()
      .slice(0, 350);

    const apiKey = process.env.POLLINATIONS_API_KEY;
    if (!apiKey) {
      console.error("[generate-video] POLLINATIONS_API_KEY not configured");
      const { json, status } = safeError("GENERATION_FAILED", 500);
      return NextResponse.json(json, { status });
    }

    // ── Resolve reference image ──────────────────────────────────────────────
    let imageUrl: string | null = null;
    if (image && typeof image === "string") {
      if (image.startsWith("data:")) {
        imageUrl = await uploadImageToCloudinary(image);
        console.log("[video] Reference image uploaded to CDN");
      } else if (image.startsWith("http")) {
        imageUrl = image;
      }
    }

    // ── Build generation URL ─────────────────────────────────────────────────
    const modelMap: Record<string, string> = {
      "wan-2.6": "wan",
      "wan-fast": "wan-fast",
      "ltx-2": "ltx-2",
      "seedance-2.0": "seedance-2.0",
      "veo": "veo",
    };
    const resolvedModel = modelMap[model] ?? model;

    let generationUrl =
      `https://gen.pollinations.ai/video/${encodeURIComponent(safePrompt)}` +
      `?model=${encodeURIComponent(resolvedModel)}` +
      `&duration=${duration}` +
      `&aspectRatio=${encodeURIComponent(aspectRatio)}` +
      `&key=${apiKey}`;

    if (imageUrl) {
      generationUrl += `&image=${encodeURIComponent(imageUrl)}`;
    }

    console.log("[video] Requesting generation, URL length:", generationUrl.length, "chars");

    const callProvider = (url: string) =>
      fetch(url, { signal: AbortSignal.timeout(180_000) });

    let response = await callProvider(generationUrl);

    // If reference image caused a 400, retry without it
    if (!response.ok && response.status === 400 && imageUrl) {
      console.warn("[video] Reference image caused 400 — retrying without it");
      const urlWithoutImage = generationUrl.split("&image=")[0];
      response = await callProvider(urlWithoutImage);
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      const code = translateProviderStatus(response.status);
      logProviderError({
        route: "/api/generate-video",
        providerStatus: response.status,
        providerBody: errText,
        model: resolvedModel,
        userId: user._id?.toString(),
        durationMs: Date.now() - t0,
      });
      const err = safeError(code);
      return NextResponse.json(err.json, { status: err.status });
    }

    const videoBuffer = await response.arrayBuffer();

    // Deduct credits only after successful generation
    await User.updateOne({ _id: user._id }, { $inc: { credits: -VIDEO_CREDIT_COST } });

    return new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="eromify-video-${Date.now()}.mp4"`,
        "X-Credits-Deducted": String(VIDEO_CREDIT_COST),
        "X-Credits-Remaining": String(currentCredits - VIDEO_CREDIT_COST),
      },
    });
  } catch (err: unknown) {
    console.error("[generate-video] Unexpected error:", err instanceof Error ? err.message : err);
    const { json, status } = safeError("GENERATION_FAILED", 500);
    return NextResponse.json(json, { status });
  }
}
