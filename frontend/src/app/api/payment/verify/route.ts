import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { Payment } from "@/models/Payment";
import { User } from "@/models/User";

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userEmail,
      userId,
    } = body;

    // Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Update payment record and fetch it to know how many credits to add
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "paid",
      },
      { new: true } // Return updated document
    );

    // Add credits to user AND grant Pro status.
    // Note: NextAuth MongoDBAdapter creates users without `credits` field (bypasses Mongoose defaults).
    // MongoDB's $inc safely initialises a missing field to 0 before incrementing.
    if (userEmail && payment?.creditsToAdd) {
      // Only pro and mega packs include Video Generation Access
      const hasVideoAccess = ["pro", "mega", "premium"].includes(payment.plan || "");
      // MCP Access is exclusive to Professional (mega) and Enterprise (premium) packs
      const hasMcpAccess   = ["mega", "premium"].includes(payment.plan || "");

      const result = await User.updateOne(
        { email: userEmail },
        {
          $inc: { credits: payment.creditsToAdd },
          $set: {
            isPro: true,                                          // ← Pro badge for all paying users
            ...(hasVideoAccess && { videoAccess: true }),         // ← Video only for pro/mega/premium
            ...(hasMcpAccess   && { mcpAccess:   true  }),        // ← MCP only for mega/premium
          },
        }
      );
      console.log(
        `[verify] update → matchedCount:${result.matchedCount} creditsAdded:${payment.creditsToAdd} isPro:true videoAccess:${hasVideoAccess} plan:${payment.plan} user:${userEmail}`
      );
    } else if (userEmail) {
      // Edge case: payment exists but creditsToAdd is 0 — still grant Pro
      await User.updateOne({ email: userEmail }, { $set: { isPro: true } });
      console.log(`[verify] pro-only update for user:${userEmail}`);
    }

    return NextResponse.json({ success: true, creditsAdded: payment?.creditsToAdd || 0, isPro: true });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
