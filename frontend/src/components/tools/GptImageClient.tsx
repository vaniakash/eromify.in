"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  Wand2,
  Download,
  RefreshCw,
  Sparkles,
  ZoomIn,
  X,
  Clock,
  AlertCircle,
  ImagePlus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { ImageGenPayModal } from "@/components/ImageGenPayModal";

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  mode: "text-to-image" | "image-to-image";
  timestamp: Date;
}

const PROMPT_EXAMPLES = [
  "A glowing neon samurai warrior in a rainy cyberpunk city",
  "Minimalist product shot of a luxury perfume bottle on white marble",
  "An astronaut riding a horse on the surface of Mars, photorealistic",
  "Watercolor painting of a Japanese zen garden at sunrise",
  "Epic fantasy dragon perched on a mountain castle at golden hour",
];

const MODES = [
  {
    id: "text-to-image",
    label: "✍️ Text to Image",
    desc: "Generate from a text prompt",
  },
  {
    id: "image-to-image",
    label: "🖼️ Image to Image",
    desc: "Transform an uploaded image",
  },
] as const;

type Mode = (typeof MODES)[number]["id"];

export default function GptImageClient() {
  const [mode, setMode] = useState<Mode>("text-to-image");
  const [prompt, setPrompt] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [lightboxImage, setLightboxImage] = useState<GeneratedImage | null>(null);
  const [payModal, setPayModal] = useState<{ open: boolean; mode: "login" | "payment" }>({
    open: false,
    mode: "payment",
  });
  const [credits, setCredits] = useState<number | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { status } = useSession();

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

  const handleImageUpload = useCallback((file: File) => {
    setUploadedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setUploadedPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const clearUploadedImage = () => {
    setUploadedImage(null);
    setUploadedPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    if (mode === "image-to-image" && !uploadedImage) {
      setError("Please upload a source image for image-to-image mode.");
      return;
    }

    // Auth guard — must be logged in
    if (status !== "authenticated") {
      window.location.href = "/login";
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
      const fd = new FormData();
      fd.append("prompt", prompt.trim());
      // Text-to-image uses gptimage; image-to-image goes through kontext fallback in the API
      fd.append("model", "gptimage");
      if (mode === "image-to-image" && uploadedImage) {
        fd.append("image", uploadedImage);
      }

      const res = await fetch("/api/generate-image-gpt", { method: "POST", body: fd });
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
        prompt: prompt.trim(),
        mode,
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
    link.download = `eromify-gptimage-${img.id}.png`;
    link.click();
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-white/5 pb-16 pt-20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/3 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-pink-600/20 blur-[100px]" />
            <div className="absolute right-1/3 top-0 h-72 w-72 translate-x-1/2 rounded-full bg-orange-500/15 blur-[100px]" />
          </div>
          <div className="relative mx-auto max-w-5xl px-4 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-1.5 text-sm font-semibold text-pink-300">
              <Sparkles className="h-3.5 w-3.5" />
              Powered by OpenAI GPT Image 1 via Pollinations.AI
            </div>
            <h1 className="mb-4 text-5xl font-black tracking-tight text-white md:text-7xl">
              GPT Image{" "}
              <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
                1 Mini
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-400">
              OpenAI&apos;s GPT Image 1 model — fast, high-quality image generation from text, or
              transform any uploaded image with a prompt.
            </p>

            {status === "authenticated" && credits !== null && (
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-pink-500/20 bg-pink-500/10 px-4 py-2 text-sm font-bold text-white shadow-xl backdrop-blur-md">
                <span className="text-pink-400">⚡</span>
                Credits Available: <span className="text-pink-300">{credits}</span>
                <button 
                  onClick={() => setPayModal({ open: true, mode: "payment" })}
                  className="ml-2 rounded bg-white/10 px-2 py-0.5 text-xs transition hover:bg-white/20"
                >
                  Buy More
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ── Main ─────────────────────────────────────────────────────────── */}
        <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            {/* LEFT — Controls */}
            <div className="space-y-6">

              {/* Mode Selector */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <label className="mb-4 block text-sm font-bold text-slate-300">⚡ Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  {MODES.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setMode(m.id);
                        setError(null);
                      }}
                      className={cn(
                        "rounded-xl border p-4 text-left transition-all",
                        mode === m.id
                          ? "border-pink-500/60 bg-pink-500/15 ring-2 ring-pink-500/30"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      )}
                    >
                      <p className="text-sm font-bold text-white">{m.label}</p>
                      <p className="mt-1 text-xs text-slate-400">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Upload — image-to-image mode only */}
              {mode === "image-to-image" && (
                <div className="rounded-2xl border border-pink-500/20 bg-pink-500/5 p-6 backdrop-blur-sm">
                  <label className="mb-3 block text-sm font-bold text-pink-300">
                    <ImagePlus className="mr-2 inline h-4 w-4" />
                    Source Image
                    <span className="ml-2 text-xs font-normal text-slate-500">
                      (required for this mode)
                    </span>
                  </label>

                  {uploadedPreview ? (
                    <div className="relative overflow-hidden rounded-xl border border-pink-500/30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={uploadedPreview}
                        alt="Source"
                        className="max-h-56 w-full bg-black/30 object-contain"
                      />
                      <button
                        onClick={clearUploadedImage}
                        className="absolute right-2 top-2 flex items-center gap-1 rounded-lg bg-red-500/80 px-2 py-1 text-xs font-bold text-white backdrop-blur-sm transition hover:bg-red-500"
                      >
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="gpt-img-upload"
                      className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-pink-500/30 bg-pink-500/5 p-8 text-center transition hover:border-pink-500/60 hover:bg-pink-500/10"
                    >
                      <ImagePlus className="h-8 w-8 text-pink-400" />
                      <div>
                        <p className="text-sm font-semibold text-pink-300">Click to upload</p>
                        <p className="mt-1 text-xs text-slate-500">PNG, JPG, WEBP · max 20 MB</p>
                      </div>
                      <input
                        id="gpt-img-upload"
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleImageUpload(f);
                        }}
                      />
                    </label>
                  )}
                </div>
              )}

              {/* Prompt */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <label className="mb-3 block text-sm font-bold text-slate-300">
                  ✍️{" "}
                  {mode === "image-to-image" ? "Edit Instruction" : "Image Prompt"}
                </label>
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    mode === "image-to-image"
                      ? "Describe how to transform the image… e.g. make it anime style"
                      : "Describe the image you want to create in vivid detail…"
                  }
                  rows={4}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/20"
                />

                {mode === "text-to-image" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs font-medium text-slate-500">Examples:</span>
                    {PROMPT_EXAMPLES.map((ex, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setPrompt(ex);
                          textareaRef.current?.focus();
                        }}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400 transition hover:border-pink-500/50 hover:text-pink-300"
                      >
                        {ex.substring(0, 40)}…
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
                disabled={
                  !prompt.trim() ||
                  isGenerating ||
                  (mode === "image-to-image" && !uploadedImage)
                }
                className={cn(
                  "group relative w-full overflow-hidden rounded-2xl py-5 text-base font-black transition-all",
                  !prompt.trim() || isGenerating || (mode === "image-to-image" && !uploadedImage)
                    ? "cursor-not-allowed bg-white/5 text-slate-600"
                    : "bg-gradient-to-r from-pink-600 to-orange-500 text-white shadow-xl shadow-pink-500/25 hover:from-pink-500 hover:to-orange-400 hover:shadow-pink-500/40"
                )}
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-3">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Generating with GPT Image 1…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <Wand2 className="h-5 w-5 transition-transform group-hover:rotate-12" />
                    Generate Image
                  </span>
                )}
                {!isGenerating && prompt.trim() && (
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                )}
              </button>

              {/* Model Badge */}
              <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                <span className="text-lg">✨</span>
                <div>
                  <p className="text-xs font-bold text-slate-300">
                    GPT Image 1 Mini
                    <span className="ml-2 rounded bg-pink-500/20 px-1.5 py-0.5 text-[10px] text-pink-300">
                      OpenAI
                    </span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {mode === "image-to-image"
                      ? "Image editing via FLUX Kontext"
                      : "Fast, high-quality text-to-image generation"}
                  </p>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* Spinner while generating */}
              {isGenerating && !currentImage && (
                <div className="flex aspect-square items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <div className="space-y-4 text-center">
                    <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-pink-500/30 border-t-pink-500" />
                    <p className="text-sm text-slate-400">
                      Crafting your image…
                      <br />
                      <span className="text-xs text-slate-600">
                        GPT Image 1 may take 20–60 s. Please don&apos;t close the tab.
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* Result */}
              {currentImage && !isGenerating && (
                <div className="group relative overflow-hidden rounded-2xl border border-white/10">
                  <Image
                    src={currentImage.url}
                    alt={currentImage.prompt}
                    width={1024}
                    height={1024}
                    className="w-full object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="flex-1 pr-3 line-clamp-2 text-xs text-white/80">
                      {currentImage.prompt}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setLightboxImage(currentImage)}
                        className="rounded-lg bg-white/20 p-2 text-white backdrop-blur-sm transition hover:bg-white/30"
                      >
                        <ZoomIn className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(currentImage)}
                        className="rounded-lg bg-pink-500 p-2 text-white transition hover:bg-pink-400"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="absolute right-3 top-3">
                    <span className="rounded-lg bg-black/60 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                      {currentImage.mode === "image-to-image" ? "IMG→IMG" : "GPT IMAGE 1"}
                    </span>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!currentImage && !isGenerating && (
                <div className="flex aspect-square flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/10 bg-white/3 text-center">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <Wand2 className="h-10 w-10 text-pink-400" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-300">Your image will appear here</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {mode === "image-to-image"
                        ? "Upload an image and write an instruction"
                        : "Write a prompt and click Generate"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* History */}
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
                      <span className="mt-1.5 rounded bg-pink-500/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {img.mode === "image-to-image" ? "IMG→IMG" : "GPT IMAGE 1"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Lightbox */}
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
                  className="flex items-center gap-2 rounded-lg bg-pink-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-pink-400"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Pay Modal */}
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


    </>
  );
}
