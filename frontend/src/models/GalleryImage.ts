import mongoose, { Schema, model } from "mongoose";

export interface IGalleryImage {
  _id?: mongoose.Types.ObjectId;
  userEmail: string;
  userName?: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  prompt: string;
  mode: string;
  model?: string;
  generationMs?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const GalleryImageSchema = new Schema<IGalleryImage>(
  {
    userEmail: { type: String, required: true, index: true },
    userName: { type: String },
    cloudinaryUrl: { type: String, required: true },
    cloudinaryPublicId: { type: String, required: true },
    prompt: { type: String, required: true },
    mode: { type: String, required: true, default: "text2img" },
    model: { type: String },
    generationMs: { type: Number },
  },
  { timestamps: true }
);

if (mongoose.models.GalleryImage) {
  delete mongoose.models.GalleryImage;
}

export const GalleryImage = model<IGalleryImage>("GalleryImage", GalleryImageSchema);
