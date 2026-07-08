import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import crypto from "crypto";

// Issues a short-lived signed ticket for the Express video backend.
// The Express backend verifies this ticket using the shared VIDEO_BACKEND_SECRET.
// Ticket is valid for 10 minutes — enough for video generation + a retry.

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentCredits = typeof user.credits === "number" ? user.credits : 0;

    // Gate checks — fail fast before the long Express round trip
    if (!user.videoAccess) {
      return NextResponse.json(
        { error: "Video generation requires Pro Pack or Mega Pack.", code: "NO_VIDEO_ACCESS" },
        { status: 403 }
      );
    }

    if (currentCredits < 1500) {
      return NextResponse.json(
        { error: "Insufficient credits for video generation.", code: "INSUFFICIENT_CREDITS" },
        { status: 402 }
      );
    }

    const secret = process.env.VIDEO_BACKEND_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "VIDEO_BACKEND_SECRET not configured" }, { status: 500 });
    }

    // Build signed ticket: base64(payload).hmac
    const payload = Buffer.from(
      JSON.stringify({
        email: session.user.email,
        credits: currentCredits,
        exp: Date.now() + 10 * 60 * 1000, // 10 min TTL
      })
    ).toString("base64");

    const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    const ticket = `${payload}.${sig}`;

    return NextResponse.json({ ticket });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
