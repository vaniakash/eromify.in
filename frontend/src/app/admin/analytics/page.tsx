import { connectDB } from "@/lib/db";
import { AnalyticsEvent } from "@/models/AnalyticsEvent";
import { User } from "@/models/User";
import { Payment } from "@/models/Payment";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

/* ── helpers ──────────────────────────────────────────────────────── */
const COLOR = {
  violet: "#7c6cfe",
  cyan:   "#22d3ee",
  pink:   "#f472b6",
  emerald:"#34d399",
  amber:  "#fbbf24",
};

const EVENT_META: Record<string, { label: string; icon: string; color: string }> = {
  page_view:    { label: "Page View",    icon: "visibility",         color: COLOR.emerald },
  cta_click:    { label: "CTA Click",   icon: "ads_click",          color: COLOR.violet  },
  modal_open:   { label: "Modal Open",  icon: "open_in_new",        color: COLOR.cyan    },
  modal_close:  { label: "Modal Close", icon: "close",              color: COLOR.pink    },
};

const LABEL_NAMES: Record<string, string> = {
  start_creating:  "Start Creating Now",
  explore_tools:   "Explore AI Tools",
  promo_try_now:   "Promo: Try Now",
  promo_later:     "Promo: Later",
};

/* ── tiny bar as inline SVG ──────────────────────────────────────── */
function MiniBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ flex: 1, height: 6, background: "var(--bg-deep)", borderRadius: 3, overflow: "hidden", minWidth: 60 }}>
      <div style={{ width: `${Math.max(pct, 2)}%`, height: "100%", background: color, borderRadius: 3, boxShadow: `0 0 6px ${color}66` }} />
    </div>
  );
}

/* ── sparkline from array of numbers ────────────────────────────── */
function Spark({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const w = 80, h = 32;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (v / max) * (h - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(data.length - 1) / (data.length - 1) * w} cy={h - (data[data.length - 1] / max) * (h - 4) - 2} r="3" fill={color} />
    </svg>
  );
}

