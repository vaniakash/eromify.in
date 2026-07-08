import { connectDB } from "@/lib/db";
import { Payment, IPayment } from "@/models/Payment";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  await connectDB();

  const payments = (await Payment.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .lean()) as IPayment[];

  // ── Revenue numbers ────────────────────────────────────────────────
  const revenueAgg = await Payment.aggregate([
    {
      $group: {
        _id: "$status",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  const byStatus: Record<string, { total: number; count: number }> = {};
  for (const r of revenueAgg) byStatus[r._id] = { total: r.total / 100, count: r.count };

  const paidRevenue    = byStatus["paid"]?.total    ?? 0;
  const pendingRevenue = byStatus["created"]?.total ?? 0;
  const failedRevenue  = byStatus["failed"]?.total  ?? 0;
  const potentialRevenue = paidRevenue + pendingRevenue;   // if all pending converted
  const totalPaid    = byStatus["paid"]?.count    ?? 0;
  const totalPending = byStatus["created"]?.count ?? 0;
  const totalFailed  = byStatus["failed"]?.count  ?? 0;
  const totalAll     = totalPaid + totalPending + totalFailed;

  const conversionPct = totalAll > 0 ? ((totalPaid / totalAll) * 100).toFixed(1) : "0.0";
  const potentialGain = pendingRevenue;
  const potentialPct  = potentialRevenue > 0 ? Math.round((paidRevenue / potentialRevenue) * 100) : 100;

  const statusConfig: Record<string, { color: string; bg: string; border: string; icon: string }> = {
    paid:    { color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.2)",  icon: "check_circle" },
    failed:  { color: "#f472b6", bg: "rgba(244,114,182,0.1)", border: "rgba(244,114,182,0.2)", icon: "cancel" },
    created: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.2)",  icon: "pending" },
  };

  return (
    <>
      <div className="page-header">
        <div className="page-header-eyebrow">Finance</div>
        <h1 className="shimmer-text">Transactions</h1>
        <p>All payment records · {totalAll} total</p>
      </div>

      {/* ── Top KPI row ── */}
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        {[
          {
            label: "Confirmed Revenue",
            value: `₹${paidRevenue.toLocaleString("en-IN")}`,
            footer: `${totalPaid} paid transactions`,
            color: "#34d399",
            icon: "check_circle",
          },
          {
            label: "Potential Revenue",
            value: `₹${potentialRevenue.toLocaleString("en-IN")}`,
            footer: `If all ${totalPending} pending also paid`,
            color: "#7c6cfe",
            icon: "auto_graph",
          },
          {
            label: "Unrealised (Pending)",
            value: `₹${pendingRevenue.toLocaleString("en-IN")}`,
            footer: `${totalPending} orders not yet paid`,
            color: "#fbbf24",
            icon: "pending",
          },
          {
            label: "Lost Revenue (Failed)",
            value: `₹${failedRevenue.toLocaleString("en-IN")}`,
            footer: `${totalFailed} failed transactions`,
            color: "#f472b6",
            icon: "cancel",
          },
        ].map((k) => (
          <div className="kpi-card" key={k.label} style={{ padding: "20px 24px" }}>
            <div className="kpi-icon-wrap" style={{ background: `${k.color}1a`, color: k.color }}>
              <span className="material-symbols-outlined">{k.icon}</span>
            </div>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-footer" style={{ marginTop: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>info</span>
              {k.footer}
            </div>
          </div>
        ))}
      </div>

      {/* ── Potential Revenue Insight Banner ── */}
      <div className="revenue-insight-banner" style={{
        background: "linear-gradient(135deg, rgba(124,108,254,0.08) 0%, rgba(34,211,238,0.06) 100%)",
        border: "1px solid rgba(124,108,254,0.2)",
        borderRadius: 16,
        padding: "24px 28px",
        marginBottom: 24,
        display: "flex",
        alignItems: "center",
        gap: 28,
        flexWrap: "wrap",
      }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#7c6cfe", marginBottom: 6 }}>
            💡 Revenue Potential Analysis
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
            You've captured <span style={{ color: "#34d399" }}>{conversionPct}%</span> of potential revenue
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
            {totalPending > 0
              ? `${totalPending} pending order${totalPending !== 1 ? "s" : ""} worth ₹${pendingRevenue.toLocaleString("en-IN")} could still convert. If they all pay, your total would reach ₹${potentialRevenue.toLocaleString("en-IN")}.`
              : "All initiated orders have been resolved. No pending revenue left on the table!"}
          </div>
        </div>

        {/* Progress bar visualization */}
        <div style={{ minWidth: 260, flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11, fontWeight: 700 }}>
            <span style={{ color: "#34d399" }}>Confirmed  ₹{paidRevenue.toLocaleString("en-IN")}</span>
            <span style={{ color: "#7c6cfe" }}>Potential  ₹{potentialRevenue.toLocaleString("en-IN")}</span>
          </div>
          {/* Stacked bar */}
          <div style={{ height: 12, borderRadius: 8, background: "var(--bg-deep)", overflow: "hidden", position: "relative" }}>
            {/* Paid portion */}
            <div style={{
              position: "absolute", left: 0, top: 0, bottom: 0,
              width: `${potentialPct}%`,
              background: "linear-gradient(90deg, #34d399, #22d3ee)",
              borderRadius: 8,
              boxShadow: "0 0 10px rgba(52,211,153,0.4)",
              transition: "width 0.5s ease",
            }} />
            {/* Pending portion (shown after paid) */}
            {pendingRevenue > 0 && (
              <div style={{
                position: "absolute", left: `${potentialPct}%`, top: 0, bottom: 0,
                right: 0,
                background: "rgba(251,191,36,0.3)",
                borderRadius: "0 8px 8px 0",
              }} />
            )}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 11 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-muted)" }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: "#34d399", display: "inline-block" }} />
              Paid ({totalPaid})
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-muted)" }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: "rgba(251,191,36,0.6)", display: "inline-block" }} />
              Pending ({totalPending})
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-muted)" }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: "#f472b6", display: "inline-block" }} />
              Failed ({totalFailed})
            </span>
          </div>
        </div>
      </div>

      {/* ── Paid payments table ── */}
      <div className="table-card" style={{ marginBottom: 24 }}>
        <div className="table-card-header">
          <span className="table-card-title">Successful Transactions</span>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{payments.filter(p => p.status === 'paid').length} records</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Plan</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment ID</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.filter(p => p.status === 'paid').length > 0 ? (
              payments.filter(p => p.status === 'paid').map((p, i) => {
                const s = statusConfig[p.status] ?? statusConfig.created;
                return (
                  <tr key={i}>
                    <td style={{ fontSize: 12, color: "var(--text-secondary)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.userEmail || (p.userId ? String(p.userId).slice(-10) : "—")}
                    </td>
                    <td>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "rgba(124,108,254,0.12)", color: "#7c6cfe", border: "1px solid rgba(124,108,254,0.2)", textTransform: "uppercase" }}>
                        {p.plan || "pro"}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: 14 }}>
                      ₹{(p.amount / 100).toLocaleString("en-IN")}
                    </td>
                    <td>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: s.bg, color: s.color, border: `1px solid ${s.border}`, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 11 }}>{s.icon}</span>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "monospace" }}>
                      {p.razorpayPaymentId || p.razorpayOrderId?.slice(-12) || "—"}
                    </td>
                    <td style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {p.createdAt ? formatDistanceToNow(new Date(p.createdAt), { addSuffix: true }) : "N/A"}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                  No successful transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pending payments table ── */}
      <div className="table-card">
        <div className="table-card-header">
          <span className="table-card-title">Pending / Incomplete Transactions</span>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{payments.filter(p => p.status !== 'paid').length} records</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Plan</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment ID</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.filter(p => p.status !== 'paid').length > 0 ? (
              payments.filter(p => p.status !== 'paid').map((p, i) => {
                const s = statusConfig[p.status] ?? statusConfig.created;
                return (
                  <tr key={i}>
                    <td style={{ fontSize: 12, color: "var(--text-secondary)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.userEmail || (p.userId ? String(p.userId).slice(-10) : "—")}
                    </td>
                    <td>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "rgba(124,108,254,0.12)", color: "#7c6cfe", border: "1px solid rgba(124,108,254,0.2)", textTransform: "uppercase" }}>
                        {p.plan || "pro"}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: 14 }}>
                      ₹{(p.amount / 100).toLocaleString("en-IN")}
                    </td>
                    <td>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: s.bg, color: s.color, border: `1px solid ${s.border}`, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 11 }}>{s.icon}</span>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "monospace" }}>
                      {p.razorpayPaymentId || p.razorpayOrderId?.slice(-12) || "—"}
                    </td>
                    <td style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {p.createdAt ? formatDistanceToNow(new Date(p.createdAt), { addSuffix: true }) : "N/A"}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                  No pending transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
