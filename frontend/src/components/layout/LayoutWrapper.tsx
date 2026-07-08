"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar/Navbar";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { HelpFAB } from "@/components/ui/HelpFAB";
import { X } from "lucide-react";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showPromoBanner, setShowPromoBanner] = useState(true);
  
  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Global Promo Banner ── */}
      {showPromoBanner && (
        <div className="bg-[#18181b] flex items-center justify-center py-2 px-4 relative w-full z-[100] border-b border-white/5">
          <p className="text-xs text-slate-300 font-medium text-center pr-6">
            <strong className="text-white">Seedance 2.0 Available Now.</strong> Special 73% OFF
          </p>
          <button
            onClick={() => setShowPromoBanner(false)}
            className="absolute right-4 text-slate-500 hover:text-white transition-colors p-1"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <HelpFAB />
    </div>
  );
}
