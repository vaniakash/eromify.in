import { logoutAdmin } from "./actions";

export function AdminHeader() {
  return (
    <header className="admin-header">
      {/* Left: Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: "-0.5px",
            background: "linear-gradient(135deg, var(--text-primary), var(--accent-violet))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            CONSOLE
          </span>
        </div>
      </div>

      {/* Right: logout only */}
      <div className="header-actions">
        <form action={logoutAdmin} style={{ margin: 0 }}>
          <button type="submit" className="header-btn" title="Logout">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>logout</span>
          </button>
        </form>
      </div>
    </header>
  );
}
