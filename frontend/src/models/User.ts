import mongoose, { Schema, model } from "mongoose";

// ── MCP API Key subdocument ───────────────────────────────────────────────────
export interface IMcpApiKey {
  _id?: mongoose.Types.ObjectId;
  /** SHA-256 hash of the raw key — raw key is NEVER stored */
  keyHash: string;
  /** Optional human label, e.g. "Claude Desktop" */
  label?: string;
  createdAt: Date;
  /** Updated on every successful MCP request */
  lastUsedAt?: Date;
  /** Set when the key is revoked — revoked keys are rejected immediately */
  revokedAt?: Date;
}

export interface IUser {
  _id?: mongoose.Types.ObjectId;
  name?: string;
  email: string;
  emailVerified?: Date | null;
  image?: string;
  password?: string | null;
  isPro?: boolean;
  proExpiresAt?: Date | null;
  credits?: number;
  videoAccess?: boolean;  // true only for Pro Pack (₹199) & Mega Pack (₹499)
  mcpApiKeys?: IMcpApiKey[];
  createdAt?: Date;
  updatedAt?: Date;
}

const McpApiKeySchema = new Schema<IMcpApiKey>(
  {
    keyHash:    { type: String, required: true, index: true },
    label:      { type: String },
    lastUsedAt: { type: Date },
    revokedAt:  { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const UserSchema = new Schema<IUser>(
  {
    name:          { type: String },
    email:         { type: String, required: true, unique: true },
    emailVerified: { type: Date, default: null },
    image:         { type: String },
    password:      { type: String, default: null },
    isPro:         { type: Boolean, default: false },
    proExpiresAt:  { type: Date, default: null },
    credits:       { type: Number, default: 0 },
    videoAccess:   { type: Boolean, default: false },
    mcpApiKeys:    { type: [McpApiKeySchema], default: [] },
  },
  { timestamps: true }
);

// Use the standard Mongoose model caching pattern — safe in both dev and production
export const User = (mongoose.models.User as mongoose.Model<IUser>) || model<IUser>("User", UserSchema);

