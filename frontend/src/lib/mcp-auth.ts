/**
 * mcp-auth.ts
 *
 * Resolves an inbound MCP request to a full Eromify User document
 * by validating the Bearer token in the Authorization header.
 *
 * Flow:
 *   1. Extract raw key from "Authorization: Bearer <key>" header
 *   2. SHA-256 hash the raw key
 *   3. Find the matching, non-revoked subdocument in User.mcpApiKeys
 *   4. Update lastUsedAt (fire-and-forget, non-blocking)
 *   5. Return the full User document (for downstream credit/plan checks)
 *
 * Security guarantees:
 *   - Raw keys are NEVER stored — only hashes are kept in MongoDB
 *   - Revoked keys (revokedAt != null) are rejected immediately (< 1 ms)
 *   - No sensitive data is ever returned to the caller in error paths
 */

import { createHash } from "crypto";
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import type { IUser } from "@/models/User";
import mongoose from "mongoose";

/** Hashes a raw MCP API key with SHA-256. */
export function hashMcpKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

/**
 * Extracts the raw Bearer token from the Authorization header.
 * Returns null if the header is absent or malformed.
 */
function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const raw = authHeader.slice(7).trim();
  return raw.length > 0 ? raw : null;
}

export interface McpAuthResult {
  user: IUser & { _id: mongoose.Types.ObjectId };
  keyId: string; // The subdocument _id (used for lastUsedAt update)
}

/**
 * Resolves an MCP request to an Eromify user.
 * Returns null if the key is missing, invalid, or revoked.
 */
export async function resolveMcpUser(
  request: NextRequest
): Promise<McpAuthResult | null> {
  const rawKey = extractBearerToken(request);
  if (!rawKey) return null;

  const keyHash = hashMcpKey(rawKey);

  await connectDB();

  // Find user who has this key hash and is NOT revoked
  const user = await User.findOne({
    "mcpApiKeys": {
      $elemMatch: {
        keyHash,
        revokedAt: { $exists: false }, // not revoked
      },
    },
  }).lean<IUser & { _id: mongoose.Types.ObjectId }>();

  if (!user) return null;

  // Find the specific key subdocument _id so we can update lastUsedAt
  const keyEntry = user.mcpApiKeys?.find(
    (k) => k.keyHash === keyHash && !k.revokedAt
  );
  if (!keyEntry) return null;

  // Fire-and-forget: update lastUsedAt (non-blocking — don't await)
  User.updateOne(
    { _id: user._id, "mcpApiKeys._id": keyEntry._id },
    { $set: { "mcpApiKeys.$.lastUsedAt": new Date() } }
  ).catch(() => {
    // Non-fatal — don't crash the request if this update fails
    console.warn("[mcp-auth] Failed to update lastUsedAt");
  });

  return {
    user,
    keyId: keyEntry._id?.toString() ?? "",
  };
}
