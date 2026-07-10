/**
 * OAuthCode.ts
 *
 * Temporary authorization codes issued by the OAuth /authorize endpoint.
 * Each code is single-use and expires in 5 minutes (TTL index).
 *
 * After the code is exchanged for a token at /api/oauth/token,
 * it is immediately deleted to prevent replay attacks.
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IOAuthCode extends Document {
  code:             string;
  clientId:         string;
  userId:           mongoose.Types.ObjectId;
  redirectUri:      string;
  codeChallenge:    string;
  codeChallengeMethod: "S256";
  scopes:           string[];
  expiresAt:        Date;
  used:             boolean;
}

const OAuthCodeSchema = new Schema<IOAuthCode>({
  code:             { type: String, required: true, unique: true, index: true },
  clientId:         { type: String, required: true },
  userId:           { type: Schema.Types.ObjectId, ref: "User", required: true },
  redirectUri:      { type: String, required: true },
  codeChallenge:    { type: String, required: true },
  codeChallengeMethod: { type: String, enum: ["S256"], default: "S256" },
  scopes:           { type: [String], default: ["mcp"] },
  expiresAt:        { type: Date,   required: true, index: { expires: 0 } },
  used:             { type: Boolean, default: false },
}, { collection: "oauth_codes" });

export const OAuthCode =
  mongoose.models.OAuthCode ??
  mongoose.model<IOAuthCode>("OAuthCode", OAuthCodeSchema);
