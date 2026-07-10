/**
 * OAuthToken.ts
 *
 * Long-lived OAuth access tokens issued after a successful authorization code exchange.
 * These are used by Claude as Bearer tokens for all MCP calls.
 * Expires after 90 days (TTL index).
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IOAuthToken extends Document {
  tokenHash:  string;                       // SHA-256 of the raw access token
  clientId:   string;                       // The OAuth client that issued this
  userId:     mongoose.Types.ObjectId;      // The Eromify user this token belongs to
  scopes:     string[];
  expiresAt:  Date;                         // TTL — auto-deleted by MongoDB
  revokedAt?: Date;
  lastUsedAt?: Date;
}

const OAuthTokenSchema = new Schema<IOAuthToken>({
  tokenHash:  { type: String, required: true, unique: true, index: true },
  clientId:   { type: String, required: true },
  userId:     { type: Schema.Types.ObjectId, ref: "User", required: true },
  scopes:     { type: [String], default: ["mcp"] },
  expiresAt:  { type: Date,   required: true, index: { expires: 0 } },  // TTL
  revokedAt:  { type: Date },
  lastUsedAt: { type: Date },
}, { collection: "oauth_tokens", timestamps: true });

export const OAuthToken =
  mongoose.models.OAuthToken ??
  mongoose.model<IOAuthToken>("OAuthToken", OAuthTokenSchema);
