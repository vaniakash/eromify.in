/**
 * mcp-auth.ts
 *
 * Resolves an inbound MCP request to a full Eromify User document.
 *
 * Accepts TWO types of Bearer tokens:
 *   1. API keys  — start with "emcp_"  → looked up via SHA-256 hash in User.mcpApiKeys
 *   2. OAuth tokens — start with "eoat_" → looked up via SHA-256 hash in OAuthToken collection
 *
 * Security guarantees:
 *   - Raw tokens are NEVER stored — only SHA-256 hashes are kept in MongoDB
 *   - Revoked tokens (revokedAt != null) are rejected immediately
 *   - Expired OAuth tokens (expiresAt < now) are rejected
 */

import { createHash } from "crypto";
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { OAuthToken } from "@/models/OAuthToken";
import type { IUser } from "@/models/User";
import mongoose from "mongoose";

/** Hashes a raw MCP API key or OAuth token with SHA-256. */
export function hashMcpKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

/** Extracts the raw Bearer token from the Authorization header. */
function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const raw = authHeader.slice(7).trim();
  return raw.length > 0 ? raw : null;
}

export interface McpAuthResult {
  user: IUser & { _id: mongoose.Types.ObjectId };
  keyId: string;
}

/**
 * Resolves an MCP request to an Eromify user.
 * Returns null if the token is missing, invalid, revoked, or expired.
 */
export async function resolveMcpUser(
  request: NextRequest
): Promise<McpAuthResult | null> {
  const rawToken = extractBearerToken(request);
  if (!rawToken) return null;

  const tokenHash = hashMcpKey(rawToken);

  await connectDB();

  // ── Path 1: OAuth access token (prefix: eoat_) ────────────────────────────
  if (rawToken.startsWith("eoat_")) {
    const oauthToken = await OAuthToken.findOne({
      tokenHash,
      revokedAt: { $exists: false },
    }).lean();

    if (!oauthToken) return null;
    if (oauthToken.expiresAt < new Date()) return null;

    const user = await User.findById(oauthToken.userId)
      .lean<IUser & { _id: mongoose.Types.ObjectId }>();
    if (!user) return null;

    // Fire-and-forget: update lastUsedAt
    OAuthToken.updateOne(
      { _id: oauthToken._id },
      { $set: { lastUsedAt: new Date() } }
    ).catch(() => console.warn("[mcp-auth] Failed to update OAuth token lastUsedAt"));

    return { user, keyId: oauthToken._id.toString() };
  }

  // ── Path 2: API key (prefix: emcp_) ──────────────────────────────────────
  const user = await User.findOne({
    mcpApiKeys: {
      $elemMatch: {
        keyHash: tokenHash,
        revokedAt: { $exists: false },
      },
    },
  }).lean<IUser & { _id: mongoose.Types.ObjectId }>();


  if (!user) return null;

  const keyEntry = user.mcpApiKeys?.find(
    (k) => k.keyHash === tokenHash && !k.revokedAt
  );

  if (!keyEntry) return null;

  // Fire-and-forget: update lastUsedAt
  User.updateOne(
    { _id: user._id, "mcpApiKeys._id": keyEntry._id },
    { $set: { "mcpApiKeys.$.lastUsedAt": new Date() } }
  ).catch(() => console.warn("[mcp-auth] Failed to update API key lastUsedAt"));

  return {
    user,
    keyId: keyEntry._id?.toString() ?? "",
  };
}
