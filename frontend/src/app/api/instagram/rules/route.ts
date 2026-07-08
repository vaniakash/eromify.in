import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { InstagramAccount } from "@/models/InstagramAccount";
import { InstagramRule } from "@/models/InstagramRule";

/**
 * GET /api/instagram/rules?userId=...
 * Returns all rules for the user's connected account.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  await connectDB();
  const account = await InstagramAccount.findOne({ userId });
  if (!account) return NextResponse.json({ rules: [] });

  const rules = await InstagramRule.find({ accountId: account._id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ rules });
}

/**
 * POST /api/instagram/rules
 * Creates a new automation rule.
 */
export async function POST(request: Request) {
  const body = await request.json();
  const { userId, trigger, action } = body;

  if (!userId || !trigger || !action) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (trigger.type === "keyword" && !trigger.keyword?.trim()) {
    return NextResponse.json({ error: "Keyword is required for keyword trigger" }, { status: 400 });
  }

  if (!action.dmText?.trim() && !action.commentText?.trim()) {
    return NextResponse.json({ error: "At least one reply text is required" }, { status: 400 });
  }

  await connectDB();
  const account = await InstagramAccount.findOne({ userId });
  if (!account) return NextResponse.json({ error: "No connected account" }, { status: 404 });

  const rule = await InstagramRule.create({
    accountId: account._id,
    userId,
    trigger,
    action,
    isActive: true,
  });

  return NextResponse.json({ rule }, { status: 201 });
}

/**
 * PATCH /api/instagram/rules
 * Toggles isActive for a rule.
 * Body: { ruleId, isActive }
 */
export async function PATCH(request: Request) {
  const body = await request.json();
  const { ruleId, isActive } = body;

  if (!ruleId) return NextResponse.json({ error: "ruleId required" }, { status: 400 });

  await connectDB();
  await InstagramRule.findByIdAndUpdate(ruleId, { isActive });
  return NextResponse.json({ success: true });
}

/**
 * DELETE /api/instagram/rules
 * Deletes a rule by ID.
 * Body: { ruleId }
 */
export async function DELETE(request: Request) {
  const body = await request.json();
  const { ruleId } = body;

  if (!ruleId) return NextResponse.json({ error: "ruleId required" }, { status: 400 });

  await connectDB();
  await InstagramRule.findByIdAndDelete(ruleId);
  return NextResponse.json({ success: true });
}
