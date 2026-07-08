import { NextRequest, NextResponse } from "next/server";

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

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const mode = formData.get("mode") as string; // "text2img" | "edit" | "multiref"
    const prompt = (formData.get("prompt") as string)?.trim();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.POLLINATIONS_API_KEY;
    const authHeaders: Record<string, string> = {};
    if (apiKey) authHeaders["Authorization"] = `Bearer ${apiKey}`;

    // ── MODE 1: Text → Image ────────────────────────────────────────────────
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
        return NextResponse.json(
          { error: `Provider error (${res.status}): ${body.slice(0, 300)}` },
          { status: res.status }
        );
      }

      const dataUri = await toDataURI(res);
      return NextResponse.json({ image: dataUri, mode });
    }

    // ── MODE 2: Image Editing ───────────────────────────────────────────────
    if (mode === "edit") {
      const imageFile = formData.get("image") as File | null;
      if (!imageFile) {
        return NextResponse.json({ error: "Source image required for edit mode" }, { status: 400 });
      }

      const form = new FormData();
      form.append("model", "klein");
      form.append("prompt", prompt);
      form.append("image", imageFile, imageFile.name);

      const res = await withRetry(() =>
        fetch(`${GEN_API}/v1/images/edits`, {
          method: "POST",
          headers: authHeaders,
          body: form,
          signal: AbortSignal.timeout(120_000),
        })
      );

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        return NextResponse.json(
          { error: `Provider error (${res.status}): ${body.slice(0, 300)}` },
          { status: res.status }
        );
      }

      const ct = res.headers.get("content-type") ?? "";
      let dataUri: string;

      if (ct.includes("application/json")) {
        const json = await res.json();
        const b64: string | undefined = json?.data?.[0]?.b64_json;
        const imgUrl: string | undefined = json?.data?.[0]?.url;
        if (b64) {
          dataUri = `data:image/png;base64,${b64}`;
        } else if (imgUrl) {
          dataUri = imgUrl;
        } else {
          return NextResponse.json({ error: "No image in response" }, { status: 502 });
        }
      } else {
        dataUri = await toDataURI(res);
      }

      return NextResponse.json({ image: dataUri, mode });
    }

    // ── MODE 3: Multi-Reference ─────────────────────────────────────────────
    if (mode === "multiref") {
      const ref1 = formData.get("ref1") as File | null;
      const ref2 = formData.get("ref2") as File | null;

      if (!ref1) {
        return NextResponse.json({ error: "At least one reference image required" }, { status: 400 });
      }

      const form = new FormData();
      form.append("model", "klein");
      form.append("prompt", prompt);
      form.append("image", ref1, ref1.name);
      if (ref2) form.append("image", ref2, ref2.name);

      const res = await withRetry(() =>
        fetch(`${GEN_API}/v1/images/edits`, {
          method: "POST",
          headers: authHeaders,
          body: form,
          signal: AbortSignal.timeout(120_000),
        })
      );

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        return NextResponse.json(
          { error: `Provider error (${res.status}): ${body.slice(0, 300)}` },
          { status: res.status }
        );
      }

      const ct = res.headers.get("content-type") ?? "";
      let dataUri: string;

      if (ct.includes("application/json")) {
        const json = await res.json();
        const b64: string | undefined = json?.data?.[0]?.b64_json;
        const imgUrl: string | undefined = json?.data?.[0]?.url;
        if (b64) {
          dataUri = `data:image/png;base64,${b64}`;
        } else if (imgUrl) {
          dataUri = imgUrl;
        } else {
          return NextResponse.json({ error: "No image in response" }, { status: 502 });
        }
      } else {
        dataUri = await toDataURI(res);
      }

      return NextResponse.json({ image: dataUri, mode });
    }

    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  } catch (err: unknown) {
    console.error("[test-klein]", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
