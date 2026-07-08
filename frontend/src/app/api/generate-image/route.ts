import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { GalleryImage } from "@/models/GalleryImage";
import { v2 as cloudinary } from "cloudinary";
import {
  translateProviderStatus,
  safeError,
  logProviderError,
} from "@/lib/generation-error";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

const GEN_API = "https://gen.pollinations.ai";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function uploadToCloudinary(
  dataUri: string
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "eromify/studio",
    resource_type: "image",
  });
  return { url: result.secure_url, publicId: result.public_id };
}

export async function POST(request: NextRequest) {
  const t0 = Date.now();
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });

    if (!user || (user.credits ?? 0) < 100) {
      return NextResponse.json(
        { error: "You don't have enough credits for this generation.", code: "INSUFFICIENT_CREDITS" },
        { status: 402 }
      );
    }

    // ── Parse request body ───────────────────────────────────────────────────
    const { prompt, negativePrompt, model } = await request.json();

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const seed = Math.floor(Math.random() * 2_000_000);
    const apiKey = process.env.POLLINATIONS_API_KEY;
    const cleanPrompt = prompt.trim();

    // ── GET /image/{prompt} ─────────────────────────────────────────────────
    const url = new URL(`${GEN_API}/image/${encodeURIComponent(cleanPrompt)}`);
    url.searchParams.set("model", model || "flux");
    url.searchParams.set("width", "1024");
    url.searchParams.set("height", "1024");
    url.searchParams.set("seed", String(seed));
    url.searchParams.set("enhance", "true");
    url.searchParams.set("nologo", "true");
    if (negativePrompt && negativePrompt.trim().length > 0) {
      url.searchParams.set("negative_prompt", negativePrompt.trim());
    }
    if (apiKey) url.searchParams.set("key", apiKey);

    // ── Retry up to 3 times on transient errors ──────────────────────────────
    let response: Response | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await sleep(2000 * attempt);
      response = await fetch(url.toString(), {
        signal: AbortSignal.timeout(90_000),
      });
      if (response.status !== 429) break;
    }

    if (!response || !response.ok) {
      const status = response?.status ?? 500;
      const body = await response?.text().catch(() => "");
      const code = translateProviderStatus(status);
      logProviderError({
        route: "/api/generate-image",
        providerStatus: status,
        providerBody: body,
        model: model || "flux",
        userId: user._id?.toString(),
        durationMs: Date.now() - t0,
      });
      const err = safeError(code);
      return NextResponse.json(err.json, { status: err.status });
    }

    // Convert raw image bytes → base64 data URI
    const contentType = response.headers.get("content-type") ?? "image/jpeg";
    const imageBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(imageBuffer).toString("base64");
    const dataUri = `data:${contentType};base64,${base64}`;

    // ── Upload to Cloudinary & save to DB (non-blocking on error) ───────────
    try {
      const { url: cloudinaryUrl, publicId } = await uploadToCloudinary(dataUri);
      await GalleryImage.create({
        userEmail: session.user.email,
        userName: session.user.name ?? "",
        cloudinaryUrl,
        cloudinaryPublicId: publicId,
        prompt: cleanPrompt,
        mode: "text2img",
        model: model || "flux",
        generationMs: Date.now() - t0,
      });
    } catch (uploadErr) {
      // Don't fail the request if Cloudinary is down — image is still returned
      console.warn("Cloudinary save failed (non-fatal):", uploadErr);
    }

    // Deduct 100 internal credits (= 1 displayed credit) per image
    await User.updateOne({ _id: user._id }, { $inc: { credits: -100 } });

    return NextResponse.json({
      image: dataUri,
      model: model || "flux",
      seed,
    });
  } catch (err: unknown) {
    console.error("[generate-image] Unexpected error:", err instanceof Error ? err.message : err);
    const { json, status } = safeError("GENERATION_FAILED", 500);
    return NextResponse.json(json, { status });
  }
}
