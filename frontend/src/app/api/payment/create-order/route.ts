import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Payment } from "@/models/Payment";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    // ── Auth guard: only logged-in users can create orders ───────────────────
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    // userEmail/userId MUST come from the server session, not the client body
    const userEmail = session.user.email;
    const userId = session.user.id ?? null;
    const { packId = "value" } = body;

    // Define pricing tiers
    const tiers: Record<string, { pricePaise: number; credits: number }> = {
      value:   { pricePaise: 14900,  credits: 1200 },
      pro:     { pricePaise: 39900, credits: 3000 },
      mega:    { pricePaise: 49900, credits: 10000 },
      premium: { pricePaise: 199900, credits: 40000 },
    };

    const selectedTier = tiers[packId as string] || tiers.value;
    const { pricePaise, credits } = selectedTier;

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: pricePaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        plan: packId,
        credits: String(credits),
        userEmail: userEmail || "",
        userId: userId || "",
      },
    });

    // Save to MongoDB
    await Payment.create({
      userId: userId || null,
      userEmail: userEmail || null,
      razorpayOrderId: order.id,
      amount: pricePaise,
      currency: "INR",
      status: "created",
      plan: packId,
      creditsToAdd: credits,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}
