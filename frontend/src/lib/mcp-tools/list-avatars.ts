/**
 * list-avatars.ts — MCP tool: list_avatars
 *
 * Returns the Eromify avatar template gallery, optionally filtered by
 * category and limited in count. No credits are consumed.
 */

import { connectDB } from "@/lib/db";
import { AvatarTemplate } from "@/models/AvatarTemplate";
import type { McpToolDefinition, McpCallToolResult } from "./types";

// ── Tool definition (sent in tools/list response) ─────────────────────────────

export const listAvatarsDefinition: McpToolDefinition = {
  name: "list_avatars",
  description:
    "List all available Eromify AI avatar templates. Returns names, categories, and preview image URLs. No credits required.",
  inputSchema: {
    type: "object",
    properties: {
      category: {
        type: "string",
        description:
          "Optional filter by category. One of: Female, Male, Anime, Realistic, 3D Render. Omit to return all categories.",
        enum: ["Female", "Male", "Anime", "Realistic", "3D Render"],
      },
      limit: {
        type: "number",
        description: "Maximum number of avatars to return (1–50). Defaults to 20.",
        minimum: 1,
        maximum: 50,
      },
    },
    required: [],
    additionalProperties: false,
  },
};

// ── Tool handler ─────────────────────────────────────────────────────────────

interface ListAvatarsInput {
  category?: string;
  limit?: number;
}

export async function executeListAvatars(
  input: ListAvatarsInput
): Promise<McpCallToolResult> {
  const limit = Math.min(Math.max(input.limit ?? 20, 1), 50);
  const filter: Record<string, unknown> = { isActive: true };
  if (input.category) filter.category = input.category;

  await connectDB();

  const templates = await AvatarTemplate.find(filter)
    .sort({ sortOrder: 1, createdAt: 1 })
    .limit(limit)
    .select("templateId name category cloudinaryUrl")
    .lean();

  if (templates.length === 0) {
    return {
      content: [
        {
          type: "text",
          text: input.category
            ? `No avatars found in category "${input.category}".`
            : "No avatar templates are currently available.",
        },
      ],
    };
  }

  // Build a readable summary + structured data
  const lines = templates.map(
    (t) => `• [${t.templateId}] ${t.name} (${t.category}) — ${t.cloudinaryUrl}`
  );

  const summary =
    `Found ${templates.length} avatar template${templates.length !== 1 ? "s" : ""}` +
    (input.category ? ` in category "${input.category}"` : "") +
    ":\n\n" +
    lines.join("\n");

  return {
    content: [
      { type: "text", text: summary },
    ],
  };
}
