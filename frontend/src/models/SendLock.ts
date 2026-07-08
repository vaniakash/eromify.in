import mongoose, { Schema, model, models } from "mongoose";

export interface ISendLock {
  _id?: mongoose.Types.ObjectId;
  otpHash: string;           // bcrypt/crypto hashed OTP
  fileName: string;          // original file name
  fileKey: string;           // unique server-side storage key (uuid)
  fileMime: string;          // MIME type
  fileSize: number;          // bytes
  resourceType?: string;     // Cloudinary resource_type (raw, image, auto)
  expiresAt: Date;           // OTP expiry
  used: boolean;             // one-time use
  attempts: number;          // brute-force protection
  maxAttempts: number;       // default 5
  createdAt?: Date;
  updatedAt?: Date;
}

const SendLockSchema = new Schema<ISendLock>(
  {
    otpHash: { type: String, required: true },
    fileName: { type: String, required: true },
    fileKey: { type: String, required: true, unique: true },
    fileMime: { type: String, required: true },
    fileSize: { type: Number, required: true },
    resourceType: { type: String, default: "raw" },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
  },
  { timestamps: true }
);

// Auto-expire documents from MongoDB after TTL (extra safety net)
SendLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SendLock =
  models.SendLock || model<ISendLock>("SendLock", SendLockSchema);
