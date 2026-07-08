import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { GalleryImage } from "@/models/GalleryImage";
import { User } from "@/models/User";
import { v2 as cloudinary } from "cloudinary";
import {
  translateProviderStatus,
  safeError,
  logProviderError,
} from "@/lib/generation-error";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const GEN_API = "https://gen.pollinations.ai";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function withRetry(fn: () => Promise<Response>, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    if (i > 0) await sleep(3000 * i);
    const res = await fn();
    if (res.status !== 429) return res;
  }
  throw new Error("Max retries exceeded (rate limited)");
}

async function toDataURI(res: Response): Promise<string> {
  const buf = await res.arrayBuffer();
  const ct = res.headers.get("content-type") ?? "image/jpeg";
  const b64 = Buffer.from(buf).toString("base64");
  return `data:${ct};base64,${b64}`;
}

async function uploadToCloudinary(dataUri: string): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "eromify/influencer-gallery",
    resource_type: "image",
  });
  return { url: result.secure_url, publicId: result.public_id };
}

export async function POST(req: NextRequest) {
  const t0 = Date.now();
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });

    if (!user || (user.credits ?? 0) < 5) {
      return NextResponse.json(
        { error: "You don't have enough credits. Generating an influencer image costs 5 credits.", code: "INSUFFICIENT_CREDITS" },
        { status: 402 }
      );
    }

    const formData = await req.formData();
    const mode = formData.get("mode") as string;
    const prompt = (formData.get("prompt") as string)?.trim();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.POLLINATIONS_API_KEY;
    const authHeaders: Record<string, string> = {};
    if (apiKey) authHeaders["Authorization"] = `Bearer ${apiKey}`;

    let dataUri: string;

    // ── MODE 1: Text → Image ─────────────────────────────────────────────────
    if (mode === "text2img") {
      const url = new URL(`${GEN_API}/image/${encodeURIComponent(prompt)}`);
      url.searchParams.set("model", "klein");
      url.searchParams.set("width", "1024");
      url.searchParams.set("height", "1024");
      url.searchParams.set("nologo", "true");
      if (apiKey) url.searchParams.set("key", apiKey);

      const res = await withRetry(() =>
        fetch(url.toString(), { signal: AbortSignal.timeout(120_000) })
      );
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        const code = translateProviderStatus(res.status);
        logProviderError({
          route: "/api/influencer-generate (text2img)",
          providerStatus: res.status,
          providerBody: body,
          model: "klein",
          userId: user._id?.toString(),
          durationMs: Date.now() - t0,
        });
        const err = safeError(code);
        return NextResponse.json(err.json, { status: err.status });
      }
      dataUri = await toDataURI(res);
    }

    // ── MODE 2: Image Editing ────────────────────────────────────────────────
    else if (mode === "edit") {
      const imageFile = formData.get("image") as File | null;
      if (!imageFile) {
        return NextResponse.json({ error: "Source image required for edit mode" }, { status: 400 });
      }
      const form = new FormData();
      form.append("model", "klein");
      form.append("prompt", prompt);
      form.append("image", imageFile, imageFile.name);

      const res = await withRetry(() =>
        fetch(`${GEN_API}/v1/images/edits`, { method: "POST", headers: authHeaders, body: form, signal: AbortSignal.timeout(120_000) })
      );
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        const code = translateProviderStatus(res.status);
        logProviderError({
          route: "/api/influencer-generate (edit)",
          providerStatus: res.status,
          providerBody: body,
          model: "klein",
          userId: user._id?.toString(),
          durationMs: Date.now() - t0,
        });
        const err = safeError(code);
        return NextResponse.json(err.json, { status: err.status });
      }
      const ct = res.headers.get("content-type") ?? "";
      if (ct.includes("application/json")) {
        const json = await res.json();
        const b64: string | undefined = json?.data?.[0]?.b64_json;
        const imgUrl: string | undefined = json?.data?.[0]?.url;
        if (b64) dataUri = `data:image/png;base64,${b64}`;
        else if (imgUrl) dataUri = imgUrl;
        else {
          logProviderError({ route: "/api/influencer-generate (edit)", providerBody: "No image in JSON response", model: "klein" });
          const { json: errJson, status } = safeError("GENERATION_FAILED");
          return NextResponse.json(errJson, { status });
        }
      } else {
        dataUri = await toDataURI(res);
      }
    }

    // ── MODE 3: Multi-Reference ───────────────────────────────────────────────
    else if (mode === "multiref") {
      const ref1 = formData.get("ref1") as File | null;
      const ref2 = formData.get("ref2") as File | null;
      if (!ref1) return NextResponse.json({ error: "At least one reference image required" }, { status: 400 });

      const form = new FormData();
      form.append("model", "klein");
      form.append("prompt", prompt);
      form.append("image", ref1, ref1.name);
      if (ref2) form.append("image", ref2, ref2.name);

      const res = await withRetry(() =>
        fetch(`${GEN_API}/v1/images/edits`, { method: "POST", headers: authHeaders, body: form, signal: AbortSignal.timeout(120_000) })
      );
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        const code = translateProviderStatus(res.status);
        logProviderError({
          route: "/api/influencer-generate (multiref)",
          providerStatus: res.status,
          providerBody: body,
          model: "klein",
          userId: user._id?.toString(),
          durationMs: Date.now() - t0,
        });
        const err = safeError(code);
        return NextResponse.json(err.json, { status: err.status });
      }
      const ct = res.headers.get("content-type") ?? "";
      if (ct.includes("application/json")) {
        const json = await res.json();
        const b64: string | undefined = json?.data?.[0]?.b64_json;
        const imgUrl: string | undefined = json?.data?.[0]?.url;
        if (b64) dataUri = `data:image/png;base64,${b64}`;
        else if (imgUrl) dataUri = imgUrl;
        else {
          logProviderError({ route: "/api/influencer-generate (multiref)", providerBody: "No image in JSON response", model: "klein" });
          const { json: errJson, status } = safeError("GENERATION_FAILED");
          return NextResponse.json(errJson, { status });
        }
      } else {
        dataUri = await toDataURI(res);
      }
    } else {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

    const generationMs = Date.now() - t0;

    // Upload to Cloudinary
    const { url: cloudinaryUrl, publicId: cloudinaryPublicId } = await uploadToCloudinary(dataUri);

    // Save to DB
    await GalleryImage.create({
      userEmail: session.user.email,
      userName: session.user.name ?? undefined,
      cloudinaryUrl,
      cloudinaryPublicId,
      prompt,
      mode,
      generationMs,
    });

    // Deduct 5 credits only after successful generation
    await User.updateOne({ _id: user._id }, { $inc: { credits: -5 } });

    return NextResponse.json({ image: cloudinaryUrl, mode, generationMs });
  } catch (err: unknown) {
    console.error("[influencer-generate] Unexpected error:", err instanceof Error ? err.message : err);
    const { json, status } = safeError("GENERATION_FAILED", 500);
    return NextResponse.json(json, { status });
  }
}
