"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { AdminDock } from "./AdminDock";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <>
      {/* Sidebar — hidden on mobile via CSS */}
      <div className="admin-sidebar">
        <AdminSidebar />
      </div>

      {/* Header */}
      <AdminHeader />

      <main className="admin-main">
        {children}
      </main>

      {/* Mobile Dock - hidden on desktop via CSS */}
      <AdminDock />
    </>
  );
}
