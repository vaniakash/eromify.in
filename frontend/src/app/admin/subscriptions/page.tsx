import { connectDB } from "@/lib/db";
import { GalleryImage, IGalleryImage } from "@/models/GalleryImage";
import { formatDistanceToNow } from "date-fns";
import { CreatorGrid } from "./CreatorGrid";

export const dynamic = "force-dynamic";

interface TopCreator {
  _id: string;        // email
  userName?: string;
  count: number;
  lastGen: Date;
}

interface ModeStatItem {
  _id: string;
  count: number;
}

const MODE_LABELS: Record<string, string> = {
  text2img: "Text → Image",
  edit: "Image Edit",
  multiref: "Multi-Ref",
};

const MODE_COLORS: Record<string, { color: string; bg: string }> = {
  text2img: { color: "#7c6cfe", bg: "rgba(124,108,254,0.12)" },
  edit:     { color: "#f472b6", bg: "rgba(244,114,182,0.12)" },
  multiref: { color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
};

export default async function AdminSubscriptions() {
  await connectDB();

  // ── Aggregate stats ───────────────────────────────────────────────
  const totalGenerations = await GalleryImage.countDocuments();
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayCount    = await GalleryImage.countDocuments({ createdAt: { $gte: todayStart } });
  const uniqueCreators = (await GalleryImage.distinct("userEmail")).length;

  const modeStats: ModeStatItem[] = await GalleryImage.aggregate([
    { $group: { _id: "$mode", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // ── Top creators + their last 20 images ──────────────────────────
  const topCreators: TopCreator[] = await GalleryImage.aggregate([
    {
      $group: {
        _id: "$userEmail",
        userName: { $first: "$userName" },
        count: { $sum: 1 },
        lastGen: { $max: "$createdAt" },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ]);

  // Fetch images per creator (last 20 each)
  const creatorsWithImages = await Promise.all(
    topCreators.map(async (c) => {
      const imgs = (await GalleryImage.find({ userEmail: c._id })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean()) as IGalleryImage[];
      return {
        email: c._id,
        userName: c.userName ?? "",
        count: c.count,
        lastGen: c.lastGen,
        images: imgs.map((img) => ({
          url: img.cloudinaryUrl,
          prompt: img.prompt,
          mode: img.mode,
          createdAt: img.createdAt?.toISOString() ?? "",
        })),
      };
    })
  );

  // ── Recent 30 for the activity feed ──────────────────────────────
  const recent = (await GalleryImage.find()
    .sort({ createdAt: -1 })
    .limit(30)
    .lean()) as IGalleryImage[];

  const KPI = [
    { label: "Total Generations", value: totalGenerations.toLocaleString(), icon: "auto_awesome",   color: "#7c6cfe" },
    { label: "Generated Today",   value: todayCount.toLocaleString(),        icon: "today",          color: "#22d3ee" },
    { label: "Unique Creators",   value: uniqueCreators.toLocaleString(),    icon: "group",          color: "#34d399" },
    {
      label: "Avg per Creator",
      value: uniqueCreators > 0 ? (totalGenerations / uniqueCreators).toFixed(1) : "0",
      icon: "bar_chart", color: "#f472b6",
    },
  ];

  return (
    <>
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="page-header">
        <div className="page-header-eyebrow">AI Monitor</div>
        <h1 className="shimmer-text">Generation Activity</h1>
        <p>Track AI image generations, browse creator galleries, and contact users directly.</p>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────── */}
      <div className="kpi-grid" style={{ marginBottom: 28 }}>
        {KPI.map((k, i) => (
          <div className="kpi-card" key={k.label} style={{ animationDelay: `${i * 70}ms` }}>
            <div
              style={{
                position: "absolute", top: -24, right: -24,
                width: 100, height: 100, borderRadius: "50%",
                background: k.color, opacity: 0.07,
                filter: "blur(24px)", pointerEvents: "none",
              }}
            />
            <div className="kpi-icon-wrap" style={{ background: `${k.color}18`, color: k.color }}>
              <span className="material-symbols-outlined">{k.icon}</span>
            </div>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
          </div>
        ))}
      </div>

      {/* ── Mode Breakdown ─────────────────────────────────────────── */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 16,
          padding: "20px 24px",
          marginBottom: 28,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginRight: 4 }}>
          Mode Breakdown
        </span>
        {modeStats.map((m) => {
          const mc = MODE_COLORS[m._id] ?? { color: "#8b95b8", bg: "rgba(139,149,184,0.1)" };
          const pct = totalGenerations > 0 ? ((m.count / totalGenerations) * 100).toFixed(1) : "0";
          return (
            <div
              key={m._id}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 14px", borderRadius: 20,
                background: mc.bg, color: mc.color,
                border: `1px solid ${mc.color}33`, fontSize: 12, fontWeight: 700,
              }}
            >
              <span>{MODE_LABELS[m._id] ?? m._id}</span>
              <span style={{ opacity: 0.7 }}>{m.count.toLocaleString()} ({pct}%)</span>
            </div>
          );
        })}
        {modeStats.length === 0 && (
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>No generations yet.</span>
        )}
      </div>

      {/* ── Creator Gallery Grid (client component) ─────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
              Top Creators
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
              Click &ldquo;View All&rdquo; to browse their full gallery · Click &ldquo;Email&rdquo; to send a message
            </div>
          </div>
          <span
            style={{
              fontSize: 11, fontWeight: 700,
              padding: "4px 12px", borderRadius: 20,
              background: "rgba(124,108,254,0.1)", color: "#7c6cfe",
              border: "1px solid rgba(124,108,254,0.2)",
            }}
          >
            {creatorsWithImages.length} creators
          </span>
        </div>
        <CreatorGrid creators={creatorsWithImages} />
        {creatorsWithImages.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-muted)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 40, display: "block", marginBottom: 8 }}>
              image_search
            </span>
            No creators yet.
          </div>
        )}
      </div>

      {/* ── Recent Activity Feed ────────────────────────────────────── */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 16,
          overflow: "hidden",
          animation: "fadeSlideUp 0.5s 0.3s ease both",
        }}
      >
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
            Recent Activity
          </div>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Last 30 generations</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620 }}>
            <thead>
              <tr style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border-subtle)" }}>
                {["Preview", "Creator", "Prompt", "Mode", "When"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 20px", textAlign: "left",
                      fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                      letterSpacing: "1.2px", color: "var(--text-muted)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.length > 0 ? (
                recent.map((item, i) => {
                  const mc = MODE_COLORS[item.mode] ?? { color: "#8b95b8", bg: "rgba(139,149,184,0.1)" };
                  return (
                    <tr
                      key={i}
                      className="users-tr"
                    >
                      <td style={{ padding: "12px 20px" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.cloudinaryUrl}
                          alt=""
                          style={{
                            width: 44, height: 44, borderRadius: 8,
                            objectFit: "cover",
                            border: "1.5px solid var(--border-subtle)",
                          }}
                        />
                      </td>
                      <td style={{ padding: "12px 20px" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                          {item.userName || "—"}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>
                          {item.userEmail}
                        </div>
                      </td>
                      <td style={{ padding: "12px 20px", maxWidth: 220 }}>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.prompt}
                        </div>
                      </td>
                      <td style={{ padding: "12px 20px" }}>
                        <span
                          style={{
                            fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 6,
                            background: mc.bg, color: mc.color,
                            border: `1px solid ${mc.color}33`,
                          }}
                        >
                          {MODE_LABELS[item.mode] ?? item.mode}
                        </span>
                      </td>
                      <td suppressHydrationWarning style={{ padding: "12px 20px", fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {item.createdAt
                          ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
                          : "—"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: "48px 0", textAlign: "center", color: "var(--text-muted)" }}>
                    No generations yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
