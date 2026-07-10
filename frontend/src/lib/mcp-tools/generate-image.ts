/**
 * generate-image.ts — MCP tool: generate_image
 *
 * Generates 1–4 images via the Pollinations API (same provider as the website)
 * and uploads each result to Cloudinary. Deducts 100 internal credits per image
 * only after successful generation.
 *
 * Credit cost: 100 internal credits = 1 displayed credit per image.
 */

import { v2 as cloudinary } from "cloudinary";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { GalleryImage } from "@/models/GalleryImage";
import type { McpToolDefinition, McpCallToolResult, McpUserContext } from "./types";

// Configure Cloudinary (idempotent — safe to call multiple times)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure:     true,
});

const GEN_API = "https://gen.pollinations.ai";
const IMAGE_CREDIT_COST = 100; // internal credits per image

// ── Tool definition ───────────────────────────────────────────────────────────

export const generateImageDefinition: McpToolDefinition = {
  name: "generate_image",
  description:
    "Generate one or more AI images on Eromify using your account credits. " +
    "Returns Cloudinary CDN URLs for each generated image. " +
    `Costs ${IMAGE_CREDIT_COST / 100} credit per image.`,
  inputSchema: {
    type: "object",
    properties: {
      prompt: {
        type: "string",
        description: "Text description of the image to generate.",
        minLength: 1,
        maxLength: 1000,
      },
      negativePrompt: {
        type: "string",
        description: "Optional. What to exclude from the image.",
        maxLength: 500,
      },
      model: {
        type: "string",
        description: "AI model to use. Defaults to 'flux'. Use 'turbo' for faster (lower quality) generation.",
        enum: ["flux", "turbo"],
      },
      count: {
        type: "number",
        description: "Number of images to generate (1–4). Defaults to 1.",
        minimum: 1,
        maximum: 4,
      },
    },
    required: ["prompt"],
    additionalProperties: false,
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchAndUploadImage(
  prompt: string,
  negativePrompt: string | undefined,
  model: string,
  userEmail: string,
  userName: string
): Promise<string> {
  const seed = Math.floor(Math.random() * 2_000_000);
  const apiKey = process.env.POLLINATIONS_API_KEY;

  const url = new URL(`${GEN_API}/image/${encodeURIComponent(prompt.trim())}`);
  url.searchParams.set("model",   model);
  url.searchParams.set("width",   "1024");
  url.searchParams.set("height",  "1024");
  url.searchParams.set("seed",    String(seed));
  url.searchParams.set("enhance", "true");
  url.searchParams.set("nologo",  "true");
  if (negativePrompt?.trim()) {
    url.searchParams.set("negative_prompt", negativePrompt.trim());
  }
  if (apiKey) url.searchParams.set("key", apiKey);

  // Retry up to 3× on 429 (provider rate limit)
  let response: Response | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await sleep(2000 * attempt);
    response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(90_000),
    });
    if (response.status !== 429) break;
  }

  if (!response?.ok) {
    throw new Error(`Generation failed (provider status ${response?.status ?? "unknown"})`);
  }

  const contentType = response.headers.get("content-type") ?? "image/jpeg";
  const imageBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(imageBuffer).toString("base64");
  const dataUri = `data:${contentType};base64,${base64}`;

  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(dataUri, {
    folder:        "eromify/studio",
    resource_type: "image",
  });

  // Save to gallery (non-fatal)
  GalleryImage.create({
    userEmail,
    userName,
    cloudinaryUrl:      result.secure_url,
    cloudinaryPublicId: result.public_id,
    prompt:             prompt.trim(),
    mode:               "text2img",
    model,
    generationMs:       0, // MCP path — timing is approximate
  }).catch(() => {});

  return result.secure_url;
}

// ── Tool handler ──────────────────────────────────────────────────────────────

interface GenerateImageInput {
  prompt: string;
  negativePrompt?: string;
  model?: string;
  count?: number;
}

export async function executeGenerateImage(
  input: GenerateImageInput,
  user: McpUserContext
): Promise<McpCallToolResult> {
  const count = Math.min(Math.max(input.count ?? 1, 1), 4);
  const model = input.model ?? "flux";
  const totalCost = count * IMAGE_CREDIT_COST;

  // ── Credit check ─────────────────────────────────────────────────────────
  if (user.credits < totalCost) {
    const have = Math.floor(user.credits / 100);
    const need = Math.floor(totalCost / 100);
    return {
      isError: true,
      content: [{
        type: "text",
        text: `Insufficient credits: generating ${count} image${count > 1 ? "s" : ""} costs ${need} credit${need > 1 ? "s" : ""} but you only have ${have}. Top up at eromify.in.`,
      }],
    };
  }

  // ── Generate images ───────────────────────────────────────────────────────
  const urls: string[] = [];
  const errors: string[] = [];

  for (let i = 0; i < count; i++) {
    try {
      const imageUrl = await fetchAndUploadImage(
        input.prompt,
        input.negativePrompt,
        model,
        user.email,
        user.email, // use email as userName fallback
      );
      urls.push(imageUrl);
    } catch (err) {
      errors.push(`Image ${i + 1} failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  if (urls.length === 0) {
    return {
      isError: true,
      content: [{ type: "text", text: `Generation failed. No credits were deducted. ${errors.join("; ")}` }],
    };
  }

  // ── Deduct credits for successfully generated images ──────────────────────
  await connectDB();
  const deductAmount = urls.length * IMAGE_CREDIT_COST;
  await User.updateOne(
    { _id: user._id },
    { $inc: { credits: -deductAmount } }
  );

  // ── Build response ────────────────────────────────────────────────────────
  const creditLeft = user.credits - deductAmount;
  let text = `Generated ${urls.length} image${urls.length > 1 ? "s" : ""} (${Math.floor(deductAmount / 100)} credit${Math.floor(deductAmount / 100) > 1 ? "s" : ""} deducted, ${Math.floor(creditLeft / 100)} remaining):\n\n`;
  text += urls.map((u, i) => `${i + 1}. ${u}`).join("\n");
  if (errors.length > 0) text += `\n\nPartial failures: ${errors.join("; ")}`;

  return {
    content: [{ type: "text", text }],
  };
}
