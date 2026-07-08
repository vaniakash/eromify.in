import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { GalleryImage } from "@/models/GalleryImage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    // Recent 50 generations across all users
    const recent = await GalleryImage.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Top creators by generation count
    const topCreators = await GalleryImage.aggregate([
      { $group: { _id: "$userEmail", userName: { $first: "$userName" }, count: { $sum: 1 }, lastGen: { $max: "$createdAt" } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Stats
    const totalGenerations = await GalleryImage.countDocuments();
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayCount = await GalleryImage.countDocuments({ createdAt: { $gte: todayStart } });
    const uniqueCreators = await GalleryImage.distinct("userEmail");

    // Mode breakdown
    const modeStats = await GalleryImage.aggregate([
      { $group: { _id: "$mode", count: { $sum: 1 } } },
    ]);

    return NextResponse.json({ recent, topCreators, totalGenerations, todayCount, uniqueCreators: uniqueCreators.length, modeStats });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
