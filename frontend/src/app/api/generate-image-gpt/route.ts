import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import {
  translateProviderStatus,
  safeError,
  logProviderError,
} from "@/lib/generation-error";

const GEN_API = "https://gen.pollinations.ai";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** GET /image/{prompt} — returns raw image bytes */
async function fetchImageGet(
  prompt: string,
  model: string,
  apiKey: string | undefined
): Promise<Response> {
  const url = new URL(`${GEN_API}/image/${encodeURIComponent(prompt)}`);
  url.searchParams.set("model", model);
  url.searchParams.set("width", "1024");
  url.searchParams.set("height", "1024");
  url.searchParams.set("nologo", "true");
  if (apiKey) url.searchParams.set("key", apiKey);

  for (let i = 0; i < 3; i++) {
    if (i > 0) await sleep(3000 * i);
    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(120_000),
    });
    if (res.status !== 429) return res;
  }
  throw new Error("Max retries exceeded");
}

/** POST /v1/images/edits — multipart, returns JSON with data[0].url or b64_json */
async function fetchImageEdit(
  prompt: string,
  model: string,
  imageFile: File,
  apiKey: string | undefined
): Promise<Response> {
  const authHeaders: Record<string, string> = {};
  if (apiKey) authHeaders["Authorization"] = `Bearer ${apiKey}`;

  for (let i = 0; i < 3; i++) {
    if (i > 0) await sleep(3000 * i);
    const form = new FormData();
    form.append("model", model);
    form.append("prompt", prompt);
    form.append("image", imageFile, imageFile.name);
    const res = await fetch(`${GEN_API}/v1/images/edits`, {
      method: "POST",
      headers: authHeaders,
      body: form,
      signal: AbortSignal.timeout(120_000),
    });
    if (res.status !== 429) return res;
  }
  throw new Error("Max retries exceeded");
}

/** Convert raw Response (image bytes) to base64 data URI */
async function toDataURI(res: Response): Promise<string> {
  const ct = res.headers.get("content-type") ?? "image/png";
  const buf = await res.arrayBuffer();
  return `data:${ct};base64,${Buffer.from(buf).toString("base64")}`;
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

    // ── Parse form data ──────────────────────────────────────────────────────
    const formData = await request.formData();
    const prompt = formData.get("prompt") as string | null;
    const imageFile = formData.get("image") as File | null;

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.POLLINATIONS_API_KEY;

    if (imageFile) {
      // ── IMAGE-TO-IMAGE ───────────────────────────────────────────────────
      const editModel = "kontext";
      const editRes = await fetchImageEdit(prompt.trim(), editModel, imageFile, apiKey);

      if (!editRes.ok) {
        const body = await editRes.text().catch(() => "");
        const code = translateProviderStatus(editRes.status);
        logProviderError({
          route: "/api/generate-image-gpt (image-to-image)",
          providerStatus: editRes.status,
          providerBody: body,
          model: editModel,
          userId: user._id?.toString(),
          durationMs: Date.now() - t0,
        });
        const err = safeError(code);
        return NextResponse.json(err.json, { status: err.status });
      }

      // kontext via /v1/images/edits may return JSON (url) or raw bytes
      const contentType = editRes.headers.get("content-type") ?? "";
      let imageDataUri: string;

      if (contentType.includes("application/json")) {
        const json = await editRes.json();
        const imgUrl: string | undefined = json?.data?.[0]?.url;
        const b64: string | undefined = json?.data?.[0]?.b64_json;
        if (b64) {
          imageDataUri = `data:image/png;base64,${b64}`;
        } else if (imgUrl) {
          const imgRes = await fetch(imgUrl, { signal: AbortSignal.timeout(60_000) });
          if (!imgRes.ok) {
            logProviderError({
              route: "/api/generate-image-gpt (fetch result url)",
              providerStatus: imgRes.status,
              model: editModel,
              userId: user._id?.toString(),
              durationMs: Date.now() - t0,
            });
            const { json: errJson, status } = safeError("GENERATION_FAILED");
            return NextResponse.json(errJson, { status });
          }
          imageDataUri = await toDataURI(imgRes);
        } else {
          logProviderError({ route: "/api/generate-image-gpt", providerBody: "No image in JSON response", model: editModel });
          const { json: errJson, status } = safeError("GENERATION_FAILED");
          return NextResponse.json(errJson, { status });
        }
      } else {
        // Raw image bytes returned directly
        imageDataUri = await toDataURI(editRes);
      }

      await User.updateOne({ _id: user._id }, { $inc: { credits: -1 } });
      return NextResponse.json({ image: imageDataUri, model: editModel, mode: "image-to-image" });

    } else {
      // ── TEXT-TO-IMAGE ────────────────────────────────────────────────────
      // Try gptimage-large → fallback gptimage
      const textModels = ["gptimage-large", "gptimage"];
      let lastStatus = 500;
      let lastBody = "";

      for (const model of textModels) {
        const imgRes = await fetchImageGet(prompt.trim(), model, apiKey);

        if (imgRes.ok) {
          const imageDataUri = await toDataURI(imgRes);
          await User.updateOne({ _id: user._id }, { $inc: { credits: -1 } });
          return NextResponse.json({ image: imageDataUri, model, mode: "text-to-image" });
        }

        lastStatus = imgRes.status;
        lastBody = await imgRes.text().catch(() => "");

        // Only fall through to next model on 4xx
        if (imgRes.status === 429) break;
      }

      // All models failed — log server-side only
      logProviderError({
        route: "/api/generate-image-gpt (text-to-image)",
        providerStatus: lastStatus,
        providerBody: lastBody,
        model: "gptimage-large/gptimage",
        userId: user._id?.toString(),
        durationMs: Date.now() - t0,
      });
      const code = translateProviderStatus(lastStatus);
      const err = safeError(code);
      return NextResponse.json(err.json, { status: err.status });
    }
  } catch (err: unknown) {
    console.error("[generate-image-gpt] Unexpected error:", err instanceof Error ? err.message : err);
    const { json, status } = safeError("GENERATION_FAILED", 500);
    return NextResponse.json(json, { status });
  }
}
