/**
 * McpRateLimit.ts
 *
 * MongoDB TTL collection for MCP per-key rate-limit counters.
 * Each document represents one (key, window, bucket) counter.
 * The `expiresAt` TTL index automatically purges stale documents
 * so no manual cleanup is ever required.
 *
 * Supported windows:
 *   - "min"  → 1-minute sliding window (requests/min)
 *   - "day"  → 1-day  sliding window (generates/day)
 */

import mongoose, { Schema, model } from "mongoose";

export interface IMcpRateLimit {
  /** SHA-256 hash of the MCP API key (never the raw key) */
  keyHash: string;
  /**
   * Identifies the bucket being tracked.
   * Format: "<window>:<tool>"
   * Examples: "min:all", "day:generate_image", "day:generate_video"
   */
  bucket: string;
  /** Running counter for this window */
  count: number;
  /** When this document should be auto-deleted by MongoDB's TTL index */
  expiresAt: Date;
}

const McpRateLimitSchema = new Schema<IMcpRateLimit>(
  {
    keyHash:   { type: String, required: true },
    bucket:    { type: String, required: true },
    count:     { type: Number, required: true, default: 0 },
    expiresAt: { type: Date,   required: true },
  },
  {
    // No Mongoose timestamps — we manage expiry ourselves via `expiresAt`
    timestamps: false,
  }
);

// ── Compound index for fast counter lookups ───────────────────────────────────
McpRateLimitSchema.index({ keyHash: 1, bucket: 1 }, { unique: true });

// ── TTL index — MongoDB deletes documents automatically when expiresAt passes ─
McpRateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const McpRateLimit =
  (mongoose.models.McpRateLimit as mongoose.Model<IMcpRateLimit>) ||
  model<IMcpRateLimit>("McpRateLimit", McpRateLimitSchema);
