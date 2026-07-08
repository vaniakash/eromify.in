"use client";

import { useState } from "react";

interface Message {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string | null;
  timeAgo: string;
}

export function MessagesClient({ messages: initial }: { messages: Message[] }) {
  const [messages, setMessages] = useState<Message[]>(initial);
  const [selected, setSelected] = useState<Message | null>(null);

  const markRead = async (id: string) => {
    await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setMessages((prev) =>
      prev.map((m) => (m._id === id ? { ...m, isRead: true } : m))
    );
    setSelected((prev) => (prev && prev._id === id ? { ...prev, isRead: true } : prev));
  };

  const deleteMessage = async (id: string) => {
    await fetch(`/api/admin/messages?id=${id}`, { method: "DELETE" });
    setMessages((prev) => prev.filter((m) => m._id !== id));
    if (selected?._id === id) setSelected(null);
  };

  const openMessage = (m: Message) => {
    setSelected(m);
    if (!m.isRead) markRead(m._id);
  };

  const unread = messages.filter((m) => !m.isRead).length;

  return (
    <div className="messages-grid" style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20, height: "calc(100vh - 200px)", minHeight: 400 }}>
      {/* Message List */}
      <div className="chart-card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
            All Messages
          </span>
          {unread > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999,
              background: "rgba(244,114,182,0.15)", color: "#f472b6",
              border: "1px solid rgba(244,114,182,0.3)",
            }}>
              {unread} unread
            </span>
          )}
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          {messages.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 40, display: "block", marginBottom: 12, opacity: 0.4 }}>inbox</span>
              No messages yet
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m._id}
                onClick={() => openMessage(m)}
                style={{
                  padding: "14px 20px",
                  borderBottom: "1px solid var(--border)",
                  cursor: "pointer",
                  background: selected?._id === m._id ? "var(--bg-elevated)" : "transparent",
                  transition: "background 0.15s",
                  position: "relative",
                }}
              >
                {!m.isRead && (
                  <span style={{
                    position: "absolute", top: 18, right: 14,
                    width: 7, height: 7, borderRadius: "50%",
                    background: "#7c6cfe", boxShadow: "0 0 8px #7c6cfe",
                  }} />
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                    background: "var(--bg-elevated)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700, color: "#7c6cfe",
                  }}>
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: !m.isRead ? 700 : 500, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {m.name}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {m.subject}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 6, paddingLeft: 44 }}>
                  {m.timeAgo}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message Detail */}
      <div className="chart-card" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {selected ? (
          <>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{selected.subject}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  From <strong style={{ color: "var(--text-secondary)" }}>{selected.name}</strong>
                  {" "}·{" "}
                  <a href={`mailto:${selected.email}`} style={{ color: "#7c6cfe", textDecoration: "none" }}>{selected.email}</a>
                  {" "}·{" "}{selected.timeAgo}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <a
                  href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                  style={{
                    padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: "rgba(124,108,254,0.15)", color: "#7c6cfe",
                    border: "1px solid rgba(124,108,254,0.3)", textDecoration: "none",
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>reply</span>
                  Reply
                </a>
                <button
                  onClick={() => deleteMessage(selected._id)}
                  style={{
                    padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: "rgba(244,114,182,0.1)", color: "#f472b6",
                    border: "1px solid rgba(244,114,182,0.2)", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
                  Delete
                </button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "24px", lineHeight: 1.8 }}>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", whiteSpace: "pre-wrap", margin: 0 }}>
                {selected.message}
              </p>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 56, marginBottom: 16, opacity: 0.3 }}>mark_email_unread</span>
            <p style={{ fontSize: 13, margin: 0 }}>Select a message to read it</p>
          </div>
        )}
      </div>
    </div>
  );
}
