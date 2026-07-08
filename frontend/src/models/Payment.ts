import mongoose, { Schema, model, models } from "mongoose";

export interface IPayment {
  _id?: mongoose.Types.ObjectId;
  userId?: string;
  userEmail?: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number; // in paise
  currency: string;
  status: "created" | "paid" | "failed";
  plan: string;
  creditsToAdd?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: { type: String },
    userEmail: { type: String },
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
    plan: { type: String, default: "pro" },
    creditsToAdd: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Payment =
  models.Payment || model<IPayment>("Payment", PaymentSchema);
