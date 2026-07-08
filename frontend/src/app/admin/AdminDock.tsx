"use client";

import { usePathname, useRouter } from "next/navigation";
import Dock from "@/components/ui/Dock";

export function AdminDock() {
  const pathname = usePathname();
  const router = useRouter();

  const handleNav = (href: string) => {
    router.push(href);
  };

  const dockItems = [
    {
      label: "Dashboard",
      icon: (
        <span className="material-symbols-outlined" style={{ color: pathname === "/admin" ? "#7c6cfe" : "var(--text-muted)", fontSize: 24 }}>
          grid_view
        </span>
      ),
      onClick: () => handleNav("/admin"),
    },
    {
      label: "Analytics",
      icon: (
        <span className="material-symbols-outlined" style={{ color: pathname.startsWith("/admin/analytics") ? "#22d3ee" : "var(--text-muted)", fontSize: 24 }}>
          bar_chart_4_bars
        </span>
      ),
      onClick: () => handleNav("/admin/analytics"),
    },
    {
      label: "Users",
      icon: (
        <span className="material-symbols-outlined" style={{ color: pathname.startsWith("/admin/users") ? "#f472b6" : "var(--text-muted)", fontSize: 24 }}>
          group
        </span>
      ),
      onClick: () => handleNav("/admin/users"),
    },
    {
      label: "Subscriptions",
      icon: (
        <span className="material-symbols-outlined" style={{ color: pathname.startsWith("/admin/subscriptions") ? "#fbbf24" : "var(--text-muted)", fontSize: 24 }}>
          workspace_premium
        </span>
      ),
      onClick: () => handleNav("/admin/subscriptions"),
    },
    {
      label: "Payments",
      icon: (
        <span className="material-symbols-outlined" style={{ color: pathname.startsWith("/admin/payments") ? "#34d399" : "var(--text-muted)", fontSize: 24 }}>
          payments
        </span>
      ),
      onClick: () => handleNav("/admin/payments"),
    },
    {
      label: "Messages",
      icon: (
        <span className="material-symbols-outlined" style={{ color: pathname.startsWith("/admin/messages") ? "#7c6cfe" : "var(--text-muted)", fontSize: 24 }}>
          inbox
        </span>
      ),
      onClick: () => handleNav("/admin/messages"),
    },
    {
      label: "Settings",
      icon: (
        <span className="material-symbols-outlined" style={{ color: pathname.startsWith("/admin/settings") ? "#34d399" : "var(--text-muted)", fontSize: 24 }}>
          settings
        </span>
      ),
      onClick: () => handleNav("/admin/settings"),
    },
  ];

  return (
    <div className="admin-mobile-dock">
      <Dock 
        items={dockItems} 
        panelHeight={60} 
        baseItemSize={40} 
        magnification={60} 
        distance={100}
      />
    </div>
  );
}
