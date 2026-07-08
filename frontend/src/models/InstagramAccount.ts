import mongoose, { Schema, model, models } from "mongoose";

export interface IInstagramAccount {
  _id?: mongoose.Types.ObjectId;
  userId: string; // References NextAuth user ID (token.sub)
  facebookUserId: string;
  pageId: string;
  pageName: string;
  instagramId: string;
  instagramUsername: string;
  instagramProfilePic?: string;
  accessToken: string; // Permanent Page Access Token
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const InstagramAccountSchema = new Schema<IInstagramAccount>(
  {
    userId: { type: String, required: true },
    facebookUserId: { type: String, required: true },
    pageId: { type: String, required: true },
    pageName: { type: String, required: true },
    instagramId: { type: String, required: true, unique: true },
    instagramUsername: { type: String, required: true },
    instagramProfilePic: { type: String },
    accessToken: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const InstagramAccount =
  models.InstagramAccount ||
  model<IInstagramAccount>("InstagramAccount", InstagramAccountSchema);
