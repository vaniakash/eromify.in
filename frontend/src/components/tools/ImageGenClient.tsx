"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Wand2,
  Download,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ZoomIn,
  X,
  Clock,
  AlertCircle,
  Flame,
  Cpu,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { ImageGenPayModal } from "@/components/ImageGenPayModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  model: string;
  timestamp: Date;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MODELS = [
  {
    id: "gptimage-large",
    label: "GPT Image 1.5",
    badge: "OpenAI",
    badgeColor: "bg-violet-100 text-violet-700",
    description: "OpenAI GPT Image 1.5 — powerful text-to-image with vision.",
    icon: "✨",
    tag: "Popular",
  },
  {
    id: "wan-image",
    label: "Wan 2.7 Image",
    badge: "New",
    badgeColor: "bg-emerald-100 text-emerald-700",
    description: "Wan 2.7 — latest multimodal image model with vision support.",
    icon: "🌊",
    tag: "New",
  },
  {
    id: "qwen-image",
    label: "Qwen Image Plus",
    badge: "Vision",
    badgeColor: "bg-blue-100 text-blue-700",
    description: "Qwen Image Plus — advanced multimodal vision-language model.",
    icon: "👁️",
    tag: null,
  },
  {
    id: "flux",
    label: "Flux Schnell",
    badge: "Fast",
    badgeColor: "bg-amber-100 text-amber-700",
    description: "Flux Schnell — ultra-fast text-to-image generation.",
    icon: "⚡",
    tag: null,
  },
  {
    id: "zimage",
    label: "Z-Image Turbo",
    badge: "Turbo",
    badgeColor: "bg-pink-100 text-pink-700",
    description: "Z-Image Turbo — high-speed image synthesis.",
    icon: "🚀",
    tag: null,
  },
];




