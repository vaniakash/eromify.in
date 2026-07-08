import mongoose, { Schema, model } from "mongoose";

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
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Date, default: null },
    image: { type: String },
    password: { type: String, default: null },
    isPro: { type: Boolean, default: false },
    proExpiresAt: { type: Date, default: null },
    credits: { type: Number, default: 0 },
    videoAccess: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Use the standard Mongoose model caching pattern — safe in both dev and production
export const User = (mongoose.models.User as mongoose.Model<IUser>) || model<IUser>("User", UserSchema);

