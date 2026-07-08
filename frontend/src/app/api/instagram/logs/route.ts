import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { InstagramAccount } from "@/models/InstagramAccount";
import { InstagramLog } from "@/models/InstagramLog";

/**
 * GET /api/instagram/logs?userId=...&limit=20
 * Returns recent activity logs for the user's account.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  await connectDB();
  const account = await InstagramAccount.findOne({ userId });
  if (!account) return NextResponse.json({ logs: [] });

  const logs = await InstagramLog.find({ accountId: account._id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return NextResponse.json({ logs });
}