/* ── Page ─────────────────────────────────────────────────────────── */
export default async function AnalyticsPage() {
  await connectDB();

  /* ── totals ── */
  const totalViews    = await AnalyticsEvent.countDocuments({ event: "page_view" });
  const uniqueVisitors = (await AnalyticsEvent.distinct("ip", { event: "page_view" })).length;
  const totalClicks   = await AnalyticsEvent.countDocuments({ event: "cta_click" });
  const totalUsers    = await User.countDocuments();
  const totalRevenue  = await Payment.aggregate([
    { $match: { status: "paid" } },
    { $group: { _id: null, t: { $sum: "$amount" } } },
  ]);
  const revenue = totalRevenue.length ? totalRevenue[0].t / 100 : 0;

  /* ── daily views last 14 days (for sparkline) ── */
  const fourteenAgo = new Date(Date.now() - 13 * 86400000);
  const dailyViews: { _id: { d: number; m: number }; n: number }[] =
    await AnalyticsEvent.aggregate([
      { $match: { event: "page_view", createdAt: { $gte: fourteenAgo } } },
      { $group: { _id: { d: { $dayOfMonth: "$createdAt" }, m: { $month: "$createdAt" } }, n: { $sum: 1 } } },
      { $sort: { "_id.m": 1, "_id.d": 1 } },
    ]);
  // fill all 14 slots
  const viewsMap: Record<string, number> = {};
  dailyViews.forEach(r => { viewsMap[`${r._id.m}-${r._id.d}`] = r.n; });
  const sparkViews = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(fourteenAgo.getTime() + i * 86400000);
    return viewsMap[`${d.getMonth() + 1}-${d.getDate()}`] ?? 0;
  });

  /* ── daily clicks last 14 ── */
  const dailyClicks: { _id: { d: number; m: number }; n: number }[] =
    await AnalyticsEvent.aggregate([
      { $match: { event: "cta_click", createdAt: { $gte: fourteenAgo } } },
      { $group: { _id: { d: { $dayOfMonth: "$createdAt" }, m: { $month: "$createdAt" } }, n: { $sum: 1 } } },
      { $sort: { "_id.m": 1, "_id.d": 1 } },
    ]);
  const clicksMap: Record<string, number> = {};
  dailyClicks.forEach(r => { clicksMap[`${r._id.m}-${r._id.d}`] = r.n; });
  const sparkClicks = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(fourteenAgo.getTime() + i * 86400000);
    return clicksMap[`${d.getMonth() + 1}-${d.getDate()}`] ?? 0;
  });

  /* ── CTA breakdown ── */
  const ctaBreakdown: { _id: string; count: number }[] = await AnalyticsEvent.aggregate([
    { $match: { event: "cta_click" } },
    { $group: { _id: "$label", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  /* ── Top pages ── */
  const topPages: { _id: string; count: number }[] = await AnalyticsEvent.aggregate([
    { $match: { event: "page_view" } },
    { $group: { _id: "$page", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 8 },
  ]);
  const maxPage = topPages[0]?.count ?? 1;

  /* ── Event type breakdown ── */
  const eventTypes: { _id: string; count: number }[] = await AnalyticsEvent.aggregate([
    { $group: { _id: "$event", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  const totalEvents = eventTypes.reduce((s, e) => s + e.count, 0);

  /* ── Hourly heatmap (last 7 days) ── */
  const sevenAgo = new Date(Date.now() - 7 * 86400000);
  const hourly: { _id: number; n: number }[] = await AnalyticsEvent.aggregate([
    { $match: { createdAt: { $gte: sevenAgo } } },
    { $group: { _id: { $hour: "$createdAt" }, n: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  const hourMap: Record<number, number> = {};
  hourly.forEach(h => { hourMap[h._id] = h.n; });
  const maxHour = Math.max(...Object.values(hourMap), 1);

  /* ── Recent events ── */
  const recentEvents = await AnalyticsEvent.find().sort({ createdAt: -1 }).limit(25).lean();

  /* ── KPI rows ── */
  const KPI = [
    { label: "Page Views",       value: totalViews.toLocaleString(),     icon: "visibility",       color: COLOR.violet,  spark: sparkViews,  sparkColor: COLOR.violet },
    { label: "Unique Visitors",  value: uniqueVisitors.toLocaleString(), icon: "person",           color: COLOR.cyan,    spark: sparkViews,  sparkColor: COLOR.cyan   },
    { label: "CTA Clicks",       value: totalClicks.toLocaleString(),    icon: "ads_click",        color: COLOR.pink,    spark: sparkClicks, sparkColor: COLOR.pink   },
    { label: "Registered Users", value: totalUsers.toLocaleString(),     icon: "group",            color: COLOR.emerald, spark: sparkViews,  sparkColor: COLOR.emerald},
    { label: "Revenue (INR)",    value: `₹${revenue.toLocaleString("en-IN")}`, icon: "payments", color: COLOR.amber,   spark: sparkClicks, sparkColor: COLOR.amber  },
    { label: "CTR",              value: totalViews > 0 ? `${((totalClicks / totalViews) * 100).toFixed(2)}%` : "0%", icon: "percent", color: "#a78bfa", spark: sparkClicks, sparkColor: "#a78bfa" },
  ];

  return (
    <>
      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="page-header">
        <div className="page-header-eyebrow">Analytics &amp; Tracking</div>
        <h1 className="shimmer-text">Platform Insights</h1>
        <p>Real-time metrics on page views, user engagement, and conversion across the platform.</p>
      </div>

      {/* ── KPI grid ─────────────────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 16,
        marginBottom: 24,
      }}>
        {KPI.map((k, idx) => (
          <div
            key={k.label}
            className="kpi-card"
            style={{ padding: 20, animationDelay: `${idx * 60}ms` }}
          >
            {/* glow */}
            <div style={{
              position: "absolute", top: -20, right: -20,
              width: 90, height: 90, borderRadius: "50%",
              background: k.color, opacity: 0.08,
              filter: "blur(20px)", pointerEvents: "none",
            }} />
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
              <div className="kpi-icon-wrap" style={{ background: `${k.color}18`, color: k.color, marginBottom: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{k.icon}</span>
              </div>
              <Spark data={k.spark} color={k.sparkColor} />
            </div>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{ fontSize: 24 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* ── 2-col: CTA breakdown + Event types ───────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 16,
        marginBottom: 24,
      }}>

        {/* CTA Breakdown */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-title">CTA Click Breakdown</div>
              <div className="chart-sub">By button label · all time</div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: COLOR.pink, background: `${COLOR.pink}12`, border: `1px solid ${COLOR.pink}30`, padding: "3px 10px", borderRadius: 20 }}>
              {totalClicks.toLocaleString()} total
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {ctaBreakdown.map((item) => {
              const pct = totalClicks > 0 ? (item.count / totalClicks) * 100 : 0;
              return (
                <div key={item._id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                      {LABEL_NAMES[item._id] ?? item._id ?? "Unknown"}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: COLOR.violet, flexShrink: 0 }}>
                      {item.count} ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <MiniBar pct={pct} color={COLOR.violet} />
                </div>
              );
            })}
            {ctaBreakdown.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>No click data yet.</p>
            )}
          </div>
        </div>

        {/* Event Type Breakdown */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-title">Event Types</div>
              <div className="chart-sub">All recorded event categories</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {eventTypes.map((et) => {
              const meta = EVENT_META[et._id] ?? { label: et._id, icon: "bolt", color: "var(--text-muted)" };
              const pct = totalEvents > 0 ? (et.count / totalEvents) * 100 : 0;
              return (
                <div key={et._id}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: `${meta.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 15, color: meta.color }}>{meta.icon}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", flex: 1 }}>{meta.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: meta.color, flexShrink: 0 }}>{et.count.toLocaleString()}</span>
                  </div>
                  <MiniBar pct={pct} color={meta.color} />
                </div>
              );
            })}
            {eventTypes.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>No events recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Hourly heatmap ───────────────────────────────────────── */}
      <div className="chart-card" style={{ marginBottom: 24 }}>
        <div className="chart-card-header">
          <div>
            <div className="chart-title">Hourly Activity Heatmap</div>
            <div className="chart-sub">All events by hour of day · last 7 days</div>
          </div>
        </div>
        <div style={{ overflowX: "auto", paddingBottom: 4 }}>
          <div style={{ display: "flex", gap: 6, minWidth: 500, alignItems: "flex-end", height: 80 }}>
            {Array.from({ length: 24 }, (_, h) => {
              const n = hourMap[h] ?? 0;
              const heightPct = Math.max((n / maxHour) * 100, 4);
              const isPeak = n === maxHour && maxHour > 0;
              return (
                <div
                  key={h}
                  title={`${h}:00 — ${n} events`}
                  style={{
                    flex: 1,
                    minWidth: 16,
                    height: `${heightPct}%`,
                    borderRadius: "4px 4px 2px 2px",
                    background: isPeak
                      ? `linear-gradient(180deg, ${COLOR.violet}, ${COLOR.cyan})`
                      : `${COLOR.violet}40`,
                    boxShadow: isPeak ? `0 0 12px ${COLOR.violet}66` : "none",
                    cursor: "default",
                    transition: "all 0.3s",
                  }}
                />
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 6, minWidth: 500, marginTop: 6 }}>
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} style={{ flex: 1, minWidth: 16, textAlign: "center", fontSize: 9, fontWeight: 700, color: "var(--text-muted)" }}>
                {h % 6 === 0 ? `${h}h` : ""}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Top pages table ───────────────────────────────────────── */}
      <div className="chart-card" style={{ marginBottom: 24 }}>
        <div className="chart-card-header">
          <div>
            <div className="chart-title">Top Pages</div>
            <div className="chart-sub">Most visited URLs · all time</div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: COLOR.emerald, background: `${COLOR.emerald}12`, border: `1px solid ${COLOR.emerald}30`, padding: "3px 10px", borderRadius: 20 }}>
            {totalViews.toLocaleString()} views
          </span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 320 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                {["#", "Page", "Views", "Share"].map((h, i) => (
                  <th key={h} style={{
                    padding: "10px 12px", textAlign: i === 0 ? "center" : i === 2 || i === 3 ? "right" : "left",
                    fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px",
                    color: "var(--text-muted)",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topPages.map((pg, i) => {
                const pct = totalViews > 0 ? (pg.count / totalViews) * 100 : 0;
                return (
                  <tr key={pg._id} className="users-tr">
                    <td style={{ padding: "11px 12px", textAlign: "center", fontSize: 11, fontWeight: 800, color: "var(--text-muted)" }}>{i + 1}</td>
                    <td style={{ padding: "11px 12px" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontFamily: "monospace" }}>
                        {pg._id || "/"}
                      </span>
                    </td>
                    <td style={{ padding: "11px 12px", textAlign: "right", fontSize: 13, fontWeight: 800, color: COLOR.emerald }}>
                      {pg.count.toLocaleString()}
                    </td>
                    <td style={{ padding: "11px 12px", textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
                        <div style={{ width: 60, height: 4, background: "var(--bg-deep)", borderRadius: 2, overflow: "hidden", flexShrink: 0 }}>
                          <div style={{ width: `${(pg.count / maxPage) * 100}%`, height: "100%", background: COLOR.emerald, borderRadius: 2 }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", minWidth: 36, textAlign: "right" }}>{pct.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {topPages.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: "32px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                    No page view data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Live event feed ───────────────────────────────────────── */}
      <div className="chart-card">
        <div className="chart-card-header">
          <div>
            <div className="chart-title">Live Event Feed</div>
            <div className="chart-sub">Last 25 recorded events</div>
          </div>
          <span style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 11, fontWeight: 700, color: COLOR.emerald,
            background: `${COLOR.emerald}12`, border: `1px solid ${COLOR.emerald}30`,
            padding: "4px 12px", borderRadius: 20,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: COLOR.emerald, boxShadow: `0 0 6px ${COLOR.emerald}`, animation: "pulse-dot 2s infinite", display: "inline-block" }} />
            Live
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {recentEvents.map((ev, i) => {
            const meta = EVENT_META[ev.event] ?? { label: ev.event, icon: "bolt", color: "var(--text-muted)" };
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                  flexWrap: "wrap",
                  rowGap: 6,
                }}
              >
                {/* icon */}
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: `${meta.color}18`, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: meta.color }}>{meta.icon}</span>
                </div>

                {/* event name + label */}
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>
                    {ev.event === "cta_click"
                      ? (LABEL_NAMES[ev.label ?? ""] ?? ev.label ?? "CTA Click")
                      : meta.label}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>
                    {ev.page} · IP {ev.ip ?? "—"}
                  </div>
                </div>

                {/* badge + time */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 6,
                    background: `${meta.color}15`, color: meta.color,
                    border: `1px solid ${meta.color}30`, textTransform: "uppercase", letterSpacing: "0.5px",
                  }}>
                    {ev.event.replace("_", " ")}
                  </span>
                  <span suppressHydrationWarning style={{ fontSize: 10, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                    {ev.createdAt ? formatDistanceToNow(new Date(ev.createdAt), { addSuffix: true }) : "—"}
                  </span>
                </div>
              </div>
            );
          })}
          {recentEvents.length === 0 && (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 40, display: "block", marginBottom: 8 }}>bar_chart_4_bars</span>
              No events recorded yet.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
