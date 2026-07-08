import mongoose, { Schema, model, models } from "mongoose";

export interface IRuleTrigger {
  type: "keyword" | "all";
  keyword?: string; // required when type === "keyword"
}

export interface IRuleAction {
  replyComment: boolean;
  commentText?: string;
  sendDM: boolean;
  dmText: string;
}

export interface IInstagramRule {
  _id?: mongoose.Types.ObjectId;
  accountId: mongoose.Types.ObjectId;
  userId: string;
  trigger: IRuleTrigger;
  action: IRuleAction;
  isActive: boolean;
  triggerCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const InstagramRuleSchema = new Schema<IInstagramRule>(
  {
    accountId: { type: Schema.Types.ObjectId, ref: "InstagramAccount", required: true },
    userId: { type: String, required: true },
    trigger: {
      type: {
        type: String,
        enum: ["keyword", "all"],
        required: true,
      },
      keyword: { type: String },
    },
    action: {
      replyComment: { type: Boolean, default: false },
      commentText: { type: String },
      sendDM: { type: Boolean, default: true },
      dmText: { type: String, required: true },
    },
    isActive: { type: Boolean, default: true },
    triggerCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const InstagramRule =
  models.InstagramRule ||
  model<IInstagramRule>("InstagramRule", InstagramRuleSchema);
