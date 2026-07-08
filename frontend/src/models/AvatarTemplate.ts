import mongoose, { Schema, model } from "mongoose";

export interface IAvatarTemplate {
  _id?: mongoose.Types.ObjectId;
  templateId: string;           // stable short ID like "1", "2", etc.
  name: string;                 // display name, e.g. "Emma Johnson"
  category: string;             // "Female" | "Male" | "Anime" | "Realistic" | "3D Render"
  cloudinaryUrl: string;        // full Cloudinary URL
  cloudinaryPublicId: string;   // Cloudinary public_id for management
  isActive: boolean;            // soft-delete / hide from gallery
  sortOrder: number;            // display order
  createdAt?: Date;
  updatedAt?: Date;
}

const AvatarTemplateSchema = new Schema<IAvatarTemplate>(
  {
    templateId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true, default: "Female" },
    cloudinaryUrl: { type: String, required: true },
    cloudinaryPublicId: { type: String, required: true },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Prevent model recompile on hot reload
if (mongoose.models.AvatarTemplate) {
  delete mongoose.models.AvatarTemplate;
}

export const AvatarTemplate = model<IAvatarTemplate>(
  "AvatarTemplate",
  AvatarTemplateSchema
);
