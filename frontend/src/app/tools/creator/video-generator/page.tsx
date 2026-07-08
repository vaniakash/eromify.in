"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Video, ChevronDown, ChevronUp, Upload, X,
  AlertTriangle, Sparkles, Download, RefreshCw,
  Film, Coins, Music, Image as ImageIcon, Crown, ExternalLink,
  Settings2, SlidersHorizontal
} from "lucide-react";

/* ───────── types ───────── */
type TabType = "animated" | "talking" | "motion";
type Quality = "wan-2.6" | "wan-fast" | "seedance-2.0" | "seedance-pro" | "seedance" | "veo" | "ltx-2" | "nova-reel" | "grok-video-pro" | "p-video";
type Duration = number;
type Resolution = "720p" | "1080p";

interface QualityOption {
  id: Quality;
  label: string;
  desc: string;
  supportsImage?: boolean;
  pricePerSec: number;
  tags: string[];
  badge?: string;
  validDurations: number[]; // per-model valid duration options (from Pollinations docs)
}

// Only veo officially supports image reference for video (start/end frame interpolation)
// Other models may accept image but reject it due to content policy
const IMAGE_SUPPORTED_MODELS: Quality[] = ["veo"];

const QUALITY_OPTIONS: QualityOption[] = [
  {
    id: "wan-2.6",
    label: "Wan 2.6",
    desc: "Text-to-video — describe a scene from scratch",
    pricePerSec: 0.075,
    tags: ["💬", "👁️", "🎬", "🔊"],
    validDurations: [5, 10],     // wan: 2-15s, we offer 5 & 10
  },
  {
    id: "wan-fast",
    label: "Wan 2.2 Fast",
    desc: "Fastest Wan model — great for quick previews",
    pricePerSec: 0.015,
    tags: ["💬", "👁️", "🎬"],
    badge: "Fast",
    validDurations: [5, 10],     // wan-fast: same as wan
  },
  {
    id: "ltx-2",
    label: "LTX-2.3",
    desc: "Fastest cinematic render, best for rapid iteration",
    pricePerSec: 0.005,
    tags: ["💬", "🎬"],
    badge: "Alpha",
    validDurations: [5, 10],
  },
  {
    id: "p-video",
    label: "Pruna P-Video",
    desc: "Pruna distilled video model — fast & efficient generation",
    pricePerSec: 0.036,
    tags: ["💬", "👁️", "🎬"],
    validDurations: [5, 10],
  },
  {
    id: "nova-reel",
    label: "Nova Reel",
    desc: "Amazon Nova — high quality cinematic video generation",
    pricePerSec: 0.080,
    tags: ["💬", "👁️", "🎬"],
    validDurations: [6, 12],     // nova-reel: 6-120s, multiples of 6
  },
  {
    id: "veo",
    label: "Veo 3.1 Fast",
    desc: "Google Veo — supports image-to-video interpolation (start→end frame)",
    supportsImage: true,
    pricePerSec: 0.150,
    tags: ["💬", "👁️", "🎬"],
    validDurations: [4, 6, 8],   // veo: only 4, 6, or 8s (from docs)
  },
  {
    id: "grok-video-pro",
    label: "Grok Video Pro",
    desc: "xAI Grok — high quality video generation",
    pricePerSec: 0.075,
    tags: ["💬", "👁️", "🎬"],
    validDurations: [5, 10],
  },
  {
    id: "seedance-2.0",
    label: "Seedance 2.0",
    desc: "High-fidelity cinematic video — text-only prompts work best",
    pricePerSec: 0.270,
    tags: ["💬", "👁️", "🎬"],
    badge: "Premium",
    validDurations: [5, 10],     // seedance-2.0: 4-15s
  },
  {
    id: "seedance-pro",
    label: "Seedance Pro-Fast",
    desc: "Faster Seedance variant with pro-quality output",
    pricePerSec: 1.5,
    tags: ["💬", "👁️", "🎬"],
    validDurations: [5, 10],     // seedance: 2-10s
  },
  {
    id: "seedance",
    label: "Seedance Lite",
    desc: "Lightweight Seedance — budget cinematic video",
    pricePerSec: 2.7,
    tags: ["💬", "👁️", "🎬"],
    validDurations: [5, 10],
  },
];

