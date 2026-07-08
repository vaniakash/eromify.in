"use client";

import { useState, useEffect, useCallback } from "react";

interface Image {
  url: string;
  prompt: string;
  mode: string;
  createdAt: string;
}

interface Creator {
  email: string;
  userName: string;
  count: number;
  images: Image[];
}

interface Props {
  creators: Creator[];
}

// ── Slide viewer modal ────────────────────────────────────────────────────────
function SlideViewer({
  creator,
  onClose,
  onEmail,
}: {
  creator: Creator;
  onClose: () => void;
  onEmail: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const images = creator.images;

  const prev = useCallback(() => setIdx((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIdx((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, prev, next]);

  const current = images[idx];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(3,7,18,0.92)",
        backdropFilter: "blur(16px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 20,
          overflow: "hidden",
          width: "100%",
          maxWidth: 860,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg,#7c6cfe,#22d3ee)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 800, color: "#fff", flexShrink: 0,
            }}
          >
            {(creator.userName || creator.email).charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
              {creator.userName || creator.email}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{creator.email}</div>
          </div>
          <span
            style={{
              fontSize: 11, fontWeight: 700,
              color: "var(--accent-cyan)", background: "rgba(34,211,238,0.1)",
              border: "1px solid rgba(34,211,238,0.2)",
              padding: "3px 10px", borderRadius: 20,
            }}
          >
            {idx + 1} / {images.length}
          </span>
          {/* Email button */}
          <button
            onClick={onEmail}
            style={{
              padding: "7px 14px",
              borderRadius: 8,
              fontSize: 12, fontWeight: 700,
              background: "rgba(124,108,254,0.12)",
              color: "#7c6cfe",
              border: "1px solid rgba(124,108,254,0.3)",
              cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>mail</span>
            Send Mail
          </button>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-muted)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
          </button>
        </div>

        {/* Image area */}
        <div style={{ flex: 1, position: "relative", minHeight: 0, overflow: "hidden", background: "#000" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={idx}
            src={current.url}
            alt={current.prompt}
            style={{
              width: "100%", height: "100%",
              objectFit: "contain",
              maxHeight: 480,
              animation: "imgFadeIn 0.25s ease",
            }}
          />
          {/* Prev / Next */}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                style={{
                  position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
                  width: 40, height: 40, borderRadius: "50%",
                  background: "rgba(7,14,31,0.7)", backdropFilter: "blur(8px)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                onClick={next}
                style={{
                  position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                  width: 40, height: 40, borderRadius: "50%",
                  background: "rgba(7,14,31,0.7)", backdropFilter: "blur(8px)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </>
          )}
        </div>

        {/* Prompt + thumbnail strip */}
        <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border-subtle)" }}>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12, lineHeight: 1.5 }}>
            <strong style={{ color: "var(--text-secondary)" }}>Prompt:</strong> {current.prompt}
          </p>
          {/* Thumbnail strip */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
            {images.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={img.url}
                alt=""
                onClick={() => setIdx(i)}
                style={{
                  width: 48, height: 48, borderRadius: 8,
                  objectFit: "cover", flexShrink: 0, cursor: "pointer",
                  border: `2px solid ${i === idx ? "#7c6cfe" : "transparent"}`,
                  opacity: i === idx ? 1 : 0.5,
                  transition: "all 0.15s",
                  boxShadow: i === idx ? "0 0 8px rgba(124,108,254,0.5)" : "none",
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes imgFadeIn { from { opacity:0; transform:scale(0.98); } to { opacity:1; transform:scale(1); } }`}</style>
    </div>
  );
}

// ── Email modal ───────────────────────────────────────────────────────────────
function EmailModal({ creator, onClose }: { creator: Creator; onClose: () => void }) {
  const [subject, setSubject] = useState(`Hi ${creator.userName || creator.email.split("@")[0]}!`);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const send = async () => {
    if (!subject.trim() || !message.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/admin/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: creator.email, subject, message }),
      });
      const data = await res.json();
      setStatus(data.success ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "rgba(3,7,18,0.85)",
        backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 20,
          padding: 32,
          width: "100%", maxWidth: 520,
          animation: "modalIn 0.2s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div
            style={{
              width: 40, height: 40, borderRadius: 12,
              background: "rgba(124,108,254,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#7c6cfe",
            }}
          >
            <span className="material-symbols-outlined">mail</span>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Send Email</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>to {creator.email}</div>
          </div>
          <button
            onClick={onClose}
            style={{
              marginLeft: "auto", width: 30, height: 30, borderRadius: 8,
              background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
              color: "var(--text-muted)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
          </button>
        </div>

        {status === "sent" ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: "#34d399", display: "block", marginBottom: 12 }}>
              check_circle
            </span>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Email Sent!</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>Message delivered to {creator.email}</div>
            <button
              onClick={onClose}
              style={{
                marginTop: 20, padding: "10px 24px", borderRadius: 10,
                background: "rgba(52,211,153,0.12)", color: "#34d399",
                border: "1px solid rgba(52,211,153,0.25)",
                fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 6 }}>
                Subject
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{
                  width: "100%", background: "var(--bg-deep)",
                  border: "1px solid var(--border-subtle)", borderRadius: 10,
                  padding: "10px 14px", fontSize: 13, color: "var(--text-primary)",
                  outline: "none", fontFamily: "inherit",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 6 }}>
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="Write your message here…"
                style={{
                  width: "100%", background: "var(--bg-deep)",
                  border: "1px solid var(--border-subtle)", borderRadius: 10,
                  padding: "10px 14px", fontSize: 13, color: "var(--text-primary)",
                  outline: "none", fontFamily: "inherit", resize: "vertical",
                }}
              />
            </div>
            {status === "error" && (
              <div style={{
                padding: "10px 14px", borderRadius: 10,
                background: "rgba(244,114,182,0.08)", color: "#f472b6",
                border: "1px solid rgba(244,114,182,0.2)", fontSize: 12,
              }}>
                Failed to send email. Check SMTP credentials.
              </div>
            )}
            <button
              onClick={send}
              disabled={status === "sending" || !subject.trim() || !message.trim()}
              style={{
                padding: "11px 0", borderRadius: 10,
                background: "linear-gradient(135deg,#7c6cfe,#22d3ee)",
                color: "#fff", border: "none",
                fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                opacity: (status === "sending" || !subject.trim() || !message.trim()) ? 0.6 : 1,
                transition: "opacity 0.2s",
              }}
            >
              {status === "sending" ? "Sending…" : "Send Email ✉️"}
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.96) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  );
}

// ── Main exported component ───────────────────────────────────────────────────
export function CreatorGrid({ creators }: Props) {
  const [viewing, setViewing] = useState<Creator | null>(null);
  const [emailing, setEmailing] = useState<Creator | null>(null);

  return (
    <>
      {/* Creator Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {creators.map((creator, rank) => (
          <div
            key={creator.email}
            className="kpi-card"
            style={{ padding: 20, animationDelay: `${rank * 40}ms`, cursor: "default" }}
          >
            {/* Creator header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div
                style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: `linear-gradient(135deg,${GRAD_COLORS[rank % GRAD_COLORS.length][0]},${GRAD_COLORS[rank % GRAD_COLORS.length][1]})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, fontWeight: 800, color: "#fff",
                  boxShadow: `0 4px 16px ${GRAD_COLORS[rank % GRAD_COLORS.length][0]}44`,
                }}
              >
                {(creator.userName || creator.email).charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {creator.userName || "Unknown"}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {creator.email}
                </div>
              </div>
              <span
                style={{
                  fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 6,
                  background: "rgba(34,211,238,0.1)", color: "#22d3ee",
                  border: "1px solid rgba(34,211,238,0.2)", flexShrink: 0,
                }}
              >
                #{rank + 1}
              </span>
            </div>

            {/* Image preview strip */}
            <div
              style={{
                display: "flex", gap: 4, marginBottom: 14,
                borderRadius: 10, overflow: "hidden", height: 72,
              }}
            >
              {creator.images.slice(0, 4).map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={img.url}
                  alt=""
                  style={{
                    flex: i === 0 ? 2 : 1,
                    height: "100%",
                    objectFit: "cover",
                    filter: "brightness(0.85)",
                  }}
                />
              ))}
              {creator.images.length === 0 && (
                <div style={{
                  flex: 1, background: "var(--bg-elevated)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--text-muted)", fontSize: 12,
                }}>
                  No images
                </div>
              )}
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>
                {creator.count}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>images generated</span>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setViewing(creator)}
                disabled={creator.images.length === 0}
                style={{
                  flex: 1, padding: "8px 0",
                  borderRadius: 9, fontSize: 12, fontWeight: 700,
                  background: "rgba(124,108,254,0.1)", color: "#7c6cfe",
                  border: "1px solid rgba(124,108,254,0.25)",
                  cursor: creator.images.length === 0 ? "not-allowed" : "pointer",
                  fontFamily: "inherit", display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 6,
                  opacity: creator.images.length === 0 ? 0.4 : 1,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>slideshow</span>
                View All
              </button>
              <button
                onClick={() => setEmailing(creator)}
                style={{
                  flex: 1, padding: "8px 0",
                  borderRadius: 9, fontSize: 12, fontWeight: 700,
                  background: "rgba(34,211,238,0.1)", color: "#22d3ee",
                  border: "1px solid rgba(34,211,238,0.25)",
                  cursor: "pointer", fontFamily: "inherit",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 6,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>mail</span>
                Email
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Slide Viewer Modal */}
      {viewing && (
        <SlideViewer
          creator={viewing}
          onClose={() => setViewing(null)}
          onEmail={() => { setEmailing(viewing); setViewing(null); }}
        />
      )}

      {/* Email Modal */}
      {emailing && (
        <EmailModal creator={emailing} onClose={() => setEmailing(null)} />
      )}
    </>
  );
}

const GRAD_COLORS = [
  ["#7c6cfe", "#22d3ee"],
  ["#f472b6", "#fb923c"],
  ["#34d399", "#22d3ee"],
  ["#fbbf24", "#f59e0b"],
  ["#a78bfa", "#7c6cfe"],
  ["#f43f5e", "#f472b6"],
  ["#10b981", "#34d399"],
  ["#60a5fa", "#7c6cfe"],
];
