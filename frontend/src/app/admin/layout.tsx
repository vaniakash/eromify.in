import React from "react";
import "./admin.css";
import { AdminShell } from "./AdminShell";

export const metadata = {
  title: "Eromify · Admin Dashboard",
  description: "Eromify platform analytics and administration console.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#030712", color: "#e8eeff", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Material Icons */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        rel="stylesheet"
      />
      {/* Inter font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />
      <style>{`
        body { background: #030712 !important; margin: 0; }
        * { box-sizing: border-box; }
      `}</style>
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
