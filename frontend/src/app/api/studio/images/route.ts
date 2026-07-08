import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { GalleryImage } from "@/models/GalleryImage";
import { cloudinaryDelete } from "@/lib/cloudinary";

// GET /api/studio/images?page=1&limit=20
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
    const skip = (page - 1) * limit;

    const [images, total] = await Promise.all([
      GalleryImage.find({ userEmail: session.user.email })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      GalleryImage.countDocuments({ userEmail: session.user.email }),
    ]);

    return NextResponse.json({
      images,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/studio/images?id=<mongoId>
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Image ID required" }, { status: 400 });

    await connectDB();
    const image = await GalleryImage.findOne({ _id: id, userEmail: session.user.email });
    if (!image) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Delete from Cloudinary (silent failure)
    if (image.cloudinaryPublicId) {
      await cloudinaryDelete(image.cloudinaryPublicId, "image").catch(() => {});
    }

    await GalleryImage.deleteOne({ _id: id, userEmail: session.user.email });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
