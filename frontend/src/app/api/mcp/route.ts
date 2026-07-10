/**
 * /api/mcp/route.ts
 *
 * Eromify MCP Server — Streamable HTTP Transport
 * ─────────────────────────────────────────────────────────────────────────────
 * This is the single endpoint that Claude connects to.
 *
 * Supported JSON-RPC methods:
 *   initialize        → server capabilities handshake
 *   ping              → smoke test
 *   tools/list        → return all tool schemas
 *   tools/call        → authenticate → rate check → dispatch → return result
 *
 * Auth:   Bearer <mcp-api-key>  (resolved via SHA-256 hash lookup in MongoDB)
 * Format: JSON-RPC 2.0
 *
 * Claude connector setup URL:
 *   https://<your-vercel-domain>/api/mcp
 */

import { NextRequest, NextResponse } from "next/server";
import { resolveMcpUser }         from "@/lib/mcp-auth";
import { checkMcpRateLimit, rateLimitErrorMessage } from "@/lib/mcp-rate-limit";
import {
  ALL_TOOL_DEFINITIONS,
  executeListAvatars,
  executeGenerateImage,
  executeGenerateVideo,
  executeGetCreditBalance,
} from "@/lib/mcp-tools";
import type { McpUserContext } from "@/lib/mcp-tools";
import type { IUser } from "@/models/User";
import mongoose from "mongoose";

// ── MCP Protocol constants ────────────────────────────────────────────────────

const MCP_PROTOCOL_VERSION = "2024-11-05";
const SERVER_INFO = {
  name:    "eromify-mcp",
  version: "1.0.0",
};

// ── Helper: build JSON-RPC success response ───────────────────────────────────

function rpcOk(id: string | number | null, result: unknown) {
  return NextResponse.json(
    { jsonrpc: "2.0", id, result },
    {
      headers: {
        "Content-Type":                "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}

// ── Helper: build JSON-RPC error response ─────────────────────────────────────

function rpcError(
  id: string | number | null,
  code: number,
  message: string,
  httpStatus = 200 // JSON-RPC errors are typically returned as 200 with error in body
) {
  return NextResponse.json(
    { jsonrpc: "2.0", id, error: { code, message } },
    {
      status: httpStatus,
      headers: {
        "Content-Type":                "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}

// ── Helper: map IUser → McpUserContext ────────────────────────────────────────

function toUserContext(user: IUser & { _id: mongoose.Types.ObjectId }): McpUserContext {
  return {
    _id:         user._id.toString(),
    email:       user.email,
    credits:     typeof user.credits === "number" ? user.credits : 0,
    isPro:       user.isPro === true,
    videoAccess: user.videoAccess === true,
  };
}

// ── Methods that do NOT require auth (public handshake) ───────────────────────

const PUBLIC_METHODS = new Set(["initialize", "ping"]);

// ── OPTIONS — CORS preflight ──────────────────────────────────────────────────

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin":  "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

// ── GET — server metadata (shown in Claude connector setup UI) ────────────────

export async function GET() {
  return NextResponse.json(
    {
      name:        "Eromify AI Generator",
      description: "Generate AI images and videos, list avatar templates, and check your credit balance directly from Claude.",
      version:     "1.0.0",
      protocol:    MCP_PROTOCOL_VERSION,
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}

// ── POST — main JSON-RPC handler ──────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // ── Parse request body ────────────────────────────────────────────────────
  let body: { jsonrpc?: string; method?: string; params?: unknown; id?: string | number | null };
  try {
    body = await request.json();
  } catch {
    return rpcError(null, -32700, "Parse error: invalid JSON", 400);
  }

  const { method, params, id = null } = body;

  if (!method || typeof method !== "string") {
    return rpcError(id, -32600, "Invalid request: method is required");
  }

  // ── Handle public methods (no auth required) ──────────────────────────────

  if (method === "initialize") {
    return rpcOk(id, {
      protocolVersion: MCP_PROTOCOL_VERSION,
      serverInfo:      SERVER_INFO,
      capabilities: {
        tools: { listChanged: false },
      },
    });
  }

  if (method === "ping") {
    return rpcOk(id, { pong: true, ts: new Date().toISOString() });
  }

  // ── Authenticate all other methods ────────────────────────────────────────

  if (!PUBLIC_METHODS.has(method)) {
    const authResult = await resolveMcpUser(request);
    if (!authResult) {
      return rpcError(id, -32001, "Unauthorized: missing or invalid API key. Generate a key at eromify.in/mcp-keys.", 401);
    }

    const { user } = authResult;
    const userCtx = toUserContext(user);

    // ── tools/list ────────────────────────────────────────────────────────

    if (method === "tools/list") {
      return rpcOk(id, { tools: ALL_TOOL_DEFINITIONS });
    }

    // ── tools/call ────────────────────────────────────────────────────────

    if (method === "tools/call") {
      const callParams = params as { name?: string; arguments?: Record<string, unknown> };
      const toolName = callParams?.name;
      const toolArgs = callParams?.arguments ?? {};

      if (!toolName || typeof toolName !== "string") {
        return rpcError(id, -32602, "Invalid params: tools/call requires 'name'");
      }

      // Rate limit check
      const keyHash = (await import("crypto"))
        .createHash("sha256")
        .update(request.headers.get("authorization")?.slice(7).trim() ?? "")
        .digest("hex");

      const rateResult = await checkMcpRateLimit(keyHash, toolName);
      if (!rateResult.allowed) {
        return rpcOk(id, {
          content: [{ type: "text", text: rateLimitErrorMessage(rateResult) }],
          isError: true,
        });
      }

      // Dispatch to tool handler
      try {
        let result;

        switch (toolName) {
          case "list_avatars":
            result = await executeListAvatars(toolArgs as Parameters<typeof executeListAvatars>[0]);
            break;

          case "generate_image":
            result = await executeGenerateImage(
              toolArgs as unknown as Parameters<typeof executeGenerateImage>[0],
              userCtx
            );
            break;

          case "generate_video":
            result = await executeGenerateVideo(
              toolArgs as unknown as Parameters<typeof executeGenerateVideo>[0],
              userCtx
            );
            break;

          case "get_credit_balance":
            result = executeGetCreditBalance(userCtx);
            break;

          default:
            return rpcError(id, -32601, `Tool not found: "${toolName}"`);
        }

        return rpcOk(id, result);
      } catch (err) {
        console.error(`[mcp] Unhandled error in tool "${toolName}":`, err);
        return rpcOk(id, {
          isError: true,
          content: [{ type: "text", text: "An unexpected error occurred. Your credits were not deducted." }],
        });
      }
    }

    // ── Unknown method ────────────────────────────────────────────────────

    return rpcError(id, -32601, `Method not found: "${method}"`);
  }

  return rpcError(id, -32601, `Method not found: "${method}"`);
}
