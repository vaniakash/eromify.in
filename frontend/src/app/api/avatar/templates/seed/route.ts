import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { AvatarTemplate } from "@/models/AvatarTemplate";

const CLOUDINARY_BASE = "https://res.cloudinary.com/nxg2vmmu/image/upload/modie";
const CLOUDINARY_FOLDER = "modie";

// All known templates with their Cloudinary filenames
const SEED_TEMPLATES = [
  { templateId: "1",  file: "sofi.png",   name: "Emma Johnson",     category: "Female", sortOrder: 1  },
  { templateId: "2",  file: "alia.png",   name: "Sophia Martinez",  category: "Female", sortOrder: 2  },
  { templateId: "3",  file: "kira.png",   name: "Olivia Anderson",  category: "Female", sortOrder: 3  },
  { templateId: "4",  file: "llia.png",   name: "Isabella Rossi",   category: "Female", sortOrder: 4  },
  { templateId: "5",  file: "sia.png",    name: "Charlotte Wilson", category: "Female", sortOrder: 5  },
  { templateId: "6",  file: "ria.png",    name: "Amelia Brown",     category: "Female", sortOrder: 6  },
  { templateId: "7",  file: "nia.png",    name: "Mia Thompson",     category: "Female", sortOrder: 7  },
  { templateId: "8",  file: "kia.png",    name: "Ava Taylor",       category: "Female", sortOrder: 8  },
  { templateId: "9",  file: "gg.png",     name: "Emily Clark",      category: "Female", sortOrder: 9  },
  { templateId: "10", file: "sweedy.png", name: "Chloe Evans",      category: "Female", sortOrder: 10 },
  { templateId: "11", file: "sturm.png",  name: "Hannah Miller",    category: "Female", sortOrder: 11 },
  { templateId: "12", file: "akash.png",  name: "Arjun Sharma",     category: "Male",   sortOrder: 12 },
];

/**
 * POST /api/avatar/templates/seed
 * Seeds the AvatarTemplate collection with the existing Cloudinary images.
 * Protected by ADMIN_SECRET header.
 * Safe to run multiple times (upserts by templateId).
 */
export async function POST(req: NextRequest) {
  // Simple secret check — only callable by admin
  const secret = req.headers.get("x-admin-secret");
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const results = [];

  for (const t of SEED_TEMPLATES) {
    const cloudinaryUrl = `${CLOUDINARY_BASE}/${t.file}`;
    // public_id in Cloudinary is the folder path without extension
    const cloudinaryPublicId = `${CLOUDINARY_FOLDER}/${t.file.replace(/\.[^.]+$/, "")}`;

    const doc = await AvatarTemplate.findOneAndUpdate(
      { templateId: t.templateId },
      {
        $set: {
          name: t.name,
          category: t.category,
          cloudinaryUrl,
          cloudinaryPublicId,
          isActive: true,
          sortOrder: t.sortOrder,
        },
      },
      { upsert: true, new: true }
    );

    results.push({ templateId: t.templateId, name: t.name, id: doc._id });
  }

  return NextResponse.json({
    message: `Seeded ${results.length} templates successfully`,
    templates: results,
  });
}
