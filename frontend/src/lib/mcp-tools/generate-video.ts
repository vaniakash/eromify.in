/**
 * generate-video.ts — MCP tool: generate_video
 *
 * Proxies to the Express backend (Render) to avoid Vercel's serverless
 * function timeout. The backend generates the video via Pollinations,
 * uploads it to Cloudinary, and returns a CDN URL.
 *
 * Credit cost: 1500 internal credits = 15 displayed credits per video.
 * Requires the user to have videoAccess = true on their account.
 */

import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import type { McpToolDefinition, McpCallToolResult, McpUserContext } from "./types";

const VIDEO_CREDIT_COST = 1500;

// ── Tool definition ───────────────────────────────────────────────────────────

export const generateVideoDefinition: McpToolDefinition = {
  name: "generate_video",
  description:
    "Generate an AI video on Eromify using your account credits. " +
    "Returns a Cloudinary CDN URL for the generated video. " +
    `Costs ${VIDEO_CREDIT_COST / 100} credits per video. Requires a video-enabled plan.`,
  inputSchema: {
    type: "object",
    properties: {
      prompt: {
        type: "string",
        description: "Text description of the video to generate.",
        minLength: 1,
        maxLength: 350,
      },
      model: {
        type: "string",
        description: "Video model to use. Defaults to 'wan'. Options: wan, wan-fast, ltx-2, seedance-2.0, veo.",
        enum: ["wan", "wan-fast", "ltx-2", "seedance-2.0", "veo"],
      },
      duration: {
        type: "number",
        description: "Video duration in seconds (3–8). Defaults to 5.",
        minimum: 3,
        maximum: 8,
      },
      aspectRatio: {
        type: "string",
        description: "Video aspect ratio. Defaults to '16:9'. Options: 16:9, 9:16, 1:1.",
        enum: ["16:9", "9:16", "1:1"],
      },
      imageUrl: {
        type: "string",
        description: "Optional. Public HTTPS URL of a reference image to animate.",
      },
    },
    required: ["prompt"],
    additionalProperties: false,
  },
};

// ── Tool handler ──────────────────────────────────────────────────────────────

interface GenerateVideoInput {
  prompt: string;
  model?: string;
  duration?: number;
  aspectRatio?: string;
  imageUrl?: string;
}

export async function executeGenerateVideo(
  input: GenerateVideoInput,
  user: McpUserContext
): Promise<McpCallToolResult> {
  // ── Plan check ────────────────────────────────────────────────────────────
  if (!user.videoAccess) {
    return {
      isError: true,
      content: [{
        type: "text",
        text: "Video generation requires a plan that includes video access (Pro Pack or Mega Pack). Upgrade at eromify.in.",
      }],
    };
  }

  // ── Credit check ──────────────────────────────────────────────────────────
  if (user.credits < VIDEO_CREDIT_COST) {
    return {
      isError: true,
      content: [{
        type: "text",
        text: `Insufficient credits: video generation costs ${VIDEO_CREDIT_COST / 100} credits but you only have ${Math.floor(user.credits / 100)}. Top up at eromify.in.`,
      }],
    };
  }

  // ── Call Express backend (avoids Vercel timeout) ──────────────────────────
  const backendUrl = process.env.RENDER_BACKEND_URL;
  const backendSecret = process.env.VIDEO_BACKEND_SECRET;

  if (!backendUrl || !backendSecret) {
    console.error("[mcp:generate_video] RENDER_BACKEND_URL or VIDEO_BACKEND_SECRET not configured");
    return {
      isError: true,
      content: [{ type: "text", text: "Video generation is temporarily unavailable. Please try again later." }],
    };
  }

  const payload = {
    prompt:      input.prompt.trim().slice(0, 350),
    model:       input.model ?? "wan",
    duration:    Math.min(Math.max(input.duration ?? 5, 3), 8),
    aspectRatio: input.aspectRatio ?? "16:9",
    imageUrl:    input.imageUrl ?? null,
  };

  let videoUrl: string;
  try {
    const response = await fetch(`${backendUrl}/mcp-internal/generate-video`, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${backendSecret}`,
      },
      body:   JSON.stringify(payload),
      signal: AbortSignal.timeout(240_000), // 4 min timeout for video
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error(`[mcp:generate_video] Backend error ${response.status}:`, errText);
      return {
        isError: true,
        content: [{ type: "text", text: "Video generation failed. Your credits were not deducted. Please try again." }],
      };
    }

    const data = await response.json();
    if (!data.videoUrl) {
      return {
        isError: true,
        content: [{ type: "text", text: "Video generation failed: no URL returned. Credits not deducted." }],
      };
    }
    videoUrl = data.videoUrl;
  } catch (err) {
    console.error("[mcp:generate_video] Fetch error:", err);
    return {
      isError: true,
      content: [{ type: "text", text: "Video generation timed out or failed. Credits were not deducted." }],
    };
  }

  // ── Deduct credits after successful generation ────────────────────────────
  await connectDB();
  await User.updateOne(
    { _id: user._id },
    { $inc: { credits: -VIDEO_CREDIT_COST } }
  );

  const remaining = Math.floor((user.credits - VIDEO_CREDIT_COST) / 100);

  return {
    content: [{
      type: "text",
      text: `Video generated successfully (${VIDEO_CREDIT_COST / 100} credits deducted, ${remaining} remaining):\n\n${videoUrl}`,
    }],
  };
}
