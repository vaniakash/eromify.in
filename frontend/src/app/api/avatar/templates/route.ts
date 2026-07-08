import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { AvatarTemplate } from "@/models/AvatarTemplate";

export const dynamic = "force-dynamic";

/**
 * GET /api/avatar/templates
 * Returns all active avatar templates, sorted by sortOrder.
 * Used by the TemplateGalleryClient to render the template grid.
 */
export async function GET() {
  try {
    await connectDB();

    const templates = await AvatarTemplate.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: 1 })
      .select("templateId name category cloudinaryUrl")
      .lean();

    return NextResponse.json({ templates });
  } catch (err: unknown) {
    console.error("[avatar/templates] DB error:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Failed to load templates" },
      { status: 500 }
    );
  }
}