const VIDEO_COST = 15;


/* ───────── component ───────── */
export default function VideoGeneratorPage() {
  const { status } = useSession();
  const router = useRouter();

  const [tab, setTab] = useState<TabType>("animated");
  const [quality, setQuality] = useState<Quality>("wan-2.6");
  const [qualityOpen, setQualityOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [duration, setDuration] = useState<Duration>(5);
  const [resolution, setResolution] = useState<Resolution>("720p");

  const selectedQuality = QUALITY_OPTIONS.find((q) => q.id === quality) ?? QUALITY_OPTIONS[0];

  // Snap duration to first valid option when model changes
  const handleModelChange = (newModel: Quality) => {
    setQuality(newModel);
    setQualityOpen(false);
    const opt = QUALITY_OPTIONS.find((q) => q.id === newModel);
    if (opt && !opt.validDurations.includes(duration)) {
      setDuration(opt.validDurations[0]);
    }
  };

  // Reference image
  const [refImage, setRefImage] = useState<string | null>(null);
  const [refImageName, setRefImageName] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Audio
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioName, setAudioName] = useState("");
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [noVideoAccess, setNoVideoAccess] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const STAGES = [
    { label: "Initializing", desc: "Preparing your request", pct: 5, color: "#818cf8" },
    { label: "Uploading", desc: "Sending assets to render farm", pct: 15, color: "#60a5fa" },
    { label: "Queuing", desc: "Waiting for GPU slot", pct: 28, color: "#a78bfa" },
    { label: "Rendering", desc: "AI is painting your frames", pct: 82, color: "#34d399" },
    { label: "Finalizing", desc: "Encoding & compressing video", pct: 96, color: "#fbbf24" },
  ];

  /* ── fetch credits ── */
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/user/credits")
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.credits === "number") setCredits(d.credits);
      })
      .catch(() => { });
  }, [status, videoUrl]);

  /* ── redirect if not logged in ── */
  // Removed: page is publicly visible; auth check happens at generate time

  /* ── staged progress ── */
  const startProgress = useCallback(() => {
    setProgress(0);
    setStageIndex(0);
    setElapsed(0);
    startTimeRef.current = Date.now();

    // Elapsed timer
    elapsedRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    // Progress simulation — advances through stages
    let p = 0;
    progressRef.current = setInterval(() => {
      // Slow down near 96 to never reach 100 until real done
      const speed = p < 28 ? 3.5 : p < 82 ? 0.8 : p < 96 ? 0.2 : 0;
      p = Math.min(p + speed + Math.random() * 0.5, 96);
      setProgress(p);
      // Update stage based on progress
      const idx = [5, 15, 28, 82, 96].findLastIndex((t) => p >= t);
      setStageIndex(Math.max(0, idx));
    }, 800);
  }, []);

  const stopProgress = useCallback(() => {
    if (progressRef.current) clearInterval(progressRef.current);
    if (elapsedRef.current) clearInterval(elapsedRef.current);
    setProgress(100);
    setStageIndex(4);
  }, []);

  /* ── image upload ── */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRefImageName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setRefImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  /* ── audio upload ── */
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioFile(file);
    setAudioName(file.name);
  };

  /* ── generate ── */
  const generate = async () => {
    if (!prompt.trim() || generating) return;
    // Gate: require login only when user tries to generate
    if (status !== "authenticated") {
      router.push("/auth/login?callbackUrl=/tools/creator/video-generator");
      return;
    }
    setError(null);
    setNoVideoAccess(false);
    setVideoUrl(null);
    setGenerating(true);
    startProgress();

    try {
      // Step 1: Get short-lived auth ticket from Next.js (fast < 1s)
      const ticketRes = await fetch("/api/video-ticket", { method: "POST" });
      if (!ticketRes.ok) {
        const j = await ticketRes.json().catch(() => ({}));
        throw new Error(j.error || `Auth error ${ticketRes.status}`);
      }
      const { ticket } = await ticketRes.json();

      const body: Record<string, unknown> = {
        prompt: prompt.trim(),
        model: quality,
        duration,
        aspectRatio: "16:9",
      };
      if (refImage) body.image = refImage;

      // Step 2: Call Express backend on Render (no timeout limit)
      // Falls back to Next.js route if env var not set (local dev)
      const backendUrl = process.env.NEXT_PUBLIC_VIDEO_BACKEND_URL;
      const endpoint = backendUrl ? `${backendUrl}/generate-video` : "/api/generate-video";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(backendUrl && ticket ? { Authorization: `Bearer ${ticket}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || `Error ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      stopProgress();
      setVideoUrl(url);

      // Refresh credits
      fetch("/api/user/credits")
        .then((r) => r.json())
        .then((d) => { if (typeof d.credits === "number") setCredits(d.credits); })
        .catch(() => { });
    } catch (err: unknown) {
      stopProgress();
      const msg = err instanceof Error ? err.message : "Generation failed";
      if (msg.includes("NO_VIDEO_ACCESS") || msg.includes("Pro Pack") || msg.includes("Mega Pack")) {
        setNoVideoAccess(true);
      } else {
        setError(msg);
      }
    } finally {
      setGenerating(false);
    }
  };

  const download = () => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `eromify-video-${Date.now()}.mp4`;
    a.click();
  };


  /* ───────────────────── UI ───────────────────── */
  return (
    <div className="flex flex-col h-[100dvh] bg-[#09090b] text-slate-200 font-sans selection:bg-[#4f46e5]/30">
      <style dangerouslySetInnerHTML={{
        __html: `
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />

      {/* ── Header breadcrumb ── */}
      <div className="bg-[#09090b] border-b border-white/[0.08] px-6 py-4 flex-shrink-0 z-10 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#4f46e5]/5 to-transparent pointer-events-none" />
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 relative">
          <Link href="/" className="hover:text-white transition-colors">Dashboard</Link>
          <span className="opacity-50">/</span>
          <Link href="/tools/creator" className="hover:text-white transition-colors">Creator</Link>
          <span className="opacity-50">/</span>
          <span className="text-white font-medium flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-[#818cf8]" />
            Video Studio
          </span>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="flex flex-col lg:flex-row flex-1 lg:overflow-hidden">

        {/* ── LEFT: Form panel ── */}
        <div className="w-full lg:w-[340px] flex-shrink-0 border-b lg:border-b-0 lg:border-r border-white/[0.08] bg-[#0c0c0e] flex flex-col relative z-10 lg:h-full">

          {/* Scrollable form content */}
          <div className="flex-1 overflow-y-auto">
            {/* Section header */}
            <div className="px-5 pt-6 pb-5">
              <div className="flex items-center gap-3 mb-1.5">
                <div className="p-2 rounded-xl bg-gradient-to-br from-[#4f46e5]/20 to-[#4f46e5]/5 border border-[#4f46e5]/20 shadow-[0_0_15px_rgba(79,70,229,0.15)]">
                  <Video className="h-4 w-4 text-[#818cf8]" />
                </div>
                <h1 className="text-base font-bold text-white tracking-tight">AI Studio Engine</h1>
              </div>
              <p className="text-xs text-slate-400 pl-[44px]">Cinematic text-to-video generation</p>
            </div>

            {/* Tabs: Animated / Talking / Motion */}
            <div className="px-5 pb-5 border-b border-white/[0.05]">
              <div className="flex bg-[#18181b] p-1 rounded-lg border border-white/[0.04]">
                <button
                  onClick={() => setTab("animated")}
                  className="flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5"
                  style={{
                    background: tab === "animated" ? "rgba(255,255,255,0.1)" : "transparent",
                    color: tab === "animated" ? "#fff" : "#71717a",
                    boxShadow: tab === "animated" ? "0 1px 3px rgba(0,0,0,0.5)" : "none",
                  }}
                >
                  <Sparkles className="w-3 h-3" />
                  Animated
                </button>
                <div className="flex-1 relative">
                  <button disabled className="w-full py-1.5 text-xs font-medium rounded-md text-slate-500 cursor-not-allowed flex items-center justify-center gap-1.5">
                    🗣️ Talking
                  </button>
                  <span className="absolute -top-1 -right-0.5 text-[7px] font-bold px-1 py-0.5 rounded uppercase tracking-wider bg-white/10 text-slate-400">Soon</span>
                </div>
                <div className="flex-1 relative">
                  <button disabled className="w-full py-1.5 text-xs font-medium rounded-md text-slate-500 cursor-not-allowed flex items-center justify-center gap-1.5">
                    ✨ Motion
                  </button>
                  <span className="absolute -top-1 -right-0.5 text-[7px] font-bold px-1 py-0.5 rounded uppercase tracking-wider bg-white/10 text-slate-400">Soon</span>
                </div>
              </div>
            </div>

            <div className="px-5 py-5 space-y-6">

              {/* Video Prompt */}
              <div>
                <label className="flex items-center justify-between gap-2 text-xs font-medium text-slate-300 mb-2">
                  <span className="flex items-center gap-2">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                    Cinematic Prompt
                  </span>
                  <span className={`tabular-nums font-mono text-[10px] ${prompt.length > 400 ? "text-red-400" :
                      prompt.length > 300 ? "text-amber-400" :
                        "text-slate-600"
                    }`}>
                    {prompt.length}/500
                  </span>
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
                  placeholder="Describe your scene. Keep it under 400 chars for best results. E.g., 'Cinematic tracking shot through a neon-lit cyberpunk market, 8k resolution, photorealistic...'"
                  rows={4}
                  className={`w-full px-3.5 py-3 text-sm text-slate-200 bg-[#18181b] rounded-xl border resize-none outline-none transition-all placeholder:text-slate-500 focus:bg-[#18181b]/80 focus:ring-4 ${prompt.length > 400
                      ? "border-red-500/40 focus:border-red-500/60 focus:ring-red-500/10"
                      : "border-white/[0.08] focus:border-[#4f46e5]/50 focus:ring-[#4f46e5]/10"
                    }`}
                />
                {prompt.length > 350 && (
                  <p className="mt-1.5 text-[10px] leading-relaxed" style={{ color: prompt.length > 400 ? "#f87171" : "#fbbf24" }}>
                    {prompt.length > 400
                      ? "⚠️ Too long — server will auto-trim to 350 chars. Shorten for accurate results."
                      : "💡 Tip: Keep under 350 chars. Long prompts get trimmed automatically."}
                  </p>
                )}
              </div>

              {/* Video Quality selector */}
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-300 mb-2">
                  <Settings2 className="w-3.5 h-3.5 text-slate-500" />
                  Render Engine
                </label>
                <div className="relative">
                  <button
                    onClick={() => setQualityOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-[#18181b] hover:bg-[#202024] text-sm text-slate-200 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#818cf8] shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
                      {selectedQuality.label}
                    </div>
                    <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${qualityOpen ? "rotate-180" : ""}`} />
                  </button>
                  {qualityOpen && (
                    <div className="absolute z-20 w-full mt-2 bg-[#18181b] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl">
                      {QUALITY_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => handleModelChange(opt.id)}
                          className="w-full text-left px-4 py-3 hover:bg-white/[0.04] transition-colors border-b border-white/[0.04] last:border-0 relative group"
                        >
                          {quality === opt.id && (
                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#818cf8]" />
                          )}
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold ${quality === opt.id ? "text-[#818cf8]" : "text-white"}`}>
                                {opt.label}
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">{opt.id}</span>
                            </div>
                            <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              {opt.tags.map((tag, i) => (
                                <span key={i} className="text-[10px]">{tag}</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-end justify-between mt-1.5">
                            <p className="text-[10px] text-slate-500 leading-snug flex-1 pr-3">{opt.desc}</p>
                            <span className="text-[9px] font-bold text-[#a5b4fc] bg-[#4f46e5]/20 px-1.5 py-0.5 rounded border border-[#4f46e5]/30 whitespace-nowrap">
                              ${opt.pricePerSec}/s
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>


              </div>

              {/* Advanced Options */}
              <div className="bg-[#18181b] border border-white/[0.04] rounded-xl overflow-hidden">
                <button
                  onClick={() => setAdvancedOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-3.5 py-3 text-xs font-medium text-slate-300 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-3.5 h-3.5" />
                    Render Settings
                  </div>
                  {advancedOpen ? <ChevronUp className="h-3.5 w-3.5 text-slate-500" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-500" />}
                </button>

                {advancedOpen && (
                  <div className="px-3.5 pb-4 space-y-4 border-t border-white/[0.04] pt-3 bg-black/20">
                    {/* Duration & Resolution */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2">Duration</p>
                        <div className="flex rounded-lg bg-black/40 p-1 border border-white/[0.05]">
                          {selectedQuality.validDurations.map((d) => (
                            <button
                              key={d}
                              onClick={() => setDuration(d)}
                              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${duration === d ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                              {d}s
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2">Resolution</p>
                        <div className="flex rounded-lg bg-black/40 p-1 border border-white/[0.05]">
                          {(["720p", "1080p"] as Resolution[]).map((r) => (
                            <button
                              key={r}
                              onClick={() => setResolution(r)}
                              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${resolution === r ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Image Ref */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2">Init Image <span className="lowercase normal-case opacity-60">(opt)</span></p>
                      {!IMAGE_SUPPORTED_MODELS.includes(quality) ? (
                        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-500/8 border border-amber-500/20">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500/70 flex-shrink-0 mt-0.5" />
                          <p className="text-[10px] text-amber-500/70 leading-relaxed">
                            <strong>{selectedQuality.label}</strong> does not support reference images. Use <strong>Wan 2.6</strong>, <strong>Wan Fast</strong>, <strong>Veo</strong>, or <strong>Nova Reel</strong> for image-to-video.
                          </p>
                        </div>
                      ) : refImage ? (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/[0.05]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={refImage} alt="ref" className="h-8 w-8 rounded border border-white/10 object-cover flex-shrink-0" />
                          <p className="text-xs text-slate-400 flex-1 truncate">{refImageName}</p>
                          <button onClick={() => { setRefImage(null); setRefImageName(""); if (imageInputRef.current) imageInputRef.current.value = ""; }} className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => imageInputRef.current?.click()}
                          className="w-full flex flex-col items-center justify-center gap-1.5 py-4 rounded-lg border border-dashed border-white/[0.1] bg-black/20 text-slate-500 hover:border-[#4f46e5]/50 hover:text-[#818cf8] hover:bg-[#4f46e5]/5 transition-all group"
                        >
                          <ImageIcon className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                          <span className="text-[10px] font-medium">Drop image or browse</span>
                        </button>
                      )}
                      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </div>

                    {/* Audio Ref */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2">Audio Track <span className="lowercase normal-case opacity-60">(opt)</span></p>
                      {audioFile ? (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/[0.05]">
                          <Music className="h-4 w-4 text-[#818cf8] ml-1 flex-shrink-0" />
                          <p className="text-xs text-slate-400 flex-1 truncate ml-1">{audioName}</p>
                          <button onClick={() => { setAudioFile(null); setAudioName(""); if (audioInputRef.current) audioInputRef.current.value = ""; }} className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => audioInputRef.current?.click()}
                          className="w-full flex flex-col items-center justify-center gap-1.5 py-4 rounded-lg border border-dashed border-white/[0.1] bg-black/20 text-slate-500 hover:border-[#4f46e5]/50 hover:text-[#818cf8] hover:bg-[#4f46e5]/5 transition-all group"
                        >
                          <Music className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                          <span className="text-[10px] font-medium">Add MP3 / WAV</span>
                        </button>
                      )}
                      <input ref={audioInputRef} type="file" accept="audio/mp3,audio/wav,audio/mpeg" className="hidden" onChange={handleAudioUpload} />
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Bottom Action Area */}
          <div className="p-5 border-t border-white/[0.08] bg-[#0c0c0e] relative z-20">
            {noVideoAccess && (
              <div className="p-3.5 rounded-xl mb-3 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-[11px] font-bold text-violet-300 tracking-wide uppercase">Video Access Required</span>
                </div>
                <p className="text-[10px] text-violet-200/70 leading-relaxed mb-3">
                  Included with <strong className="text-violet-200">Pro (₹199)</strong> or <strong className="text-violet-200">Mega (₹499)</strong> pack.
                </p>
                <a
                  href="/pricing"
                  className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-xs font-bold text-white shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] transition-all bg-gradient-to-r from-violet-600 to-indigo-600"
                >
                  <Crown className="h-3 w-3" />
                  Upgrade Plan
                </a>
              </div>
            )}

            {error && !noVideoAccess && (
              <div className="flex items-start gap-2 p-3 mb-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-red-300 leading-relaxed">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-1.5 text-xs">
                <Coins className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-slate-400">Balance: <span className="font-bold text-white">{credits !== null ? credits : "—"}</span></span>
              </div>
              <span className="text-[10px] font-medium text-slate-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                Cost: {VIDEO_COST} credits
              </span>
            </div>

            <button
              onClick={generate}
              disabled={generating || !prompt.trim() || status !== "authenticated" || noVideoAccess}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-[0.98]"
              style={{
                background: generating || !prompt.trim() || noVideoAccess
                  ? "#27272a"
                  : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                boxShadow: generating || !prompt.trim() || noVideoAccess
                  ? "none"
                  : "0 0 20px rgba(79,70,229,0.3), inset 0 1px 0 rgba(255,255,255,0.2)"
              }}
            >
              {generating ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {STAGES[stageIndex]?.label}… {Math.round(progress)}%
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                  Generate Sequence
                </>
              )}
              {generating && (
                <div
                  className="absolute bottom-0 left-0 h-1 transition-all duration-700"
                  style={{
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${STAGES[stageIndex]?.color ?? "#818cf8"}, ${STAGES[Math.min(stageIndex + 1, STAGES.length - 1)]?.color ?? "#34d399"})`,
                    boxShadow: `0 0 8px ${STAGES[stageIndex]?.color ?? "#818cf8"}`,
                  }}
                />
              )}
            </button>
          </div>
        </div>

        {/* ── RIGHT: Preview area ── */}
        <div className="flex-1 flex flex-col relative bg-[#000000] lg:overflow-hidden min-h-[500px] lg:min-h-0">
          {/* Subtle grid background for the studio feel */}
          <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: "radial-gradient(circle at center, #333 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

          {videoUrl ? (
            <div className="flex-1 flex flex-col z-10 relative h-full p-4 sm:p-6">
              {/* Video player wrapper */}
              <div className="flex-1 flex items-center justify-center bg-[#09090b] rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative group min-h-[300px]">
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Actions bar */}
              <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-slate-400">
                    {resolution}
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-slate-400">
                    {duration}s
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-indigo-400">
                    {selectedQuality.id}
                  </span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => { setVideoUrl(null); setError(null); setProgress(0); }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 text-sm font-semibold hover:bg-white/10 hover:text-white transition-all"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Discard
                  </button>
                  <button
                    onClick={download}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black text-sm font-bold hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)]"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                </div>
              </div>
            </div>
          ) : generating ? (
            /* ── RENDERING STATE ── cinematic progress panel ── */
            <div className="flex-1 flex flex-col items-center justify-center px-8 z-10 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none transition-colors duration-1000"
                style={{ background: `${STAGES[stageIndex]?.color ?? "#818cf8"}18` }} />

              {/* Animated film icon */}
              <div className="relative mb-8">
                <div className="w-24 h-24 rounded-3xl flex items-center justify-center relative"
                  style={{ background: "rgba(0,0,0,0.6)", border: `1px solid ${STAGES[stageIndex]?.color ?? "#818cf8"}40`, boxShadow: `0 0 40px ${STAGES[stageIndex]?.color ?? "#818cf8"}30` }}>
                  <Film className="h-10 w-10 animate-pulse" style={{ color: STAGES[stageIndex]?.color ?? "#818cf8" }} />
                </div>
                {/* Orbiting dot */}
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: "3s" }}>
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
                    style={{ background: STAGES[stageIndex]?.color ?? "#818cf8", boxShadow: `0 0 12px ${STAGES[stageIndex]?.color ?? "#818cf8"}` }} />
                </div>
              </div>

              {/* Stage + message */}
              <h2 className="text-2xl font-black text-white mb-1 tracking-tight transition-all">
                {STAGES[stageIndex]?.label}…
              </h2>
              <p className="text-sm mb-6 transition-all" style={{ color: "rgba(255,255,255,0.45)" }}>
                {STAGES[stageIndex]?.desc}
              </p>

              {/* Progress bar */}
              <div className="w-full max-w-sm mb-3">
                <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${progress}%`,
                      background: `linear-gradient(90deg, ${STAGES[Math.max(0, stageIndex - 1)]?.color ?? "#818cf8"}, ${STAGES[stageIndex]?.color ?? "#34d399"})`,
                      boxShadow: `0 0 12px ${STAGES[stageIndex]?.color ?? "#818cf8"}80`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] font-mono" style={{ color: STAGES[stageIndex]?.color ?? "#818cf8" }}>{Math.round(progress)}%</span>
                  <span className="text-[10px] font-mono text-slate-500">{elapsed}s elapsed</span>
                </div>
              </div>

              {/* Stage pipeline */}
              <div className="flex items-center gap-1.5 mt-2">
                {STAGES.map((s, i) => (
                  <div key={s.label} className="flex items-center gap-1.5">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-2 h-2 rounded-full transition-all duration-500"
                        style={{
                          background: i < stageIndex ? "#34d399" : i === stageIndex ? (STAGES[stageIndex]?.color ?? "#818cf8") : "rgba(255,255,255,0.1)",
                          boxShadow: i === stageIndex ? `0 0 8px ${STAGES[stageIndex]?.color ?? "#818cf8"}` : "none",
                          transform: i === stageIndex ? "scale(1.4)" : "scale(1)",
                        }}
                      />
                      <span className="text-[8px] mt-1 font-medium hidden sm:block" style={{ color: i <= stageIndex ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.15)" }}>
                        {s.label}
                      </span>
                    </div>
                    {i < STAGES.length - 1 && (
                      <div className="w-6 h-px mb-3" style={{ background: i < stageIndex ? "#34d399" : "rgba(255,255,255,0.08)" }} />
                    )}
                  </div>
                ))}
              </div>

              {/* Reassurance message */}
              <p className="text-[11px] mt-8 text-center max-w-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
                {elapsed < 20 ? "Starting render pipeline…" :
                  elapsed < 60 ? "⚡ GPU is actively processing your sequence" :
                    elapsed < 120 ? "🎥 Rendering frames… complex scenes take 2–3 min" :
                      "✅ Almost done — don't close this tab"}
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8 z-10 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#4f46e5]/10 rounded-full blur-[120px] pointer-events-none" />

              <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#4f46e5]/20 to-transparent rounded-3xl border border-white/10 rotate-3 transform" />
                <div className="absolute inset-0 bg-[#09090b] rounded-3xl border border-white/10 -rotate-3 transform backdrop-blur-xl flex items-center justify-center shadow-2xl">
                  <Film className="h-10 w-10 text-slate-400" />
                </div>
              </div>

              <h2 className="text-2xl font-black text-white mb-3 tracking-tight">Studio Output</h2>
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed mb-10">
                Configure your render settings in the left panel and click generate to process the sequence.
              </p>

              {/* Model badges */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {[
                  { l: "Wan 2.6 Engine", c: "from-blue-500/10 to-blue-500/5", b: "border-blue-500/20", t: "text-blue-400" },
                  { l: "Cinematic Rendering", c: "from-purple-500/10 to-purple-500/5", b: "border-purple-500/20", t: "text-purple-400" },
                  { l: "8K Pipeline", c: "from-emerald-500/10 to-emerald-500/5", b: "border-emerald-500/20", t: "text-emerald-400" }
                ].map((badge) => (
                  <span
                    key={badge.l}
                    className={`px-4 py-1.5 rounded-full text-[11px] font-semibold bg-gradient-to-r ${badge.c} border ${badge.b} ${badge.t} shadow-sm`}
                  >
                    {badge.l}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
