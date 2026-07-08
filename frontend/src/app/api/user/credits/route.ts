import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email }).lean();

    console.log(`[credits] email:${session.user.email} userFound:${!!user} credits:${user?.credits}`);

    const credits = typeof user?.credits === "number" ? user.credits : 0;
    const isPro = user?.isPro === true;

    return NextResponse.json({ credits, isPro });
  } catch (error) {
    console.error("Error fetching credits:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
