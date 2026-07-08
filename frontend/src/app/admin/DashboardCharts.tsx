"use client";

import { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────────── */
interface ChartPoint { label: string; revenue: number; year: number; month: number }
interface DayPoint   { label: string; count: number }

interface Props {
  chartData:      ChartPoint[];
  dayData:        DayPoint[];
  totalUsers:     number;
  activeSubs:     number;
  totalRevenue:   number;
  pendingRevenue: number;
  failedRevenue:  number;
  mrrINR:         number;
}

/* ─────────────────────────────────────────────────────────────────────
   Animated counter hook
───────────────────────────────────────────────────────────────────── */
function useCounter(target: number, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const dur = 1400;
      const steps = 60;
      let i = 0;
      const id = setInterval(() => {
        i++;
        const progress = i / steps;
        // easeOutExpo
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        setVal(Math.round(target * eased));
        if (i >= steps) { clearInterval(id); setVal(target); }
      }, dur / steps);
      return () => clearInterval(id);
    }, delay);
    return () => clearTimeout(t);
  }, [target, delay]);
  return val;
}

/* ─────────────────────────────────────────────────────────────────────
   Donut chart
───────────────────────────────────────────────────────────────────── */
function DonutChart({
  segments,
  size = 140,
  strokeWidth = 22,
  centerLabel,
  centerSub,
}: {
  segments: { value: number; color: string; label: string }[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerSub?: string;
}) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { setTimeout(() => setAnimated(true), 200); }, []);

  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;

  let offset = 0;
  const arcs = segments.map((seg) => {
    const pct = seg.value / total;
    const dash = pct * circ;
    const gap  = circ - dash;
    const startOffset = circ - offset;
    offset += dash;
    return { ...seg, dash, gap, startOffset };
  });

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} />
        {/* Segments */}
        {arcs.map((arc, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeDasharray={animated ? `${arc.dash} ${arc.gap}` : `0 ${circ}`}
            strokeDashoffset={arc.startOffset}
            strokeLinecap="butt"
            style={{
              transition: `stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1) ${i * 120}ms`,
              filter: `drop-shadow(0 0 6px ${arc.color}88)`,
            }}
          />
        ))}
      </svg>
      {/* Centre text */}
      {centerLabel && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          pointerEvents: "none",
        }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{centerLabel}</div>
          {centerSub && <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4, fontWeight: 600 }}>{centerSub}</div>}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Animated Revenue Line Chart
