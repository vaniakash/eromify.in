/**
 * /api/mcp/route.ts
 *
 * Eromify MCP Server — Streamable HTTP Transport
 * ─────────────────────────────────────────────────────────────────────────────
 * Supported JSON-RPC methods:
 *   initialize        → public handshake
 *   ping              → public health check
 *   tools/list        → PUBLIC — returns all tool schemas (no auth needed)
 *   tools/call        → auth required → rate check → Pro gate → dispatch
 *
 * Auth: Bearer <mcp-api-key>  (SHA-256 hash lookup in MongoDB)
 *       Returns HTTP 401 + WWW-Authenticate: Bearer so Claude prompts for key.
 */

import { NextRequest, NextResponse } from "next/server";
import { resolveMcpUser }            from "@/lib/mcp-auth";
import { checkMcpRateLimit, rateLimitErrorMessage } from "@/lib/mcp-rate-limit";
import {
  ALL_TOOL_DEFINITIONS,
  executeListAvatars,
  executeGenerateImage,
  executeGenerateVideo,
  executeGetCreditBalance,
} from "@/lib/mcp-tools";
import type { McpUserContext } from "@/lib/mcp-tools";
import type { IUser }          from "@/models/User";
import mongoose                from "mongoose";

// ── Constants ─────────────────────────────────────────────────────────────────

const MCP_PROTOCOL_VERSION = "2024-11-05";
const SERVER_INFO          = { name: "eromify-mcp", version: "1.0.0" };

// ── Helpers ───────────────────────────────────────────────────────────────────

