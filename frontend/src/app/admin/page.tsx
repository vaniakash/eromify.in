import { connectDB } from "@/lib/db";
import { User, IUser } from "@/models/User";
import { Payment, IPayment } from "@/models/Payment";
import { formatDistanceToNow } from "date-fns";
import { DashboardCharts } from "./DashboardCharts";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await connectDB();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // ── Core counts ────────────────────────────────────────────────────
  const totalUsers = await User.countDocuments();
  const activeSubs = await User.countDocuments({ isPro: true });
  const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: monthStart } });

  // ── Revenue by status ──────────────────────────────────────────────
  const revenueAgg = await Payment.aggregate([
    { $group: { _id: "$status", total: { $sum: "$amount" }, count: { $sum: 1 } } },
  ]);
  const byStatus: Record<string, { total: number; count: number }> = {};
  for (const r of revenueAgg) byStatus[r._id] = { total: r.total / 100, count: r.count };

  const totalRevenueINR = byStatus["paid"]?.total ?? 0;
  const pendingRevenue = byStatus["created"]?.total ?? 0;
  const failedRevenue = byStatus["failed"]?.total ?? 0;

  // ── MRR ────────────────────────────────────────────────────────────
  const mrrResult = await Payment.aggregate([
    { $match: { status: "paid", createdAt: { $gte: monthStart } } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const mrrINR = (mrrResult[0]?.total ?? 0) / 100;

  const conversionRate =
    totalUsers > 0 ? ((activeSubs / totalUsers) * 100).toFixed(2) : "0.00";

  // ── Monthly revenue chart (last 7 months) ──────────────────────────
  const months = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
    return {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      label: d.toLocaleString("default", { month: "short" }).toUpperCase(),
    };
  });

  const revenueByMonth: { _id: { year: number; month: number }; total: number }[] =
    await Payment.aggregate([
      { $match: { status: "paid", createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          total: { $sum: "$amount" },
        },
      },
    ]);

  const revenueMap = Object.fromEntries(
    revenueByMonth.map((r) => [`${r._id.year}-${r._id.month}`, r.total / 100])
  );
  const chartData = months.map((m) => ({
    ...m,
    revenue: revenueMap[`${m.year}-${m.month}`] ?? 0,
  }));

  // ── Weekday acquisition (last 30d) ─────────────────────────────────
  const signupsByDay: { _id: number; count: number }[] = await User.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    { $group: { _id: { $dayOfWeek: "$createdAt" }, count: { $sum: 1 } } },
  ]);
  const dayMap = Object.fromEntries(signupsByDay.map((d) => [d._id, d.count]));
  const weekdays = [
    { label: "MON", dow: 2 }, { label: "TUE", dow: 3 }, { label: "WED", dow: 4 },
    { label: "THU", dow: 5 }, { label: "FRI", dow: 6 }, { label: "SAT", dow: 7 },
    { label: "SUN", dow: 1 },
  ];
  const dayData = weekdays.map((w) => ({ ...w, count: dayMap[w.dow] ?? 0 }));

  // ── Recent data ────────────────────────────────────────────────────
  const recentUsers = (await User.find().sort({ createdAt: -1 }).limit(5).lean()) as IUser[];
  const recentPayments = (await Payment.find().sort({ createdAt: -1 }).limit(5).lean()) as IPayment[];

  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-eyebrow">Executive Overview</div>
        <h1 className="shimmer-text">Platform Dashboard</h1>
        <p>Real-time metrics · live from the database</p>
      </div>

      {/* ── All animated charts (client component) ───────────────── */}
      <DashboardCharts
        chartData={chartData}
        dayData={dayData}
        totalUsers={totalUsers}
        activeSubs={activeSubs}
        totalRevenue={totalRevenueINR}
        pendingRevenue={pendingRevenue}
        failedRevenue={failedRevenue}
        mrrINR={mrrINR}
      />

      {/* ── Recent tables (server-rendered) ─────────────────────── */}
      <div className="tables-grid">
        {/* Recent Signups */}
        <div className="table-card">
          <div className="table-card-header">
            <span className="table-card-title">Recent Signups</span>
            <a href="/admin/users" className="view-all-link">View all →</a>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Plan</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.length > 0 ? (
                recentUsers.map((user, i) => (
                  <tr key={i}>
                    <td>
                      <div className="user-cell">
                        <img
                          className="user-avatar"
                          alt={user.name || "User"}
                          src={
                            user.image ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              user.name || user.email || "U"
                            )}&background=7c6cfe&color=fff&bold=true`
                          }
                        />
                        <div>
                          <div className="user-name">{user.name || "Unknown"}</div>
                          <div className="user-email">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {user.isPro ? (
                        <span className="badge badge-pro">⚡ Pro</span>
                      ) : (
                        <span className="badge badge-free">Free</span>
                      )}
                    </td>
                    <td style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {user.createdAt
                        ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })
                        : "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)" }}>
                    No users yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Recent Transactions */}
        <div className="table-card">
          <div className="table-card-header">
            <span className="table-card-title">Recent Transactions</span>
            <a href="/admin/payments" className="view-all-link">View all →</a>
          </div>
          <div>
            {recentPayments.length > 0 ? (
              recentPayments.map((p, i) => (
                <div className="txn-row" key={i}>
                  <div
                    className="txn-icon"
                    style={{
                      color: p.status === "paid" ? "#34d399" : p.status === "failed" ? "#f472b6" : "#fbbf24",
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                      {p.status === "paid" ? "check_circle" : p.status === "failed" ? "cancel" : "pending"}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                      {p.plan === "pro" ? "Pro Subscription" : "Payment"}
                    </div>
                    <div className="txn-time">
                      <span
                        className="badge"
                        style={{
                          fontSize: 9, padding: "1px 6px",
                          ...(p.status === "paid"
                            ? { background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }
                            : p.status === "failed"
                              ? { background: "rgba(244,114,182,0.1)", color: "#f472b6", border: "1px solid rgba(244,114,182,0.2)" }
                              : { background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }),
                        }}
                      >
                        {p.status}
                      </span>
                      {" · "}{p.userEmail || String(p.userId).slice(-8)}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="txn-amount">₹{(p.amount / 100).toLocaleString("en-IN")}</div>
                    <div className="txn-time">
                      {p.createdAt && formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: "32px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                No transactions yet
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
