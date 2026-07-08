import { connectDB } from "@/lib/db";
import { ContactMessage, IContactMessage } from "@/models/ContactMessage";
import { formatDistanceToNow } from "date-fns";
import { MessagesClient } from "./MessagesClient";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  await connectDB();
  const rawMessages = await ContactMessage.find().sort({ createdAt: -1 }).limit(50).lean();
  const unread = rawMessages.filter((m) => !m.isRead).length;

  const messages = rawMessages.map((m) => ({
    ...m,
    _id: String(m._id),
    createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : null,
    timeAgo: m.createdAt ? formatDistanceToNow(new Date(m.createdAt), { addSuffix: true }) : "N/A",
  }));

  return (
    <>
      <div className="page-header">
        <div className="page-header-eyebrow">Support Inbox</div>
        <h1 className="shimmer-text">Messages</h1>
        <p>
          Contact form submissions · {unread > 0 ? `${unread} unread` : "All caught up!"}
        </p>
      </div>
      <MessagesClient messages={messages} />
    </>
  );
}
