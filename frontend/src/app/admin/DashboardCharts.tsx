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
   Interactive Spider Web (Radar) Chart (User Acquisition)
───────────────────────────────────────────────────────────────────── */
function RadarChart({ data }: { data: DayPoint[] }) {
  const [drawn, setDrawn] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => { setTimeout(() => setDrawn(true), 300); }, []);

  const W = 400, H = 260;
  const cx = W / 2;
  const cy = H / 2;
  const maxRadius = Math.min(cx, cy) - 35;
  const maxCount = Math.max(...data.map(d => d.count), 4);
  const numLevels = 5;
  const numPoints = data.length;

  const getPoint = (val: number, index: number, overrideMax?: number) => {
    const angle = (index * 2 * Math.PI) / numPoints - Math.PI / 2;
    const r = (val / maxCount) * (overrideMax ?? maxRadius);
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const gridPolygons = Array.from({ length: numLevels }).map((_, i) => {
    const ratio = (i + 1) / numLevels;
    return data.map((_, j) => {
      const p = getPoint(maxCount, j, ratio * maxRadius);
      return `${p.x},${p.y}`;
    }).join(" ");
  });

  const dataPath = data.map((d, i) => {
    const p = getPoint(d.count, i);
    return `${i === 0 ? "M" : "L"}${p.x},${p.y}`;
  }).join(" ") + " Z";

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const vx = (mx / rect.width) * W;
    const vy = (my / rect.height) * H;
    
    const dx = vx - cx;
    const dy = vy - cy;
    let angle = Math.atan2(dy, dx) + Math.PI / 2;
    if (angle < 0) angle += 2 * Math.PI;

    const slice = (2 * Math.PI) / numPoints;
    let idx = Math.round(angle / slice);
    if (idx === numPoints) idx = 0;
    
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= maxRadius + 40) {
      setHoverIdx(idx);
    } else {
      setHoverIdx(null);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: H, display: "flex", justifyContent: "center", marginBottom: 12 }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "100%", overflow: "visible", cursor: "crosshair" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <radialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#7c6cfe" stopOpacity={0.1} />
          </radialGradient>
          <filter id="radarglow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <clipPath id="radar-clip">
            <circle cx={cx} cy={cy} r={drawn ? maxRadius + 20 : 0} style={{ transition: "r 1.2s cubic-bezier(0.34,1.56,0.64,1)" }} />
          </clipPath>
        </defs>

        {/* Concentric grid lines (Web) */}
        {gridPolygons.map((pts, i) => (
          <polygon key={`grid-${i}`} points={pts} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
        ))}

        {/* Axes lines (Spokes) */}
        {data.map((_, i) => {
          const p = getPoint(maxCount, i);
          const isHovered = hoverIdx === i;
          return (
            <line key={`axis-${i}`} x1={cx} y1={cy} x2={p.x} y2={p.y} 
              stroke={isHovered ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.06)"} 
              strokeWidth={isHovered ? 2 : 1}
              style={{ transition: "all 0.3s ease" }}
            />
          );
        })}

        {/* Data Polygon */}
        <g clipPath="url(#radar-clip)">
          <path 
            d={dataPath} 
            fill="url(#radarGrad)" 
            stroke="#22d3ee" 
            strokeWidth={2.5} 
            filter="url(#radarglow)" 
            strokeLinejoin="round" 
          />
          
          {/* Data Points */}
          {data.map((d, i) => {
            const p = getPoint(d.count, i);
            const isHovered = hoverIdx === i;
            return (
              <g key={`pt-${i}`}>
                <circle cx={p.x} cy={p.y} r={isHovered ? 6 : 3.5} fill="var(--bg-elevated)" stroke="#22d3ee" strokeWidth={2}
                  style={{ transition: "all 0.3s ease" }}
                  filter={isHovered ? "url(#radarglow)" : "none"}
                />
              </g>
            );
          })}
        </g>

        {/* Axes Labels */}
        {data.map((d, i) => {
          const p = getPoint(maxCount, i, maxRadius + 18);
          const isHovered = hoverIdx === i;
          let anchor: "start" | "middle" | "end" = "middle";
          if (p.x > cx + 10) anchor = "start";
          else if (p.x < cx - 10) anchor = "end";

          return (
            <text key={`label-${i}`} x={p.x} y={p.y + (p.y > cy ? 5 : -1)} textAnchor={anchor}
              fontSize={11} fontWeight={isHovered ? 800 : 600} 
              fill={isHovered ? "#22d3ee" : "rgba(139,149,184,0.6)"}
              style={{ transition: "all 0.2s ease", textTransform: "uppercase" }}
            >
              {d.label.slice(0, 2)}
            </text>
          );
        })}
      </svg>

      {/* Interactive Tooltip */}
      {hoverIdx !== null && (
        <div style={{
          position: "absolute",
          left: `${(getPoint(data[hoverIdx].count, hoverIdx).x / W) * 100}%`,
          top: `${(getPoint(data[hoverIdx].count, hoverIdx).y / H) * 100}%`,
          transform: "translate(-50%, -100%)",
          marginTop: "-12px",
          background: "var(--bg-elevated)",
          border: "1px solid rgba(34,211,238,0.35)",
          borderRadius: 8,
          padding: "6px 12px",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          zIndex: 10,
          opacity: drawn ? 1 : 0,
          transition: "opacity 0.2s ease"
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(139,149,184,0.8)" }}>
            {data[hoverIdx].label}
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#22d3ee", display: "flex", alignItems: "baseline", gap: 4 }}>
            {data[hoverIdx].count}
            <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>signups</span>
          </div>
        </div>
      )}
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
   Liquid Glass KPI Card (Apple WWDC 2025 Style)
───────────────────────────────────────────────────────────────────── */
function LiquidKpiCard({ 
  label, val, prefix, suffix, color, icon, sparklinePath, index 
}: { 
  label: string; val: number; prefix: string; suffix: string; color: string; icon: string; sparklinePath: string; index: number;
}) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setTimeout(() => setDrawn(true), 200 + index * 100); }, [index]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "20px",
        padding: "16px",
        cursor: "default",
        transform: isHovered ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
        transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease, background 0.4s ease",
        background: isHovered ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.02)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderTop: "1px solid rgba(255, 255, 255, 0.25)",
        boxShadow: isHovered 
          ? `0 20px 40px -12px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.3), 0 0 24px ${color}33`
          : `0 10px 20px -8px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.15)`,
      }}
    >
      {/* Specular Highlight tracking mouse */}
      <div 
        style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.15) 0%, transparent 60%)`,
          opacity: isHovered ? 1 : 0,
          transition: "opacity 0.3s ease",
          pointerEvents: "none",
          mixBlendMode: "overlay",
        }}
      />
      {/* Iridescent Base Gradient */}
      <div 
        style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(135deg, ${color}1A 0%, transparent 50%, rgba(255,255,255,0.03) 100%)`,
          pointerEvents: "none"
        }}
      />
      
      {/* Content */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div style={{ 
            width: 38, height: 38, 
            borderRadius: "12px", 
            background: `linear-gradient(135deg, ${color}33 0%, ${color}11 100%)`,
            border: `1px solid ${color}44`,
            borderTop: `1px solid ${color}88`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 8px 16px ${color}22, inset 0 2px 4px rgba(255,255,255,0.2)`,
            transform: isHovered ? "scale(1.05)" : "scale(1)",
            transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)"
          }}>
            <span className="material-symbols-outlined" style={{ 
              color: color, fontSize: 20, filter: `drop-shadow(0 0 8px ${color})` 
            }}>
              {icon}
            </span>
          </div>
          
          {/* Animated Sparkline */}
          <div style={{ width: 60, height: 26, marginTop: 4 }}>
             <svg width="100%" height="100%" viewBox="0 0 70 35" style={{ overflow: 'visible' }}>
               <defs>
                 <linearGradient id={`grad-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                   <stop offset="0%" stopColor={color} stopOpacity={0.6} />
                   <stop offset="100%" stopColor={color} stopOpacity={0} />
                 </linearGradient>
               </defs>
               <path 
                 d={`${sparklinePath} L70,35 L0,35 Z`} 
                 fill={`url(#grad-${index})`}
                 style={{ opacity: drawn ? 1 : 0, transition: "opacity 1.5s ease 0.3s" }} 
               />
               <path 
                 d={sparklinePath} 
                 fill="none" 
                 stroke={color} 
                 strokeWidth={2.5} 
                 strokeLinecap="round" 
                 strokeLinejoin="round" 
                 style={{ 
                   filter: `drop-shadow(0 4px 6px ${color}66)`,
                   strokeDasharray: 120,
                   strokeDashoffset: drawn ? 0 : 120,
                   transition: "stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)"
                 }} 
               />
               <circle 
                 cx="70" cy={sparklinePath.split(',').pop()?.split(' ')[0] || 10} r={4} 
                 fill="#fff" stroke={color} strokeWidth={2}
                 style={{ 
                   opacity: drawn ? 1 : 0, 
                   filter: `drop-shadow(0 0 6px ${color})`,
                   transform: drawn ? "scale(1)" : "scale(0)",
                   transformOrigin: `70px ${sparklinePath.split(',').pop()?.split(' ')[0] || 10}px`,
                   transition: "all 0.5s cubic-bezier(0.34,1.56,0.64,1) 1.2s" 
                 }} 
               />
             </svg>
          </div>
        </div>
        
        <div style={{ 
          fontSize: 26, fontWeight: 800, color: "#fff", 
          letterSpacing: "-1px", 
          lineHeight: 1,
          textShadow: "0 6px 12px rgba(0,0,0,0.3)",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}>
          {prefix}{val.toLocaleString("en-IN")}{suffix}
        </div>
      </div>
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

  const sparklines = [
    "M 0,25 C 20,25 30,10 70,5",
    "M 0,20 C 15,5 40,25 70,10",
    "M 0,15 C 25,30 35,5 70,0",
    "M 0,30 C 20,10 50,20 70,10",
  ];

  return (
    <div>

      {/* ── Liquid Glass KPI Cards ──────────────────────────────── */}
      <div 
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8"
        style={{ perspective: "1000px" }}
      >
        {[
          { label: "Total Users",    val: cUsers,   prefix: "",  suffix: "",  color: "#7c6cfe", icon: "group",             sparkline: sparklines[0] },
          { label: "Pro Members",    val: cSubs,    prefix: "",  suffix: "",  color: "#22d3ee", icon: "workspace_premium", sparkline: sparklines[1] },
          { label: "Total Revenue",  val: cRevenue, prefix: "₹", suffix: "",  color: "#34d399", icon: "payments",          sparkline: sparklines[2] },
          { label: "This Month",     val: cMrr,     prefix: "₹", suffix: "",  color: "#fbbf24", icon: "trending_up",       sparkline: sparklines[3] },
        ].map((k, i) => (
          <LiquidKpiCard 
            key={k.label} 
            index={i}
            label={k.label} 
            val={k.val} 
            prefix={k.prefix} 
            suffix={k.suffix} 
            color={k.color} 
            icon={k.icon} 
            sparklinePath={k.sparkline}
          />
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

      {/* ── User Acquisition (Radar Chart) ───────────────────────── */}
      <div className="chart-card" style={{ marginBottom: 20 }}>
        <div className="chart-card-header">
          <div>
            <div className="chart-title">User Acquisition</div>
            <div className="chart-sub">Signups by weekday · last 30 days</div>
          </div>
        </div>
        <RadarChart data={dayData} />
      </div>
    </div>
  );
}
