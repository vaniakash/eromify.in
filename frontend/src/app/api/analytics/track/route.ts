import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { AnalyticsEvent } from "@/models/AnalyticsEvent";

export async function POST(req: NextRequest) {
  try {
    const { event, page, label } = await req.json();

    if (!event || !page) {
      return NextResponse.json({ error: "Missing event or page" }, { status: 400 });
    }

    await connectDB();

    // Get IP to track unique vs total
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0] : "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    await AnalyticsEvent.create({
      event,
      page,
      label,
      ip,
      userAgent,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[analytics/track]", err);
    return NextResponse.json({ error: "Failed to track event" }, { status: 500 });
  }
}
