import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { InstagramAccount } from "@/models/InstagramAccount";
import { InstagramRule } from "@/models/InstagramRule";
import { InstagramLog } from "@/models/InstagramLog";

/**
 * GET /api/instagram/account?userId=...
 * Returns the connected Instagram account for the given user.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  await connectDB();
  const account = await InstagramAccount.findOne({ userId }).lean();

  if (!account) {
    return NextResponse.json({ account: null });
  }

  // Don't expose the access token to the client
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { accessToken, ...safeAccount } = account as Record<string, unknown>;
  return NextResponse.json({ account: safeAccount });
}

/**
 * DELETE /api/instagram/account
 * Disconnects the Instagram account (deletes from DB).
 * Also deletes all rules and logs for this account.
 */
export async function DELETE(request: Request) {
  const { userId } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  await connectDB();
  const account = await InstagramAccount.findOne({ userId });

  if (!account) {
    return NextResponse.json({ error: "No account found" }, { status: 404 });
  }

  // Cascade delete rules and logs
  await InstagramRule.deleteMany({ accountId: account._id });
  await InstagramLog.deleteMany({ accountId: account._id });
  await InstagramAccount.deleteOne({ _id: account._id });

  return NextResponse.json({ success: true });
}
