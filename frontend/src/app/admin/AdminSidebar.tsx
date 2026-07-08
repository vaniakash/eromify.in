"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { section: "Overview", items: [
    { href: "/admin", icon: "grid_view", label: "Dashboard", exact: true },
    { href: "/admin/analytics", icon: "bar_chart_4_bars", label: "Analytics" },
  ]},
  { section: "Management", items: [
    { href: "/admin/users", icon: "group", label: "Users" },
    { href: "/admin/subscriptions", icon: "workspace_premium", label: "Subscriptions" },
    { href: "/admin/payments", icon: "payments", label: "Payments" },
    { href: "/admin/messages", icon: "inbox", label: "Messages" },
  ]},
  { section: "System", items: [
    { href: "/admin/settings", icon: "settings", label: "Settings" },
  ]},
];

const ICON_COLORS: Record<string, string> = {
  "/admin":              "#7c6cfe",
  "/admin/analytics":    "#22d3ee",
  "/admin/users":        "#f472b6",
  "/admin/subscriptions":"#fbbf24",
  "/admin/payments":     "#34d399",
  "/admin/messages":     "#7c6cfe",
  "/admin/settings":     "#34d399",
};

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-badge">
          <div className="sidebar-logo-icon">⚡</div>
          <span className="sidebar-logo-text">Eromify</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV.map((section) => (
          <div key={section.section}>
            <div className="sidebar-section-label">{section.section}</div>
            {section.items.map((link) => {
              const isActive = link.exact
                ? pathname === link.href
                : pathname.startsWith(link.href);
              const color = ICON_COLORS[link.href] ?? "#7c6cfe";
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`sidebar-link${isActive ? " active" : ""}`}
                >
                  <div
                    className="sidebar-link-icon"
                    style={isActive ? { background: `${color}1a`, color } : { color: "var(--text-muted)" }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                      {link.icon}
                    </span>
                  </div>
                  <span>{link.label}</span>
                  {isActive && (
                    <span
                      style={{
                        marginLeft: "auto",
                        width: 6, height: 6,
                        borderRadius: "50%",
                        background: color,
                        boxShadow: `0 0 8px ${color}`,
                        flexShrink: 0,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="sidebar-user">
        <img
          alt="Admin"
          className="sidebar-avatar"
          src="https://ui-avatars.com/api/?name=Akash+Rana&background=7c6cfe&color=fff&bold=true&size=72"
        />
        <div>
          <div className="sidebar-user-name">Akash Rana</div>
          <div className="sidebar-user-role">Super Admin</div>
        </div>
        <span className="material-symbols-outlined" style={{ marginLeft: "auto", fontSize: 16, color: "var(--text-muted)", cursor: "pointer" }}>
          more_horiz
        </span>
      </div>
    </>
  );
}
