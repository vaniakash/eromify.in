import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ContactMessage } from "@/models/ContactMessage";

// GET — list messages (newest first)
export async function GET() {
  await connectDB();
  const messages = await ContactMessage.find().sort({ createdAt: -1 }).limit(50).lean();
  const unread = await ContactMessage.countDocuments({ isRead: false });
  return NextResponse.json({ success: true, messages, unread });
}

// PATCH — mark a message as read
export async function PATCH(request: NextRequest) {
  const { id } = await request.json();
  if (!id) return NextResponse.json({ success: false }, { status: 400 });
  await connectDB();
  await ContactMessage.findByIdAndUpdate(id, { isRead: true });
  return NextResponse.json({ success: true });
}

// DELETE — delete a message
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ success: false }, { status: 400 });
  await connectDB();
  await ContactMessage.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
