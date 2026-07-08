import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ isPro: false });

    await connectDB();
    const user = await User.findOne({ email: session.user.email }).lean();
    return NextResponse.json({
      isPro: !!user?.isPro,
      credits: typeof user?.credits === "number" ? user.credits : 0,
    });
  } catch (error) {
    console.error("Pro sync error:", error);
    return NextResponse.json({ isPro: false });
  }
}