───────────────────────────────────────────────────────────────────── */
function RevenueLineChart({ data, total }: { data: ChartPoint[]; total: number }) {
  const [drawn, setDrawn] = useState(false);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; point: ChartPoint } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => { setTimeout(() => setDrawn(true), 300); }, []);

  const W = 1000, H = 200;
  const pad = { top: 20, bottom: 40, left: 60, right: 20 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const maxRev = Math.max(...data.map(d => d.revenue), 1);

  // Y-axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({
    y: pad.top + innerH - t * innerH,
    val: t * maxRev,
  }));

  const pts = data.map((d, i) => ({
    x: pad.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW),
    y: pad.top + innerH - (d.revenue / maxRev) * innerH,
    ...d,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const fillPath = `${linePath} L${pts[pts.length - 1].x},${pad.top + innerH} L${pts[0].x},${pad.top + innerH} Z`;

  // Compute path length for stroke-dashoffset animation
  const lineLen = pts.reduce((acc, p, i) => {
    if (i === 0) return 0;
    const dx = p.x - pts[i - 1].x;
    const dy = p.y - pts[i - 1].y;
    return acc + Math.sqrt(dx * dx + dy * dy);
  }, 0);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const svgX = ((e.clientX - rect.left) / rect.width) * W;
    // find closest point
    let closest = pts[0];
    let minDist = Infinity;
    pts.forEach(p => {
      const d = Math.abs(p.x - svgX);
      if (d < minDist) { minDist = d; closest = p; }
    });
    if (minDist < 80) setTooltip({ x: closest.x, y: closest.y, point: closest });
    else setTooltip(null);
  };

  return (
    <div style={{ position: "relative" }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: 200, overflow: "visible", cursor: "crosshair" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <linearGradient id="lineGrad" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#7c6cfe" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#7c6cfe" stopOpacity={0} />
          </linearGradient>
          <filter id="lineglow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Y-axis grid lines + labels */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={pad.left} y1={t.y} x2={W - pad.right} y2={t.y}
              stroke="rgba(255,255,255,0.05)" strokeWidth={1} strokeDasharray="4,4" />
            <text x={pad.left - 8} y={t.y + 4} textAnchor="end"
              fontSize={10} fill="rgba(139,149,184,0.6)" fontWeight={600}>
              {t.val >= 1000 ? `₹${(t.val / 1000).toFixed(0)}k` : `₹${Math.round(t.val)}`}
            </text>
          </g>
        ))}

        {/* Fill area (fades in after line) */}
        <path d={fillPath} fill="url(#lineGrad)"
          style={{ opacity: drawn ? 1 : 0, transition: "opacity 0.8s ease 1s" }} />

        {/* Animated line */}
        <path
          d={linePath}
          fill="none"
          stroke="#7c6cfe"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#lineglow)"
          style={{
            strokeDasharray: lineLen,
            strokeDashoffset: drawn ? 0 : lineLen,
            transition: "stroke-dashoffset 1.6s cubic-bezier(0.4,0,0.2,1)",
          }}
        />

        {/* Data points */}
        {pts.map((p, i) => (
          <g key={i} style={{ opacity: drawn ? 1 : 0, transition: `opacity 0.3s ease ${1.2 + i * 0.08}s` }}>
            <circle cx={p.x} cy={p.y} r={6} fill="#7c6cfe" opacity={0.25} />
            <circle cx={p.x} cy={p.y} r={3.5} fill="#7c6cfe" />
          </g>
        ))}

        {/* X-axis labels */}
        {pts.map((p, i) => (
          <text key={i} x={p.x} y={H - 8} textAnchor="middle"
            fontSize={9} fontWeight={700} fill="rgba(139,149,184,0.7)" letterSpacing={0.5}>
            {p.label}
          </text>
        ))}

        {/* Month revenue value labels */}
        {pts.map((p, i) => p.revenue > 0 && (
          <text key={`lbl-${i}`} x={p.x} y={p.y - 10} textAnchor="middle"
            fontSize={9} fontWeight={700} fill="#7c6cfe"
            style={{ opacity: drawn ? 0.8 : 0, transition: `opacity 0.3s ease ${1.4 + i * 0.08}s` }}>
            ₹{p.revenue >= 1000 ? `${(p.revenue / 1000).toFixed(1)}k` : Math.round(p.revenue)}
          </text>
        ))}

        {/* Tooltip vertical line */}
        {tooltip && (
          <>
            <line x1={tooltip.x} y1={pad.top} x2={tooltip.x} y2={pad.top + innerH}
              stroke="rgba(124,108,254,0.4)" strokeWidth={1} strokeDasharray="4,3" />
            <circle cx={tooltip.x} cy={tooltip.y} r={7}
              fill="#7c6cfe" opacity={0.25} />
            <circle cx={tooltip.x} cy={tooltip.y} r={4.5}
              fill="#7c6cfe" stroke="#fff" strokeWidth={1.5} />
          </>
        )}
      </svg>

      {/* Tooltip card */}
      {tooltip && (
        <div style={{
          position: "absolute",
          left: `${(tooltip.x / W) * 100}%`,
          top: `${((tooltip.y - 30) / H) * 100}%`,
          transform: "translateX(-50%)",
          background: "var(--bg-elevated)",
          border: "1px solid rgba(124,108,254,0.35)",
          borderRadius: 10,
          padding: "8px 14px",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          zIndex: 10,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#7c6cfe" }}>{tooltip.point.label} {tooltip.point.year}</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>
            ₹{tooltip.point.revenue.toLocaleString("en-IN")}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Animated Bar Chart (User Acquisition)
───────────────────────────────────────────────────────────────────── */
function BarChart({ data }: { data: DayPoint[] }) {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => { setTimeout(() => setDrawn(true), 400); }, []);

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const isPeak = (i: number) => data[i].count === maxCount && data[i].count > 0;

  return (
    <div style={{ height: 160, display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 12 }}>
      {data.map((d, i) => {
        const h = Math.max((d.count / maxCount) * 100, 3);
        const peak = isPeak(i);
        return (
          <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            {/* Count label */}
            <span style={{
              fontSize: 10, fontWeight: 700, color: peak ? "#22d3ee" : "var(--text-muted)",
              opacity: drawn ? 1 : 0, transition: `opacity 0.3s ease ${0.6 + i * 0.06}s`,
            }}>
              {d.count || ""}
            </span>
            <div style={{ width: "100%", borderRadius: "6px 6px 3px 3px", overflow: "hidden",
              height: 130, display: "flex", alignItems: "flex-end" }}>
              <div style={{
                width: "100%",
                height: drawn ? `${h}%` : "3%",
                borderRadius: "6px 6px 3px 3px",
                background: peak
                  ? "linear-gradient(180deg, #22d3ee, #22d3ee88)"
                  : "linear-gradient(180deg, rgba(124,108,254,0.5), rgba(124,108,254,0.15))",
                boxShadow: peak ? "0 0 20px rgba(34,211,238,0.4)" : "none",
                transition: `height 0.9s cubic-bezier(0.34,1.56,0.64,1) ${i * 80}ms`,
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Legend row
───────────────────────────────────────────────────────────────────── */
function Legend({ items }: { items: { label: string; color: string; value: string }[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 20px", marginTop: 16 }}>
      {items.map(it => (
        <div key={it.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: it.color, flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>
            {it.label}
          </span>
          <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 700 }}>
            {it.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Main exported component
───────────────────────────────────────────────────────────────────── */
export function DashboardCharts({
  chartData, dayData,
  totalUsers, activeSubs,
  totalRevenue, pendingRevenue, failedRevenue, mrrINR,
}: Props) {
  const freeUsers  = totalUsers - activeSubs;
  const paidRevenue = totalRevenue;

  // Animated KPI counters
  const cUsers   = useCounter(totalUsers,   0);
  const cSubs    = useCounter(activeSubs,   100);
  const cRevenue = useCounter(Math.round(totalRevenue), 200);
  const cMrr     = useCounter(Math.round(mrrINR), 300);

  // Day labels
  const dayLabels = dayData.map(d => d.label.slice(0, 2));

  return (
    <div>

      {/* ── Animated KPI counter row ──────────────────────────────── */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28,
      }} className="kpi-anim-grid">
        {[
          { label: "Total Users",    val: cUsers,   prefix: "",  suffix: "",  color: "#7c6cfe", icon: "group" },
          { label: "Pro Members",    val: cSubs,    prefix: "",  suffix: "",  color: "#22d3ee", icon: "workspace_premium" },
          { label: "Total Revenue",  val: cRevenue, prefix: "₹", suffix: "",  color: "#34d399", icon: "payments" },
          { label: "This Month",     val: cMrr,     prefix: "₹", suffix: "",  color: "#fbbf24", icon: "trending_up" },
        ].map((k) => (
          <div key={k.label} className="kpi-card" style={{ textAlign: "center", position: "relative", overflow: "hidden" }}>
            {/* animated glow pulse */}
            <div style={{
              position: "absolute", inset: 0, borderRadius: "inherit",
              background: `radial-gradient(circle at 50% 0%, ${k.color}12 0%, transparent 70%)`,
              animation: "pulse-glow 3s ease-in-out infinite",
            }} />
            <div className="kpi-icon-wrap" style={{ background: `${k.color}1a`, color: k.color, margin: "0 auto 10px" }}>
              <span className="material-symbols-outlined">{k.icon}</span>
            </div>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{ color: k.color }}>
              {k.prefix}{k.val.toLocaleString("en-IN")}{k.suffix}
            </div>
          </div>
        ))}
      </div>

      {/* ── Revenue Growth (animated line) ───────────────────────── */}
      <div className="chart-card" style={{ marginBottom: 20 }}>
        <div className="chart-card-header">
          <div>
            <div className="chart-title">Revenue Growth</div>
            <div className="chart-sub">Monthly confirmed revenue · hover for details</div>
          </div>
          <span className="chart-badge" style={{ background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }}>
            ₹{totalRevenue.toLocaleString("en-IN")} total
          </span>
        </div>
        <RevenueLineChart data={chartData} total={totalRevenue} />
      </div>

      {/* ── Two chart row ─────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }} className="charts-grid">

        {/* User split donut */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-title">User Breakdown</div>
              <div className="chart-sub">Free vs Pro members</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
            <DonutChart
              segments={[
                { value: activeSubs,  color: "#22d3ee", label: "Pro" },
                { value: freeUsers,   color: "#7c6cfe", label: "Free" },
              ]}
              centerLabel={`${totalUsers}`}
              centerSub="Total"
            />
            <Legend items={[
              { label: "Pro",  color: "#22d3ee", value: `${activeSubs}` },
              { label: "Free", color: "#7c6cfe", value: `${freeUsers}` },
            ]} />
          </div>
        </div>

        {/* Revenue split donut */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-title">Revenue Breakdown</div>
              <div className="chart-sub">Paid · Pending · Failed</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
            <DonutChart
              segments={[
                { value: paidRevenue,    color: "#34d399", label: "Paid" },
                { value: pendingRevenue, color: "#fbbf24", label: "Pending" },
                { value: failedRevenue,  color: "#f472b6", label: "Failed" },
              ]}
              centerLabel={`₹${Math.round((paidRevenue + pendingRevenue + failedRevenue) / 1000)}k`}
              centerSub="Potential"
            />
            <Legend items={[
              { label: "Paid",    color: "#34d399", value: `₹${Math.round(paidRevenue).toLocaleString("en-IN")}` },
              { label: "Pending", color: "#fbbf24", value: `₹${Math.round(pendingRevenue).toLocaleString("en-IN")}` },
              { label: "Failed",  color: "#f472b6", value: `₹${Math.round(failedRevenue).toLocaleString("en-IN")}` },
            ]} />
          </div>
        </div>
      </div>

      {/* ── User Acquisition animated bars ───────────────────────── */}
      <div className="chart-card" style={{ marginBottom: 20 }}>
        <div className="chart-card-header">
          <div>
            <div className="chart-title">User Acquisition</div>
            <div className="chart-sub">Signups by weekday · last 30 days</div>
          </div>
        </div>
        <BarChart data={dayData} />
        <div style={{ display: "flex", justifyContent: "space-between",
          fontSize: 9, fontWeight: 700, letterSpacing: "0.5px",
          color: "var(--text-muted)", textTransform: "uppercase" }}>
          {dayData.map(d => <span key={d.label}>{d.label.slice(0, 2)}</span>)}
        </div>
      </div>
    </div>
  );
}
