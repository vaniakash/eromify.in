"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  Upload,
  X,
  Wand2,
  Download,
  RefreshCw,
  Sparkles,
  ArrowRight,
  AlertCircle,
  ImageIcon,
  ChevronLeft,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageGenPayModal } from "@/components/ImageGenPayModal";

function DropZone({
  label,
  sublabel,
  preview,
  onFile,
  onClear,
  accent,
}: {
  label: string;
  sublabel: string;
  preview: string | null;
  onFile: (dataUri: string) => void;
  onClear: () => void;
  accent: "violet" | "blue";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => onFile(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const colors = {
    violet: {
      border: dragging ? "border-violet-400" : "border-violet-500/30",
      bg: dragging ? "bg-violet-500/10" : "bg-violet-500/5",
      icon: "text-violet-400",
      badge: "bg-violet-500/20 text-violet-300 border-violet-500/30",
      btn: "bg-violet-600 hover:bg-violet-500",
    },
    blue: {
      border: dragging ? "border-blue-400" : "border-blue-500/30",
      bg: dragging ? "bg-blue-500/10" : "bg-blue-500/5",
      icon: "text-blue-400",
      badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      btn: "bg-blue-600 hover:bg-blue-500",
    },
  }[accent];

  return (
    <div className="flex flex-col gap-3 flex-1 min-w-0">
      {/* Label */}
      <div className="flex items-center gap-2">
        <span className={cn("text-[10px] font-bold uppercase tracking-widest border rounded-full px-2.5 py-0.5", colors.badge)}>
          {label}
        </span>
        <span className="text-xs text-slate-500">{sublabel}</span>
      </div>

      {/* Drop area */}
      <div
        className={cn(
          "relative flex-1 rounded-2xl border-2 border-dashed transition-all duration-200 overflow-hidden",
          colors.border,
          colors.bg,
          preview ? "aspect-square" : "aspect-square"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !preview && inputRef.current?.click()}
        style={{ cursor: preview ? "default" : "pointer" }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
        />

        {preview ? (
          <>
            <Image
              src={preview}
              alt={label}
              fill
              className="object-contain"
              unoptimized
            />
            {/* Clear btn */}
            <button
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition backdrop-blur-sm z-10"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            {/* Change btn */}
            <button
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              className="absolute bottom-2 right-2 text-[10px] font-bold rounded-lg bg-black/60 text-white px-2.5 py-1.5 hover:bg-black/80 transition backdrop-blur-sm"
            >
              Change
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
            <div className={cn("w-14 h-14 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center", colors.icon)}>
              <Upload className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-white">Drop image here</p>
              <p className="text-xs text-slate-500 mt-1">or click to browse</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              className={cn("text-xs font-bold text-white rounded-xl px-4 py-2 transition", colors.btn)}
            >
              Choose Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ImageEditorPage() {
  const { status } = useSession();

  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [refDimensions, setRefDimensions] = useState<{ width: number; height: number } | null>(null);
  const [targetImage, setTargetImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [payModal, setPayModal] = useState({ open: false, mode: "payment" as "payment" | "login" });

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

  // Detect reference image natural dimensions to match output aspect ratio
  const handleReferenceImage = (dataUri: string) => {
    setReferenceImage(dataUri);
    const img = new window.Image();
    img.onload = () => {
      // Cap at 1024 on the longest side, snap to nearest multiple of 8
      const snap = (n: number) => Math.round(n / 8) * 8;
      const maxSide = 1024;
      const { naturalWidth: w, naturalHeight: h } = img;
      const ratio = w / h;
      let width: number, height: number;
      if (w >= h) {
        width = maxSide;
        height = snap(maxSide / ratio);
      } else {
        height = maxSide;
        width = snap(maxSide * ratio);
      }
      setRefDimensions({ width, height });
    };
    img.src = dataUri;
  };

  const handleGenerate = async () => {
    if (!referenceImage || !targetImage || isGenerating) return;

    if (status !== "authenticated") {
      window.location.href = "/login";
      return;
    }

    if (credits !== null && credits <= 0) {
      setPayModal({ open: true, mode: "payment" });
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/image-editor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceImage,
          targetImage,
          prompt,
          width: refDimensions?.width ?? 1024,
          height: refDimensions?.height ?? 1024,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "INSUFFICIENT_CREDITS") {
          setError("Not enough credits. Please purchase more to continue.");
        } else {
          throw new Error(data.error || "Edit failed");
        }
        return;
      }

      setResult(data.image);
      // Refresh credits after successful generation
      fetchCredits();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = `edited-${Date.now()}.jpg`;
    a.click();
  };

  const canGenerate = !!referenceImage && !!targetImage && !isGenerating && credits !== 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/5 pb-12 pt-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-600/15 blur-[120px]" />
          <div className="absolute right-1/4 top-0 h-72 w-72 translate-x-1/2 rounded-full bg-blue-600/15 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 text-center">
          <a
            href="/tools/creator"
            className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-300 transition"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Creator Tools
          </a>

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm font-bold text-violet-300">
            <Sparkles className="h-3.5 w-3.5" />
            Powered by GPT Image 1.5
          </div>

          <h1 className="mb-4 text-5xl font-black tracking-tight text-white md:text-6xl">
            AI Image{" "}
            <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              Editor
            </span>
          </h1>
          <p className="mx-auto max-w-xl text-slate-400 leading-relaxed">
            Transfer outfits, lighting, and style from a reference photo onto your own image — powered by GPT Image 1.5.
          </p>
          {/* Credit pill */}
          {status === "authenticated" && credits !== null && (
            <div
              className={cn(
                "mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold cursor-pointer transition",
                credits > 0
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15"
                  : "border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/15"
              )}
              onClick={() => credits <= 0 && setPayModal({ open: true, mode: "payment" })}
            >
              <Zap className="w-3 h-3" />
              {credits > 0 ? <>{credits} credits remaining · 1 credit per edit</> : <>No credits — Buy more</>}
            </div>
          )}
        </div>
      </section>

      {/* ── Main ── */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">

          {/* LEFT — Reference Image */}
          <div className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm h-full flex flex-col">
              <h2 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-violet-400" />
                Style Reference
              </h2>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Upload the image whose <strong className="text-slate-300">outfit, lighting & style</strong> you want to copy.
              </p>
              <div className="flex-1">
                <DropZone
                  label="Reference"
                  sublabel="Outfit / Style source"
                  preview={referenceImage}
                  onFile={handleReferenceImage}
                  onClear={() => { setReferenceImage(null); setRefDimensions(null); }}
                  accent="violet"
                />
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden lg:flex items-center justify-center pt-8">
            <div className="flex flex-col items-center gap-2 text-slate-600">
              <ArrowRight className="w-6 h-6" />
              <span className="text-[10px] font-bold uppercase tracking-wider">applies to</span>
            </div>
          </div>

          {/* CENTER — Your Photo */}
          <div className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm h-full flex flex-col">
              <h2 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                Your Photo
              </h2>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Upload your photo. The style will be applied while keeping your <strong className="text-slate-300">face & identity</strong> unchanged.
              </p>
              <div className="flex-1">
                <DropZone
                  label="Target"
                  sublabel="Your photo"
                  preview={targetImage}
                  onFile={setTargetImage}
                  onClear={() => setTargetImage(null)}
                  accent="blue"
                />
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden lg:flex items-center justify-center pt-8">
            <div className="flex flex-col items-center gap-2 text-slate-600">
              <ArrowRight className="w-6 h-6" />
              <span className="text-[10px] font-bold uppercase tracking-wider">result</span>
            </div>
          </div>

          {/* RIGHT — Result */}
          <div className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm h-full flex flex-col">
              <h2 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Result
              </h2>

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className={cn(
                  "w-full mb-4 rounded-xl py-3 text-sm font-black transition-all flex items-center justify-center gap-2",
                  canGenerate
                    ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-blue-500"
                    : "bg-white/5 text-slate-600 cursor-not-allowed"
                )}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Editing image…
                  </>
                ) : credits !== null && credits <= 0 ? (
                  <>
                    <Zap className="w-4 h-4" />
                    Buy Credits to Edit
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Apply Style Transfer · <span className="opacity-70 text-[11px] font-semibold">1 credit</span>
                  </>
                )}
              </button>

              {/* Optional custom prompt */}
              <div className="mb-4">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Custom instruction (optional)
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Also change hair color to blonde"
                  rows={2}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-300">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              {/* Result area */}
              <div className="flex-1 relative">
                {isGenerating && (
                  <div className="aspect-square rounded-xl border border-white/10 bg-white/5 flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-violet-500/30 border-t-violet-500 animate-spin" />
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-300">Applying style…</p>
                      <p className="text-xs text-slate-600 mt-1">This can take 30–90 seconds</p>
                    </div>
                  </div>
                )}

                {result && !isGenerating && (
                  <div className="relative group rounded-xl overflow-hidden border border-white/10">
                    <Image
                      src={result}
                      alt="Edited result"
                      width={512}
                      height={512}
                      className="w-full object-contain"
                      unoptimized
                    />
                    {/* Download overlay */}
                    <div className="absolute inset-0 flex items-end justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 to-transparent">
                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-500 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>
                    </div>
                  </div>
                )}

                {!result && !isGenerating && (
                  <div className="aspect-square rounded-xl border border-dashed border-white/10 bg-white/3 flex flex-col items-center justify-center gap-3 text-center p-6">
                    <div className="w-12 h-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
                      <Wand2 className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-500">Result appears here</p>
                      <p className="text-xs text-slate-700 mt-1">Upload both images to begin</p>
                    </div>
                  </div>
                )}

                {result && !isGenerating && (
                  <button
                    onClick={handleGenerate}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-semibold text-slate-400 hover:bg-white/10 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Example ── */}
        <section className="mt-16 mb-8">
          <div className="mb-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/5" />
            <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest">Example Output</h2>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 items-center">
            {/* Step 1 — Reference */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 px-2.5 py-0.5">
                  Step 1
                </span>
                <span className="text-xs text-slate-500">Style Reference</span>
              </div>
              <div className="overflow-hidden rounded-2xl border border-violet-500/20 bg-white/5 aspect-square relative">
                <Image
                  src="/transfermodel/referance.webp"
                  alt="Style reference example"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <p className="text-xs font-bold text-white">Reference Photo</p>
                  <p className="text-[10px] text-slate-400">Outfit & style to copy</p>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden sm:flex flex-col items-center gap-1 text-slate-700">
              <ArrowRight className="w-5 h-5" />
              <span className="text-[9px] font-bold uppercase tracking-wider">applies to</span>
            </div>

            {/* Step 2 — Your Photo */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 px-2.5 py-0.5">
                  Step 2
                </span>
                <span className="text-xs text-slate-500">Your Photo</span>
              </div>
              <div className="overflow-hidden rounded-2xl border border-blue-500/20 bg-white/5 aspect-square relative">
                <Image
                  src="/transfermodel/imageone.webp"
                  alt="Target photo example"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <p className="text-xs font-bold text-white">Your Photo</p>
                  <p className="text-[10px] text-slate-400">Face stays unchanged</p>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden sm:flex flex-col items-center gap-1 text-slate-700">
              <ArrowRight className="w-5 h-5" />
              <span className="text-[9px] font-bold uppercase tracking-wider">result</span>
            </div>

            {/* Step 3 — Output */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 px-2.5 py-0.5">
                  Step 3
                </span>
                <span className="text-xs text-slate-500">AI Output</span>
              </div>
              <div className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-white/5 aspect-square relative ring-2 ring-emerald-500/20">
                <Image
                  src="/transfermodel/output.webp"
                  alt="Output example"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <p className="text-xs font-bold text-white">Final Result</p>
                  <p className="text-[10px] text-emerald-400">Style transferred ✓</p>
                </div>
                {/* Sparkle badge */}
                <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                  <span className="text-[9px] font-bold text-emerald-300">GPT Image 1.5</span>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-5 text-center text-xs text-slate-700">
            Results may vary depending on image quality and prompt. © Your photos are never shared publicly.
          </p>
        </section>
      </main>

      {/* ── Pay Modal ── */}
      <ImageGenPayModal
        isOpen={payModal.open}
        mode={payModal.mode}
        onClose={() => setPayModal({ ...payModal, open: false })}
        onSuccess={(creditsAdded) => {
          if (creditsAdded) setCredits((prev) => (prev ?? 0) + creditsAdded);
          setPayModal({ ...payModal, open: false });
          fetchCredits();
        }}
      />
    </div>
  );
}
