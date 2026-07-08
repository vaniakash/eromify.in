import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

// Revalidate every 60 seconds (or 0 for dynamic)
export const revalidate = 60;

export async function GET() {
  try {
    await connectDB();
    const count = await User.countDocuments();
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching user count:", error);
    return NextResponse.json({ count: 259 }, { status: 500 });
  }
}