function rpcOk(id: string | number | null, result: unknown) {
  return NextResponse.json(
    { jsonrpc: "2.0", id, result },
    { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
  );
}

function rpcError(id: string | number | null, code: number, message: string, httpStatus = 200) {
  return NextResponse.json(
    { jsonrpc: "2.0", id, error: { code, message } },
    { status: httpStatus, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
  );
}

/**
 * HTTP 401 with WWW-Authenticate: Bearer
 * This is what Claude needs to know it should prompt the user for an API key.
 * A plain JSON-RPC error body is NOT enough — Claude ignores it silently.
 */
function unauthorizedResponse(id: string | number | null) {
  return NextResponse.json(
    { jsonrpc: "2.0", id, error: { code: -32001, message: "Unauthorized: missing or invalid API key. Generate a key at eromify.in/mcp-keys." } },
    {
      status: 401,
      headers: {
        "Content-Type":                "application/json",
        "Access-Control-Allow-Origin": "*",
        "WWW-Authenticate":            'Bearer realm="Eromify MCP", error="invalid_token"',
      },
    }
  );
}

function toUserContext(user: IUser & { _id: mongoose.Types.ObjectId }): McpUserContext {
  return {
    _id:         user._id.toString(),
    email:       user.email,
    credits:     typeof user.credits === "number" ? user.credits : 0,
    isPro:       user.isPro       === true,
    videoAccess: user.videoAccess === true,
    mcpAccess:   user.mcpAccess   === true,
  };
}

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

// ── GET — server metadata + discovery logging ─────────────────────────────────

export async function GET(request: NextRequest) {
  console.log(`[MCP-GET] ${new Date().toISOString()} — discovery probe`);
  console.log(`[MCP-GET] Authorization: ${request.headers.get("authorization") ?? "MISSING ❌"}`);
  console.log(`[MCP-GET] User-Agent:    ${request.headers.get("user-agent")    ?? "MISSING"}`);

  return NextResponse.json(
    {
      name:        "Eromify AI Generator",
      description: "Generate AI images and videos, list avatar templates, and check your credit balance directly from Claude.",
      version:     "1.0.0",
      protocol:    MCP_PROTOCOL_VERSION,
    },
    { headers: { "Access-Control-Allow-Origin": "*" } }
  );
}

// ── POST — main JSON-RPC handler ──────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // ── Parse body ────────────────────────────────────────────────────────────

  let rawBody = "";
  let body: { jsonrpc?: string; method?: string; params?: unknown; id?: string | number | null };
  try {
    rawBody = await request.text();
    body    = JSON.parse(rawBody);
  } catch {
    console.error("[MCP] ❌ JSON parse error. Raw body:", rawBody);
    return rpcError(null, -32700, "Parse error: invalid JSON", 400);
  }

  const authHeader = request.headers.get("authorization");

  // ── Request logging (visible in Vercel Functions logs) ───────────────────
  console.log("──────────────────────────────────────────────────────────────");
  console.log(`[MCP] ${new Date().toISOString()} method=${body?.method ?? "unknown"}`);
  console.log(`[MCP] Authorization: ${authHeader ? `"${authHeader.slice(0, 20)}..."` : "MISSING ❌"}`);
  console.log(`[MCP] User-Agent:    ${request.headers.get("user-agent")    ?? "MISSING"}`);
  console.log(`[MCP] Origin:        ${request.headers.get("origin")        ?? "MISSING"}`);
  console.log(`[MCP] Content-Type:  ${request.headers.get("content-type")  ?? "MISSING"}`);
  console.log(`[MCP] Body:          ${rawBody.slice(0, 300)}`);
  console.log("──────────────────────────────────────────────────────────────");

  const { method, params, id = null } = body;

  if (!method || typeof method !== "string") {
    return rpcError(id, -32600, "Invalid request: method is required");
  }

  // ── Public methods (no auth) ──────────────────────────────────────────────

  if (method === "initialize") {
    return rpcOk(id, {
      protocolVersion: MCP_PROTOCOL_VERSION,
      serverInfo:      SERVER_INFO,
      capabilities:    { tools: { listChanged: false } },
    });
  }

  if (method === "ping") {
    return rpcOk(id, { pong: true, ts: new Date().toISOString() });
  }

  // tools/list is PUBLIC — Claude calls this during connector discovery BEFORE
  // any user credentials are added. Requiring auth here causes "no tools available".
  if (method === "tools/list") {
    return rpcOk(id, { tools: ALL_TOOL_DEFINITIONS });
  }

  // ── All other methods require auth ────────────────────────────────────────

  const authResult = await resolveMcpUser(request);
  if (!authResult) {
    return unauthorizedResponse(id);
  }

  const { user } = authResult;
  const userCtx  = toUserContext(user);

  // ── tools/call ────────────────────────────────────────────────────────────

  if (method === "tools/call") {
    const callParams = params as { name?: string; arguments?: Record<string, unknown> };
    const toolName   = callParams?.name;
    const toolArgs   = callParams?.arguments ?? {};

    if (!toolName || typeof toolName !== "string") {
      return rpcError(id, -32602, "Invalid params: tools/call requires 'name'");
    }

    // Rate limit check
    const keyHash = (await import("crypto"))
      .createHash("sha256")
      .update(authHeader?.slice(7).trim() ?? "")
      .digest("hex");

    const rateResult = await checkMcpRateLimit(keyHash, toolName);
    if (!rateResult.allowed) {
      return rpcOk(id, {
        content: [{ type: "text", text: rateLimitErrorMessage(rateResult) }],
        isError: true,
      });
    }

    // Professional Pack gate — checked on every tools/call
    // Handles refunds, plan downgrades, or legacy keys issued before this gate existed.
    if (!userCtx.mcpAccess) {
      return rpcOk(id, {
        content: [{
          type: "text",
          text: "⛔ Claude MCP access requires the Professional Pack (₹499) or Enterprise Pack (₹1999). Upgrade at https://eromify.in/pricing",
        }],
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
          result = await executeGenerateImage(toolArgs as unknown as Parameters<typeof executeGenerateImage>[0], userCtx);
          break;
        case "generate_video":
          result = await executeGenerateVideo(toolArgs as unknown as Parameters<typeof executeGenerateVideo>[0], userCtx);
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

  // ── Unknown method ────────────────────────────────────────────────────────

  return rpcError(id, -32601, `Method not found: "${method}"`);
}
