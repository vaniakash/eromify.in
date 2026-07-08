"use client";

import Link from "next/link";
import { LucideIcon, ExternalLink, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  href: string;
  comingSoon?: boolean;
  badge?: string;
  isPro?: boolean;
  isUserPro?: boolean;
  onUpgradeClick?: () => void;
}

export function ToolCard({
  title,
  description,
  icon: Icon,
  iconColor,
  iconBg,
  href,
  comingSoon = false,
  badge,
  isPro = false,
  isUserPro = false,
  onUpgradeClick,
}: ToolCardProps) {
  const isLocked = isPro && !isUserPro;

  if (comingSoon) {
    return (
      <div className="group bg-white border border-slate-200 p-6 rounded-xl opacity-60 cursor-not-allowed">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
            iconBg
          )}
        >
          <Icon className={cn("h-6 w-6", iconColor)} />
        </div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="text-base font-bold text-slate-900">{title}</h4>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full uppercase whitespace-nowrap">
            Soon
          </span>
        </div>
        <p className="text-sm text-slate-500 mb-5 leading-relaxed">
          {description}
        </p>
        <div className="w-full py-2.5 bg-slate-50 text-slate-400 text-sm font-semibold rounded-xl flex items-center justify-center gap-2">
          Coming Soon
        </div>
      </div>
    );
  }

  // Pro-locked card — clicking triggers upgrade modal
  if (isLocked) {
    return (
      <button
        onClick={onUpgradeClick}
        className="block w-full text-left"
      >
        <div className="group bg-white border border-amber-200 p-6 rounded-xl hover:shadow-lg hover:shadow-amber-100/60 hover:border-amber-400/50 transition-all duration-200 cursor-pointer h-full relative overflow-hidden">
          {/* Pro badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
            <Lock className="h-2.5 w-2.5" />
            PRO
          </div>

          {/* Subtle golden overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/60 to-transparent pointer-events-none rounded-xl" />

          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200 relative",
              iconBg
            )}
          >
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
          <div className="flex items-start justify-between gap-2 mb-2 pr-14">
            <h4 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
              {title}
            </h4>
          </div>
          {badge && (
            <span className="inline-block text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full uppercase whitespace-nowrap mb-2">
              {badge}
            </span>
          )}
          <p className="text-sm text-slate-500 mb-5 leading-relaxed">
            {description}
          </p>
          <div className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 group-hover:from-amber-600 group-hover:to-orange-600 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-sm group-hover:shadow-md">
            <Lock className="h-3.5 w-3.5" />
            Upgrade to Pro — ₹49
          </div>
        </div>
      </button>
    );
  }

  return (
    <Link href={href} className="block">
      <div className="group bg-white border border-slate-200 p-6 rounded-xl hover:shadow-lg hover:shadow-slate-200/60 hover:border-[#1736cf]/20 transition-all duration-200 cursor-pointer h-full">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200",
            iconBg
          )}
        >
          <Icon className={cn("h-6 w-6", iconColor)} />
        </div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="text-base font-bold text-slate-900 group-hover:text-[#1736cf] transition-colors">
            {title}
          </h4>
          {badge && (
            <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full uppercase whitespace-nowrap">
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 mb-5 leading-relaxed">
          {description}
        </p>
        <div className="w-full py-2.5 bg-slate-50 group-hover:bg-[#1736cf] text-slate-700 group-hover:text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200">
          Open Tool <ExternalLink className="h-3.5 w-3.5" />
        </div>
      </div>
    </Link>
  );
}
