"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Menu,
  User as UserIcon,
  LogOut,
  Zap,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();
  const [credits, setCredits] = useState<number | null>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchCredits = useCallback(async () => {
    if (status !== "authenticated") return;
    try {
      const res = await fetch("/api/user/credits");
      if (res.ok) {
        const data = await res.json();
        setCredits(data.credits ?? 0);
      }
    } catch { }
  }, [status]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  // Re-sync when another component fires credits_updated (e.g. after purchase)
  useEffect(() => {
    window.addEventListener("credits_updated", fetchCredits);
    return () => window.removeEventListener("credits_updated", fetchCredits);
  }, [fetchCredits]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* ── Left: Logo ── */}
        <div className="flex items-center gap-4">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <Sidebar mobile onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-16 h-16 relative">
              <Image src="/eromifylogo.png" alt="Eromify Logo" fill className="object-contain" priority />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Eromify</span>
          </Link>
        </div>

        {/* ── Right: Nav + Credits + Auth ── */}
        <nav className="flex items-center gap-2">
          <Link
            href="/blog"
            className="hidden sm:flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 hover:text-[#1736cf] hover:bg-slate-50 rounded-lg transition-colors"
          >
            Blog
          </Link>

          {/* Credits pill — only shown when logged in */}
          {status === "authenticated" && credits !== null && (
            <div className="flex items-center gap-1 rounded-xl border border-violet-200 bg-violet-50 px-1 py-1 shadow-sm">
              {/* Count */}
              <div className="flex items-center gap-1.5 px-2.5">
                <Zap
                  className="h-3.5 w-3.5 text-violet-600 shrink-0"
                  style={{ filter: "drop-shadow(0 0 5px rgba(124,58,237,0.6))" }}
                />
                <span className="text-sm font-black tabular-nums text-violet-700 leading-none">
                  {Math.floor(credits / 100)}
                </span>
                <span className="hidden sm:inline text-xs font-semibold text-violet-400 leading-none">
                  credits
                </span>
              </div>

              {/* Buy button */}
              <button
                onClick={() => router.push("/tools/creator/image-generator?upgrade=true")}
                title="Buy more credits"
                className="flex items-center gap-1 rounded-lg bg-violet-600 hover:bg-violet-500 active:scale-95 text-white px-2.5 py-1.5 text-xs font-black transition-all hover:shadow-lg hover:shadow-violet-500/30"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Buy</span>
              </button>
            </div>
          )}

          {/* Auth area */}
          {status === "loading" ? (
            <div className="w-20 h-9 bg-slate-100 rounded-md animate-pulse ml-2" />
          ) : session?.user ? (
            <div className="flex items-center gap-3 ml-1">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold text-slate-900 leading-none">
                  {session.user.name?.split(" ")[0]}
                </span>
                <span className="text-xs text-slate-500">
                  {session.user.email?.split("@")[0]}
                </span>
              </div>
              <div className="relative cursor-pointer" ref={profileRef}>
                {/* Avatar — click to toggle */}
                <button
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="focus:outline-none"
                  aria-label="Profile menu"
                >
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt="User"
                      width={36}
                      height={36}
                      className={`rounded-full border-2 transition-colors ${
                        profileOpen ? "border-[#1736cf]" : "border-slate-200 hover:border-[#1736cf]"
                      }`}
                    />
                  ) : (
                    <div className={`w-9 h-9 bg-[#1736cf]/10 text-[#1736cf] rounded-full flex items-center justify-center border-2 transition-colors ${
                      profileOpen ? "border-[#1736cf]" : "border-transparent hover:border-[#1736cf]"
                    }`}>
                      <UserIcon className="h-4 w-4" />
                    </div>
                  )}
                </button>

                {/* Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900 truncate">{session.user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{session.user.email}</p>
                    </div>
                    {/* Sign Out */}
                    <button
                      onClick={() => { setProfileOpen(false); signOut(); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors font-medium"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Button
              asChild
              className="bg-[#1736cf] hover:bg-[#1430b8] text-white font-semibold shadow-sm cursor-pointer"
              size="sm"
            >
              <Link href="/login">
                Register
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
