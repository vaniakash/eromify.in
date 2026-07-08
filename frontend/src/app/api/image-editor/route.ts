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

async function uploadDataUri(dataUri: string, folder: string): Promise<string> {
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
  });
  return result.secure_url;
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

    if (!user || (user.credits ?? 0) <= 0) {
      return NextResponse.json(
        { error: "You don't have enough credits for this generation.", code: "INSUFFICIENT_CREDITS" },
        { status: 402 }
      );
    }

    const { referenceImage, targetImage, prompt, width, height } = await request.json();

    if (!referenceImage || !targetImage) {
      return NextResponse.json(
        { error: "Both reference and target images are required" },
        { status: 400 }
      );
    }

    // Upload both images to Cloudinary to get public URLs
    const [refUrl, targetUrl] = await Promise.all([
      uploadDataUri(referenceImage, "eromify/image-editor/refs"),
      uploadDataUri(targetImage, "eromify/image-editor/targets"),
    ]);

    // Build the edit prompt
    const editPrompt = prompt?.trim()
      ? prompt.trim()
      : "Transfer the exact outfit, clothing style, accessories, hairstyle, makeup, and lighting from the first reference image to the person in the second image. Keep the person's face, skin tone, and body identity completely unchanged. Maintain photorealistic quality.";

    // Use detected dimensions (capped to safe values)
    const outWidth = Math.min(Math.max(width ?? 1024, 256), 1536);
    const outHeight = Math.min(Math.max(height ?? 1024, 256), 1536);

    const apiKey = process.env.POLLINATIONS_API_KEY;
    const url = new URL(`${GEN_API}/image/${encodeURIComponent(editPrompt)}`);
    url.searchParams.set("model", "gptimage-large");
    url.searchParams.set("width", String(outWidth));
    url.searchParams.set("height", String(outHeight));
    url.searchParams.set("image", `${refUrl}|${targetUrl}`);
    url.searchParams.set("nologo", "true");
    if (apiKey) url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(120_000),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      const code = translateProviderStatus(response.status);
      logProviderError({
        route: "/api/image-editor",
        providerStatus: response.status,
        providerBody: body,
        model: "gptimage-large",
        userId: user._id?.toString(),
        durationMs: Date.now() - t0,
      });
      const err = safeError(code);
      return NextResponse.json(err.json, { status: err.status });
    }

    const contentType = response.headers.get("content-type") ?? "image/jpeg";
    const imageBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(imageBuffer).toString("base64");
    const dataUri = `data:${contentType};base64,${base64}`;

    // Save result to Cloudinary & gallery
    try {
      const { secure_url: cloudinaryUrl, public_id: cloudinaryPublicId } =
        await cloudinary.uploader.upload(dataUri, {
          folder: "eromify/image-editor/results",
          resource_type: "image",
        });

      await GalleryImage.create({
        userEmail: session.user.email,
        userName: session.user.name ?? "",
        cloudinaryUrl,
        cloudinaryPublicId,
        prompt: editPrompt,
        mode: "image-edit",
        model: "gptimage-large",
        generationMs: Date.now() - t0,
      });
    } catch (e) {
      console.warn("Cloudinary save failed (non-fatal):", e);
    }

    // Deduct 1 credit only after successful generation
    await User.updateOne({ _id: user._id }, { $inc: { credits: -1 } });

    return NextResponse.json({ image: dataUri });
  } catch (err: unknown) {
    console.error("[image-editor] Unexpected error:", err instanceof Error ? err.message : err);
    const { json, status } = safeError("GENERATION_FAILED", 500);
    return NextResponse.json(json, { status });
  }
}
