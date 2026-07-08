"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ChevronRight, ArrowRight, Wand2, Sparkles, Lock } from "lucide-react";

export default function CreatorHub() {
  const { status } = useSession();
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsPro(localStorage.getItem("eromify_pro") === "true");
    };
    check();
    window.addEventListener("eromify_pro_updated", check);
    return () => window.removeEventListener("eromify_pro_updated", check);
  }, []);

  // Also fetch server-side isPro so localStorage doesn't lie
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/user/credits")
      .then((r) => r.json())
      .then((d) => {
        if (d.isPro) {
          setIsPro(true);
          localStorage.setItem("eromify_pro", "true");
        }
      })
      .catch(() => { });
  }, [status]);

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-8">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Link href="/" className="hover:text-[#1736cf]">Dashboard</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-900 font-medium">Creator Tools</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Wand2 className="h-8 w-8 text-[#1736cf]" />
            Creator Toolkit
          </h1>
          <p className="text-slate-500 mt-2 text-base max-w-2xl leading-relaxed">
            A growing collection of creative and AI-powered tools designed to help you generate stunning visuals and automate creative workflows.
          </p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="flex-1 max-w-screen-xl mx-auto w-full px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* AI Image Generator Card — free (uses credits) */}
          <Link
            href="/tools/creator/image-generator"
            className="group block rounded-xl border border-[#1e1e3a] overflow-hidden hover:border-violet-500/50 transition-all duration-300 shadow-xl"
            style={{ background: "linear-gradient(145deg, #0d0d1a 0%, #12122a 60%, #0d0d1a 100%)" }}
          >
            <div className="h-60 w-full relative overflow-hidden border-b border-white/5">
              <Image
                src="/imagegenerationposter.png"
                alt="AI Image Generator"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(13,13,26,0.85) 100%)" }}
              />
              <div className="absolute bottom-3 left-3 flex gap-2 flex-wrap">
                {["GPT Image 2", "OpenAI", "No Watermark"].map((label) => (
                  <span
                    key={label}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: "rgba(13,13,26,0.75)",
                      color: "rgba(255,255,255,0.8)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    {label}
                  </span>
                ))}
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{ background: "rgba(16,185,129,0.15)", color: "rgba(110,231,183,1)", border: "1px solid rgba(16,185,129,0.3)", backdropFilter: "blur(6px)" }}>
                  Credits Required
                </span>
              </div>
            </div>
            <div className="p-6">
              <h2 className="text-white text-3xl font-bold tracking-tight mb-3">AI Image Generator</h2>
              <p className="text-[#a1a1aa] text-[15px] leading-relaxed">
                Turn any text prompt into stunning, high-resolution images powered by the latest GPT Image 2 model. Ideal for brands, marketers, and creators seeking top-tier visual quality without watermarks.
              </p>
            </div>
            <div className="px-6 py-5 border-t border-white/5 flex items-center justify-between group-hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-400" />
                <span className="text-white font-bold text-lg">Generate Images</span>
              </div>
              <ArrowRight className="h-5 w-5 text-white group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* AI Image Editor Card — free (uses credits) */}
          <Link
            href="/tools/creator/image-editor"
            className="group block rounded-xl border border-[#1e1e3a] overflow-hidden hover:border-violet-500/50 transition-all duration-300 shadow-xl"
            style={{ background: "linear-gradient(145deg, #0d0d1a 0%, #0d1a2a 60%, #0d0d1a 100%)" }}
          >
            <div className="h-60 w-full relative overflow-hidden border-b border-white/5 bg-gradient-to-br from-violet-950 via-slate-900 to-blue-950 flex items-center justify-center">
              <div className="flex items-center gap-3">
                <div className="w-20 h-20 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
                  <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <div className="w-20 h-20 rounded-xl border border-blue-500/30 bg-blue-500/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-3 left-3 flex gap-2 flex-wrap">
                {["GPT Image 2", "Style Transfer", "100 Credits"].map((label) => (
                  <span key={label} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{ background: "rgba(13,13,26,0.75)", color: "rgba(167,139,250,0.9)", border: "1px solid rgba(167,139,250,0.25)", backdropFilter: "blur(6px)" }}>
                    {label}
                  </span>
                ))}
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{ background: "rgba(16,185,129,0.15)", color: "rgba(110,231,183,1)", border: "1px solid rgba(16,185,129,0.3)", backdropFilter: "blur(6px)" }}>
                  Free Credits
                </span>
              </div>
            </div>
            <div className="p-6">
              <h2 className="text-white text-3xl font-bold tracking-tight mb-3">AI Image Editor</h2>
              <p className="text-[#a1a1aa] text-[15px] leading-relaxed">
                Transfer outfits, lighting, and style from any reference photo onto your own image using GPT Image 2 — your face stays untouched.
              </p>
            </div>
            <div className="px-6 py-5 border-t border-white/5 flex items-center justify-between group-hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-400" />
                <span className="text-white font-bold text-lg">Edit Image</span>
              </div>
              <ArrowRight className="h-5 w-5 text-white group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* AI Influencer Creator — PRO ONLY */}
          {isPro ? (
            <Link
              href="/tools/creator/ai-influencer"
              className="group block rounded-xl border border-[#1e1e3a] overflow-hidden hover:border-violet-500/50 transition-all duration-300 shadow-xl"
              style={{ background: "linear-gradient(145deg, #0d0d1a 0%, #1a0d2a 60%, #0d0d1a 100%)" }}
            >
              <div className="h-60 w-full relative overflow-hidden border-b border-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/couple.webp" alt="AI Influencer Creator" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a]/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 flex gap-2 flex-wrap">
                  {["18+ Only", "Popular", "Klein 4B", "Auto Gallery"].map((label) => (
                    <span key={label} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{
                        background: label === "18+ Only" ? "rgba(220, 38, 38, 0.2)" : "rgba(13,13,26,0.75)",
                        color: label === "18+ Only" ? "rgba(254, 202, 202, 1)" : "rgba(200,180,255,0.9)",
                        border: label === "18+ Only" ? "1px solid rgba(239, 68, 68, 0.5)" : "1px solid rgba(167,139,250,0.25)",
                        backdropFilter: "blur(6px)"
                      }}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-white text-3xl font-bold tracking-tight mb-3">AI Influencer Creator</h2>
                <p className="text-[#a1a1aa] text-[15px] leading-relaxed">
                  Create your own AI influencer images with FLUX.2 Klein 4B. Generate, edit, and blend — every image is securely saved directly to your personal gallery.
                </p>
              </div>
              <div className="px-6 py-5 border-t border-white/5 flex items-center justify-between group-hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-400" />
                  <span className="text-white font-bold text-lg">Create Influencer</span>
                </div>
                <ArrowRight className="h-5 w-5 text-white group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ) : (
            /* Non-Pro: same card, small pill, not clickable */
            <div
              className="block rounded-xl border border-[#1e1e3a] overflow-hidden shadow-xl cursor-default opacity-80"
              style={{ background: "linear-gradient(145deg, #0d0d1a 0%, #1a0d2a 60%, #0d0d1a 100%)" }}
            >
              <div className="h-60 w-full relative overflow-hidden border-b border-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/couple.webp" alt="AI Influencer Creator" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a]/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 flex gap-2 flex-wrap">
                  {["18+ Only", "Popular", "Klein 4B", "Auto Gallery"].map((label) => (
                    <span key={label} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{
                        background: label === "18+ Only" ? "rgba(220, 38, 38, 0.2)" : "rgba(13,13,26,0.75)",
                        color: label === "18+ Only" ? "rgba(254, 202, 202, 1)" : "rgba(200,180,255,0.9)",
                        border: label === "18+ Only" ? "1px solid rgba(239, 68, 68, 0.5)" : "1px solid rgba(167,139,250,0.25)",
                        backdropFilter: "blur(6px)"
                      }}>
                      {label}
                    </span>
                  ))}
                  {/* Pro required pill */}
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{ background: "rgba(245,158,11,0.15)", color: "rgba(253,230,138,1)", border: "1px solid rgba(245,158,11,0.4)", backdropFilter: "blur(6px)" }}>
                    <Lock style={{ width: 9, height: 9 }} /> Needs Pro
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-white text-3xl font-bold tracking-tight mb-3">AI Influencer Creator</h2>
                <p className="text-[#a1a1aa] text-[15px] leading-relaxed">
                  Create your own AI influencer images with FLUX.2 Klein 4B. Generate, edit, and blend — every image is securely saved directly to your personal gallery.
                </p>
              </div>
              <div className="px-6 py-5 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-slate-600" />
                  <span className="text-slate-500 font-bold text-lg">Create Influencer</span>
                </div>
                <Link
                  href="/tools/creator/image-generator?upgrade=true"
                  onClick={(e) => e.stopPropagation()}
                  className="text-[11px] font-black text-amber-400 border border-amber-500/30 bg-amber-500/10 rounded-full px-3 py-1 hover:bg-amber-500/20 transition"
                >
                  Upgrade →
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
