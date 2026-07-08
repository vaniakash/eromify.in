"use client";

import Link from "next/link";
import { HelpCircle } from "lucide-react";

export function HelpFAB() {
  return (
    <Link
      href="/help"
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#1736cf] text-white shadow-lg shadow-[#1736cf]/30 transition-transform hover:scale-110 hover:bg-[#1430b8] active:scale-95"
      aria-label="Help"
    >
      <HelpCircle className="h-6 w-6" />
    </Link>
  );
}
