/**
 * mcp-rate-limit.ts
 *
 * MongoDB-backed sliding window rate limiter for MCP API requests.
 * Uses a TTL collection (McpRateLimit) — expired documents are cleaned
 * up automatically by MongoDB's TTL index (expireAfterSeconds: 0).
 *
 * Limits enforced (per SOP):
 *   - requests: 600 / minute  (all tools combined)
 *   - generate_image: 500 / day
 *   - generate_video:  50 / day
 *   - get_credit_balance: unlimited (free, no counter needed)
 *   - list_avatars:       unlimited (free, no counter needed)
 *
 * Each counter lives as one document: { keyHash, bucket, count, expiresAt }
 * We use findOneAndUpdate with $inc so the increment is atomic.
 */

import { connectDB } from "@/lib/db";
import { McpRateLimit } from "@/models/McpRateLimit";

// ── Limit definitions ─────────────────────────────────────────────────────────

interface LimitDef {
  bucket: string;
  max: number;
  windowMs: number; // milliseconds
}

const LIMITS: Record<string, LimitDef[]> = {
  // Every tool call counts against the per-minute global limit
  "*": [
    { bucket: "min:all", max: 600, windowMs: 60_000 },
  ],
  generate_image: [
    { bucket: "day:generate_image", max: 500, windowMs: 86_400_000 },
  ],
  generate_video: [
    { bucket: "day:generate_video", max: 50,  windowMs: 86_400_000 },
  ],
};

// ── Result type ───────────────────────────────────────────────────────────────

export interface RateLimitResult {
  allowed: boolean;
  /** Name of the first bucket that was exceeded */
  limitedBy?: string;
  /** How many requests remain in the limiting bucket */
  remaining?: number;
  /** When the limiting window resets */
  resetAt?: Date;
}

// ── Core check function ───────────────────────────────────────────────────────

/**
 * Checks and increments rate-limit counters for a given keyHash + toolName.
 *
 * Strategy (atomic per bucket):
 *   1. Compute expiresAt = now + windowMs
 *   2. Upsert the counter document with $inc: { count: 1 }
 *      - If doc doesn't exist yet, create it with count: 1 and the new expiresAt
 *      - If doc exists, only increment count (don't reset expiresAt — that would
 *        extend the window and break sliding semantics)
 *   3. If the returned count exceeds max → deny
 *
 * Note: We upsert with $setOnInsert for expiresAt so an existing document's
 * expiry is never accidentally extended by a new request.
 */
async function checkBucket(
  keyHash: string,
  def: LimitDef
): Promise<{ allowed: boolean; count: number; expiresAt: Date }> {
  await connectDB();

  const now = new Date();
  const expiresAt = new Date(now.getTime() + def.windowMs);

  // Atomic upsert — increment counter, set expiresAt only on insert
  const doc = await McpRateLimit.findOneAndUpdate(
    { keyHash, bucket: def.bucket },
    {
      $inc: { count: 1 },
      $setOnInsert: { expiresAt },
    },
    {
      upsert: true,
      new: true,    // return the updated document
      setDefaultsOnInsert: true,
    }
  );

  return {
    allowed: doc.count <= def.max,
    count: doc.count,
    expiresAt: doc.expiresAt,
  };
}

/**
 * Main entry point.
 * Checks all applicable rate limit buckets for a tool call.
 * Returns the first bucket that is exceeded, or allowed: true if all pass.
 */
export async function checkMcpRateLimit(
  keyHash: string,
  toolName: string
): Promise<RateLimitResult> {
  // Collect applicable limit definitions
  const defs: LimitDef[] = [
    ...(LIMITS["*"] ?? []),           // global per-minute
    ...(LIMITS[toolName] ?? []),       // tool-specific daily
  ];

  for (const def of defs) {
    const result = await checkBucket(keyHash, def);
    if (!result.allowed) {
      return {
        allowed: false,
        limitedBy: def.bucket,
        remaining: 0,
        resetAt: result.expiresAt,
      };
    }
  }

  return { allowed: true };
}

/**
 * Formats a denied rate-limit result into a human-readable MCP error message.
 */
export function rateLimitErrorMessage(result: RateLimitResult): string {
  const resetStr = result.resetAt
    ? `Resets at ${result.resetAt.toISOString()}.`
    : "";

  if (result.limitedBy?.startsWith("min:")) {
    return `Rate limit exceeded: too many requests (max 600/min). ${resetStr}`;
  }
  if (result.limitedBy === "day:generate_image") {
    return `Rate limit exceeded: image generation limit reached (max 500/day). ${resetStr}`;
  }
  if (result.limitedBy === "day:generate_video") {
    return `Rate limit exceeded: video generation limit reached (max 50/day). ${resetStr}`;
  }
  return `Rate limit exceeded. ${resetStr}`;
}
