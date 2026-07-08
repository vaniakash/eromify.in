import { loginAdmin } from "../actions";
import { Mail, Lock, ArrowRight, Shield } from "lucide-react";

export default function AdminLogin() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#060e20",
      padding: "24px",
      boxSizing: "border-box",
    }}>
      {/* Glows */}
      <div style={{
        position: "fixed", top: "-10%", left: "-10%",
        width: "380px", height: "380px", borderRadius: "50%",
        background: "rgba(147,150,255,0.10)", filter: "blur(120px)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", bottom: "-10%", right: "-10%",
        width: "380px", height: "380px", borderRadius: "50%",
        background: "rgba(83,221,252,0.10)", filter: "blur(120px)",
        pointerEvents: "none",
      }} />

      {/* Card */}
      <div style={{
        position: "relative",
        zIndex: 10,
        width: "100%",
        maxWidth: "420px",
        background: "rgba(25,37,64,0.85)",
        border: "1px solid rgba(64,72,93,0.35)",
        borderRadius: "20px",
        padding: "40px 36px",
        boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
        backdropFilter: "blur(12px)",
        boxSizing: "border-box",
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: "52px", height: "52px", borderRadius: "14px",
            background: "rgba(163,166,255,0.10)",
            border: "1px solid rgba(163,166,255,0.20)",
            marginBottom: "16px",
          }}>
            <Shield size={24} color="#a3a6ff" />
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#dee5ff", margin: "0 0 6px", letterSpacing: "-0.3px" }}>
            Eromify Admin
          </h1>
          <p style={{ fontSize: "14px", color: "#a3aac4", margin: 0 }}>
            Sign in to access the control panel
          </p>
        </div>

        {/* Form */}
        <form action={loginAdmin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Email */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label htmlFor="email" style={{ fontSize: "11px", fontWeight: 600, color: "#a3aac4", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Email Address
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <span style={{ position: "absolute", left: "12px", display: "flex", alignItems: "center", color: "#a3aac4", pointerEvents: "none" }}>
                <Mail size={16} />
              </span>
              <input
                autoComplete="email"
                id="email"
                name="email"
                type="email"
                required
                placeholder="admin@eromify.com"
                style={{
                  width: "100%",
                  background: "rgba(0,0,0,0.40)",
                  border: "1px solid rgba(64,72,93,0.45)",
                  borderRadius: "12px",
                  padding: "12px 16px 12px 40px",
                  color: "#dee5ff",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label htmlFor="password" style={{ fontSize: "11px", fontWeight: 600, color: "#a3aac4", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Security Key
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <span style={{ position: "absolute", left: "12px", display: "flex", alignItems: "center", color: "#a3aac4", pointerEvents: "none" }}>
                <Lock size={16} />
              </span>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                style={{
                  width: "100%",
                  background: "rgba(0,0,0,0.40)",
                  border: "1px solid rgba(64,72,93,0.45)",
                  borderRadius: "12px",
                  padding: "12px 16px 12px 40px",
                  color: "#dee5ff",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              width: "100%",
              background: "#a3a6ff",
              color: "#0a0066",
              fontSize: "15px",
              fontWeight: 700,
              padding: "14px",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              marginTop: "4px",
            }}
          >
            Authenticate
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