const PROMPT_EXAMPLES = [
  "Photorealistic female model, 25 years old, long dark hair, soft studio lighting, luxury fashion editorial, 8K",
  "Handsome male influencer, athletic build, sharp jawline, outdoor golden hour portrait, lifestyle photography",
  "Gorgeous female AI influencer, blue eyes, beach setting, natural makeup, Instagram-ready portrait",
  "Male fitness influencer, gym background, confident pose, modern streetwear, cinematic lighting",
  "Elegant female model, red dress, rooftop city view at night, luxury brand campaign, hyperrealistic",
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ImageGenClient() {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("gptimage-large");
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [lightboxImage, setLightboxImage] = useState<GeneratedImage | null>(null);
  const [payModal, setPayModal] = useState<{ open: boolean; mode: "login" | "payment" }>({ open: false, mode: "payment" });
  const [credits, setCredits] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { status } = useSession();
  const searchParams = useSearchParams();

  // If the user navigates here with ?upgrade=true, show the modal automatically
  useEffect(() => {
    if (searchParams.get("upgrade") === "true") {
      setPayModal({ open: true, mode: status === "authenticated" ? "payment" : "login" });
    }
  }, [searchParams, status]);

  const fetchCredits = useCallback(async () => {
    if (status !== "authenticated") return;
    try {
      const res = await fetch("/api/user/credits");
      if (res.ok) {
        const data = await res.json();
        setCredits(data.credits);
      }
    } catch (err) {
      console.error("Failed to fetch credits", err);
    }
  }, [status]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    if (status !== "authenticated") {
      window.location.href = "/auth/login";
      return;
    }

    if (credits !== null && credits <= 0) {
      setPayModal({ open: true, mode: "payment" });
      return;
    }

    await doGenerate();
  };

  const doGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model: selectedModel }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "INSUFFICIENT_CREDITS") {
          setPayModal({ open: true, mode: "payment" });
          throw new Error("Insufficient credits. Please purchase a pack to continue.");
        }
        throw new Error(data.error || "Failed to generate image.");
      }
      if (!data.image) throw new Error("Failed to generate image.");

      // Locally decrement credits
      setCredits((prev) => (prev !== null ? Math.max(0, prev - 1) : null));

      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: data.image,
        prompt,
        model: selectedModel,
        timestamp: new Date(),
      };

      setCurrentImage(newImage);
      setHistory((prev) => [newImage, ...prev].slice(0, 8));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (img: GeneratedImage) => {
    const link = document.createElement("a");
    link.href = img.url;
    link.download = `eromify-ai-${img.id}.jpg`;
    link.click();
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
    textareaRef.current?.focus();
  };

  const modelInfo = MODELS.find((m) => m.id === selectedModel) ?? MODELS[0];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {/* ── Hero Header ────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-white/5 pb-14 pt-16">
          {/* Background glows */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/4 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-600/15 blur-[130px]" />
            <div className="absolute right-1/4 top-0 h-96 w-96 translate-x-1/2 rounded-full bg-blue-600/15 blur-[130px]" />
            <div className="absolute bottom-0 left-1/2 h-48 w-[600px] -translate-x-1/2 rounded-full bg-violet-500/8 blur-[80px]" />
          </div>

          <div className="relative mx-auto max-w-5xl px-4 text-center">

            {/* Models pill */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/8 px-4 py-1.5 text-xs font-bold text-violet-300 backdrop-blur-sm">
              <Cpu className="h-3.5 w-3.5" />
              {MODELS.length} AI Models Available
            </div>

            {/* Title */}
            <h1 className="mb-4 text-5xl font-black tracking-tight text-white md:text-7xl">
              AI Image{" "}
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Generator
              </span>
            </h1>

            <p className="mx-auto max-w-xl text-base text-slate-400 leading-relaxed">
              Transform your imagination into stunning visuals using the world&apos;s
              most advanced AI models. No limits, no watermarks.
            </p>

            {/* Credits badge — only when authenticated */}
            {status === "authenticated" && credits !== null && (
              <div className="mt-7 flex items-center justify-center">
                <div
                  className="inline-flex items-center gap-3 rounded-2xl px-5 py-3 shadow-2xl"
                  style={{
                    background: "linear-gradient(135deg,rgba(15,15,30,0.95),rgba(20,20,45,0.95))",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(16px)",
                    boxShadow: "0 0 0 1px rgba(124,58,237,0.1), 0 20px 40px rgba(0,0,0,0.5)",
                  }}
                >
                  {/* Flame icon box */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: credits > 0
                        ? "linear-gradient(135deg,#7c3aed,#a855f7)"
                        : "linear-gradient(135deg,#dc2626,#ef4444)",
                      boxShadow: credits > 0
                        ? "0 0 16px rgba(124,58,237,0.5)"
                        : "0 0 16px rgba(239,68,68,0.4)",
                    }}
                  >
                    <Flame className="h-4.5 w-4.5 text-white" style={{ width: "18px", height: "18px" }} />
                  </div>

                  {/* Label + count */}
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
                      Credits Available
                    </p>
                    <p
                      className="text-xl font-black tabular-nums leading-none"
                      style={{ color: credits > 0 ? "#c084fc" : "#f87171" }}
                    >
                      {credits}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-8" style={{ background: "rgba(255,255,255,0.08)" }} />

                  {/* Buy More button */}
                  <button
                    onClick={() => setPayModal({ open: true, mode: "payment" })}
                    className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black text-white transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                      boxShadow: "0 0 14px rgba(124,58,237,0.4)",
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Buy More
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Main Content ───────────────────────────────────────────────────── */}
        <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
            {/* LEFT — Controls */}
            <div className="space-y-6">
              {/* Prompt */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <label className="mb-3 block text-sm font-bold text-slate-300">
                  ✍️ Image Prompt
                </label>
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to create in vivid detail…"
                  rows={4}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
                />

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-xs font-medium text-slate-500">Examples:</span>
                  {PROMPT_EXAMPLES.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => handleExampleClick(ex)}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400 transition hover:border-violet-500/50 hover:text-violet-300"
                    >
                      {ex.substring(0, 38)}…
                    </button>
                  ))}
                </div>
              </div>

              {/* Model Selector — compact dropdown */}
              <div className="relative">
                <p className="mb-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Model</p>
                <button
                  onClick={() => setModelDropdownOpen((o) => !o)}
                  className="w-full flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-xs transition hover:border-violet-500/30 hover:bg-white/8 focus:outline-none"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-white truncate">{modelInfo.label}</span>
                    {modelInfo.tag && <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-black text-emerald-400 uppercase">{modelInfo.tag}</span>}
                    <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-bold", modelInfo.badgeColor)}>{modelInfo.badge}</span>
                  </div>
                  <ChevronDown className={cn("h-3.5 w-3.5 text-slate-400 flex-shrink-0 transition-transform duration-200", modelDropdownOpen && "rotate-180")} />
                </button>

                {modelDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full rounded-lg border border-white/10 bg-slate-900 shadow-2xl shadow-black/50 overflow-hidden">
                    {MODELS.map((model, idx) => (
                      <button
                        key={model.id}
                        onClick={() => { setSelectedModel(model.id); setModelDropdownOpen(false); }}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 text-left transition-all text-xs",
                          idx !== MODELS.length - 1 && "border-b border-white/5",
                          selectedModel === model.id ? "bg-violet-500/15" : "hover:bg-white/5"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className={cn("font-semibold truncate", selectedModel === model.id ? "text-violet-300" : "text-white")}>{model.label}</span>
                          {model.tag && <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-black text-emerald-400 uppercase">{model.tag}</span>}
                          <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-bold", model.badgeColor)}>{model.badge}</span>
                        </div>
                        {selectedModel === model.id && <div className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT — Output */}
            <div className="space-y-6">
              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className={cn(
                  "group relative w-full overflow-hidden rounded-2xl py-5 text-base font-black transition-all",
                  !prompt.trim() || isGenerating
                    ? "cursor-not-allowed bg-white/5 text-slate-600"
                    : "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-xl shadow-violet-500/25 hover:from-violet-500 hover:to-blue-500 hover:shadow-violet-500/40"
                )}
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-3">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Generating with {modelInfo.label}…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <Wand2 className="h-5 w-5 transition-transform group-hover:rotate-12" />
                    Generate Image
                  </span>
                )}
                {/* Shimmer effect */}
                {!isGenerating && prompt.trim() && (
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                )}
              </button>

              {/* Model info badge */}
              <div className="flex items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-3">
                <span className="text-lg">{modelInfo.icon}</span>
                <div>
                  <p className="text-xs font-bold text-slate-300">
                    {modelInfo.label}
                    <span className={cn("ml-2 rounded px-1.5 py-0.5 text-[10px]", modelInfo.badgeColor)}>
                      {modelInfo.badge}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500">{modelInfo.description}</p>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* Result Image */}
              {isGenerating && !currentImage && (
                <div className="flex aspect-square items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-center space-y-4">
                    <div className="mx-auto h-16 w-16 rounded-full border-4 border-violet-500/30 border-t-violet-500 animate-spin" />
                    <p className="text-sm text-slate-400">
                      Crafting your image…
                      <br />
                      <span className="text-xs text-slate-600">
                        This may take 15–60 seconds. Please don&apos;t close the tab.
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {currentImage && (
                <div className="group relative overflow-hidden rounded-2xl border border-white/10">
                  <Image
                    src={currentImage.url}
                    alt={currentImage.prompt}
                    width={1024}
                    height={1024}
                    className="w-full object-cover"
                    unoptimized
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex-1 pr-3">
                      <p className="line-clamp-2 text-xs text-white/80">
                        {currentImage.prompt}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setLightboxImage(currentImage)}
                        className="rounded-lg bg-white/20 p-2 text-white backdrop-blur-sm transition hover:bg-white/30"
                      >
                        <ZoomIn className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(currentImage)}
                        className="rounded-lg bg-violet-500 p-2 text-white transition hover:bg-violet-400"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="absolute right-3 top-3 flex gap-2">
                    <span className="rounded-lg bg-black/60 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                      {currentImage.model.toUpperCase()}
                    </span>
                  </div>
                </div>
              )}

              {!currentImage && !isGenerating && (
                <div className="flex aspect-square flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/10 bg-white/3 text-center">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <Wand2 className="h-10 w-10 text-violet-400" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-300">Your image will appear here</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Write a prompt and click Generate
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── History Grid ─────────────────────────────────────────────────── */}
          {history.length > 1 && (
            <section className="mt-16">
              <div className="mb-6 flex items-center gap-3">
                <Clock className="h-5 w-5 text-slate-400" />
                <h2 className="text-xl font-black text-white">Recent Generations</h2>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold text-slate-400">
                  {history.length}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {history.map((img) => (
                  <div
                    key={img.id}
                    className="group relative cursor-pointer overflow-hidden rounded-xl border border-white/10"
                    onClick={() => setLightboxImage(img)}
                  >
                    <Image
                      src={img.url}
                      alt={img.prompt}
                      width={400}
                      height={400}
                      className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />
                    <div className="absolute inset-0 flex flex-col items-start justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="line-clamp-2 text-xs text-white/80">{img.prompt}</p>
                      <span className="mt-1.5 rounded bg-violet-500/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {img.model}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>


        {/* ── Example Outputs ───────────────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/5" />
            <h2 className="text-lg font-black text-white">Example Outputs</h2>
            <div className="h-px flex-1 bg-white/5" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              "/sofia/image.webp",
              "/sofia/s.webp",
              "/sofia/soff.webp",
              "/sofia/sofia.webp",
              "/sofia/sofiaaa.webp",
              "/sofia/sofiiiia.webp",
            ].map((src) => (
              <div
                key={src}
                className="overflow-hidden rounded-xl border border-white/10 bg-white/5"
              >
                <Image
                  src={src}
                  alt="Example output"
                  width={400}
                  height={400}
                  className="aspect-square w-full object-cover"
                />
              </div>
            ))}
          </div>
        </section>


        {/* ── Lightbox ─────────────────────────────────────────────────────── */}

        {lightboxImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-lg"
            onClick={() => setLightboxImage(null)}
          >
            <button
              className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
              onClick={() => setLightboxImage(null)}
            >
              <X className="h-5 w-5" />
            </button>
            <div
              className="relative max-h-[90vh] max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightboxImage.url}
                alt={lightboxImage.prompt}
                width={1024}
                height={1024}
                className="max-h-[80vh] rounded-2xl object-contain shadow-2xl"
                unoptimized
              />
              <div className="mt-4 flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                <p className="flex-1 pr-4 text-sm text-white/80">{lightboxImage.prompt}</p>
                <button
                  onClick={() => handleDownload(lightboxImage)}
                  className="flex items-center gap-2 rounded-lg bg-violet-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-violet-400"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            </div>
          </div>
        )}
      </div>


      {/* ── Pay Modal ─────────────────────────────────────────────────────── */}
      <ImageGenPayModal
        isOpen={payModal.open}
        mode={payModal.mode}
        onClose={() => setPayModal({ ...payModal, open: false })}
        onSuccess={(creditsAdded) => {
          // Optimistic instant update so the user sees the new balance immediately
          if (creditsAdded) setCredits((prev) => (prev ?? 0) + creditsAdded);
          setPayModal({ ...payModal, open: false });
          // Then re-fetch from server to confirm the actual balance
          fetchCredits();
        }}
      />
    </>
  );
}
