import mongoose, { Schema, model, models } from "mongoose";

export interface IInstagramLog {
  _id?: mongoose.Types.ObjectId;
  accountId: mongoose.Types.ObjectId;
  userId: string;
  type: "comment_reply" | "dm_sent";
  triggerKeyword?: string;
  commentId?: string;
  targetUserId?: string; // IGSID of the Instagram user who commented/messaged
  status: "success" | "failed";
  error?: string;
  createdAt?: Date;
}

const InstagramLogSchema = new Schema<IInstagramLog>(
  {
    accountId: { type: Schema.Types.ObjectId, ref: "InstagramAccount", required: true },
    userId: { type: String, required: true },
    type: { type: String, enum: ["comment_reply", "dm_sent"], required: true },
    triggerKeyword: { type: String },
    commentId: { type: String },
    targetUserId: { type: String },
    status: { type: String, enum: ["success", "failed"], required: true },
    error: { type: String },
  },
  { timestamps: true }
);

// Auto-expire logs after 30 days
InstagramLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

export const InstagramLog =
  models.InstagramLog ||
  model<IInstagramLog>("InstagramLog", InstagramLogSchema);
