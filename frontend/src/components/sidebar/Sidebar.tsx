"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ImageIcon,
  Code2,
  Type,
  Search,
  Crown,
  Lightbulb,
  Compass,
  Wand2,
  Wrench,
  Clapperboard,
  Users,
  LayoutTemplate,
  DollarSign,
  Video,
  ArrowUpToLine,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    active: true,
  },
  {
    label: "Creator",
    href: "/tools/creator",
    icon: FileText,
    active: true,
    goldenTheme: true,
  },



  {
    label: "AI Influencer",
    href: "/ai-influencer-studio",
    icon: Compass,
    active: true,
  },
  {
    label: "Avatar",
    href: "/avatar",
    icon: Users,
    active: true,
  },
  {
    label: "Templates",
    href: "/avatar/templates",
    icon: LayoutTemplate,
    active: true,
    isNew: true,
  },
  {
    label: "Gallery",
    href: "/galary",
    icon: Clapperboard,
    active: true,
  },
  {
    label: "Pricing",
    href: "/pricing",
    icon: DollarSign,
    active: true,
  },
];

interface SidebarProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

export function Sidebar({ mobile = false, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useSession();
  const [isUserPro, setIsUserPro] = useState(false);

  useEffect(() => {
    const checkPro = () => {
      const pro = localStorage.getItem("eromify_pro");
      setIsUserPro(pro === "true");
    };

    // Initial check
    if (status === "unauthenticated") {
      setIsUserPro(false);
    } else {
      checkPro();
    }

    window.addEventListener("eromify_pro_updated", checkPro);
    return () => window.removeEventListener("eromify_pro_updated", checkPro);
  }, [status]);

  const content = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 p-4">
      {mobile && (
        <div className="flex items-center gap-2 px-2 py-3 mb-4">
          <span className="text-lg font-bold text-slate-900">Eromify</span>
        </div>
      )}

      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3">
        Navigation
      </p>

      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const isDisabled = !item.active;

          if (isDisabled) {
            return (
              <div
                key={item.href}
                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg opacity-50 cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-400">
                    {item.label}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                  Soon
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium",
                (item as any).goldenTheme
                  ? (isActive ? "bg-gradient-to-r from-amber-100 to-yellow-50 text-amber-700 font-bold border border-amber-300 shadow-sm" : "bg-gradient-to-r from-amber-50/50 to-yellow-50/50 text-amber-600 hover:from-amber-100 hover:to-yellow-50 border border-amber-200/50 hover:text-amber-700")
                  : (isActive
                    ? "bg-[#1736cf]/10 text-[#1736cf]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900")
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4",
                  (item as any).goldenTheme
                    ? (isActive ? "text-amber-600" : "text-amber-500")
                    : (isActive ? "text-[#1736cf]" : "text-slate-400")
                )}
              />
              <span className="flex-1">{item.label}</span>
              {(item as any).isNew && (
                <span
                  className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide animate-pulse shrink-0"
                  style={{
                    background: "rgba(16,185,129,0.15)",
                    color: "#10b981",
                    border: "1px solid rgba(16,185,129,0.4)",
                  }}
                >
                  New
                </span>
              )}
            </Link>
          );
        })}

        {/* ── Tools section ── */}
        <div className="pt-3 mt-2 border-t border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Tools
          </p>

          {/* Text-to-Image — LIVE with NEW badge */}
          <Link
            href="/tools/creator/text-to-image"
            onClick={onNavigate}
            className={cn(
              "flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium",
              pathname === "/tools/creator/text-to-image"
                ? "bg-[#1736cf]/10 text-[#1736cf]"
                : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <div className="flex items-center gap-3">
              <ImageIcon
                className={cn(
                  "h-4 w-4",
                  pathname === "/tools/creator/text-to-image" ? "text-[#1736cf]" : "text-slate-500"
                )}
              />
              <span className="font-medium">Text-to-Image</span>
            </div>
            <span
              className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide animate-pulse"
              style={{
                background: "rgba(16,185,129,0.15)",
                color: "#10b981",
                border: "1px solid rgba(16,185,129,0.4)",
              }}
            >
              New
            </span>
          </Link>

          {/* Video — LIVE with NEW badge */}
          <Link
            href="/video-generation"
            onClick={onNavigate}
            className={cn(
              "flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium",
              pathname === "/video-generation"
                ? "bg-[#1736cf]/10 text-[#1736cf]"
                : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <div className="flex items-center gap-3">
              <Video
                className={cn(
                  "h-4 w-4",
                  pathname === "/video-generation" ? "text-[#1736cf]" : "text-slate-500"
                )}
              />
              <span className="font-medium">Video</span>
            </div>
            <span
              className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide animate-pulse"
              style={{
                background: "rgba(16,185,129,0.15)",
                color: "#10b981",
                border: "1px solid rgba(16,185,129,0.4)",
              }}
            >
              New
            </span>
          </Link>

          {/* Upscale — coming soon */}
          <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg cursor-not-allowed select-none">
            <div className="flex items-center gap-3">
              <ArrowUpToLine className="h-4 w-4 text-slate-300" />
              <span className="text-sm font-medium text-slate-300">Upscale</span>
            </div>
            <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-wide">
              Soon
            </span>
          </div>
        </div>
      </nav>

      {/* Pro upgrade card or Pro Badge */}
      {isUserPro ? (
        <div className="mt-4 p-4 rounded-xl border shadow-sm" style={{ background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", borderColor: "rgba(245,158,11,0.2)" }}>
          <div className="flex items-center gap-2 mb-1">
            <Crown className="h-4 w-4 text-amber-600" />
            <p className="text-xs font-bold text-amber-900">Pro Member</p>
          </div>
          <p className="text-xs font-medium leading-relaxed" style={{ color: "rgba(146,64,14,0.8)" }}>
            You have unlimited access to all premium tools.
          </p>
        </div>
      ) : (
        <div className="mt-4 p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <Crown className="h-4 w-4 text-[#1736cf]" />
            <p className="text-xs font-bold text-slate-900">Pro Plan</p>
          </div>
          <p className="text-xs text-slate-500 mb-3 leading-relaxed">
            Unlock unlimited access to all tools.
          </p>
          <button
            onClick={() => router.push("/tools/creator/image-generator?upgrade=true")}
            className="w-full py-2 text-xs font-bold text-[#1736cf] bg-white border border-[#1736cf]/20 rounded-lg hover:bg-[#1736cf] hover:text-white transition-all"
          >
            Upgrade Now
          </button>
        </div>
      )}
    </div>
  );

  if (mobile) {
    return content;
  }

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col sticky top-16 h-[calc(100vh-64px)]">
      {content}
    </aside>
  );
}
