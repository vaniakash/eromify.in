"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Download,
  Trash2,
  ZoomIn,
  X,
  Wand2,
  ImageIcon,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Sparkles,
  Clock,
  AlertCircle,
} from "lucide-react";

interface StudioImage {
  _id: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  prompt: string;
  model?: string;
  mode: string;
  createdAt: string;
}

const MODEL_LABELS: Record<string, string> = {
  "gpt-image-2": "GPT Image 2",
  "gptimage-large": "GPT Image 1.5",
  "wan-image": "Wan 2.7",
  "qwen-image": "Qwen Image+",
  flux: "Flux Schnell",
  zimage: "Z-Image Turbo",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function StudioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [images, setImages] = useState<StudioImage[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<StudioImage | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?callbackUrl=/studio");
    }
  }, [status, router]);

  const fetchImages = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/studio/images?page=${p}&limit=20`);
      if (!res.ok) throw new Error("Failed to load your studio");
      const data = await res.json();
      setImages(data.images ?? []);
      setTotal(data.total ?? 0);
      setPage(data.page ?? 1);
      setPages(data.pages ?? 1);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchImages(page);
  }, [status, fetchImages, page]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this image? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/studio/images?id=${id}`, { method: "DELETE" });
      setImages((prev) => prev.filter((img) => img._id !== id));
      setTotal((t) => t - 1);
      if (lightbox?._id === id) setLightbox(null);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (img: StudioImage) => {
    try {
      const res = await fetch(img.cloudinaryUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `studio-${img._id}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(img.cloudinaryUrl, "_blank");
    }
  };

  const handleCopyPrompt = (img: StudioImage) => {
    navigator.clipboard.writeText(img.prompt).then(() => {
      setCopiedId(img._id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Lightbox keyboard nav
  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") {
        const idx = images.findIndex((i) => i._id === lightbox._id);
        if (idx < images.length - 1) setLightbox(images[idx + 1]);
      }
      if (e.key === "ArrowLeft") {
        const idx = images.findIndex((i) => i._id === lightbox._id);
        if (idx > 0) setLightbox(images[idx - 1]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, images]);

  if (status === "loading" || (status === "authenticated" && loading && images.length === 0)) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-500/20 flex items-center justify-center">
            <Loader2 className="w-7 h-7 text-violet-400 animate-spin" />
          </div>
          <p className="text-slate-500 text-sm font-medium">Loading your Studio…</p>
        </div>
      </div>
    );
  }

  const lightboxIdx = lightbox ? images.findIndex((i) => i._id === lightbox._id) : -1;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body { background: #080810; font-family: 'Inter', sans-serif; }
        .studio-bg {
          background: #080810;
          min-height: 100vh;
        }
        /* Masonry-like grid */
        .studio-grid {
          columns: 2;
          column-gap: 12px;
          gap: 12px;
        }
        @media (min-width: 640px) { .studio-grid { columns: 3; } }
        @media (min-width: 1024px) { .studio-grid { columns: 4; } }
        @media (min-width: 1280px) { .studio-grid { columns: 5; } }
        .studio-card {
          break-inside: avoid;
          margin-bottom: 12px;
          display: inline-block;
          width: 100%;
        }
        /* Scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      `}</style>

      <div className="studio-bg">
        {/* ── Header ── */}
        <header className="sticky top-0 z-40 border-b border-white/5 bg-[#080810]/80 backdrop-blur-xl">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push("/tools/creator/image-generator")}
                  className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition"
                  title="Back to Generator"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-sm font-bold text-white leading-none">My Studio</h1>
                    <p className="text-[10px] text-slate-500 mt-0.5">Your AI creations</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {total > 0 && (
                  <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-semibold text-slate-400">
                    <ImageIcon className="w-3 h-3" />
                    {total} image{total !== 1 ? "s" : ""}
                  </span>
                )}
                <button
                  onClick={() => router.push("/tools/creator/image-generator")}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-blue-500"
                >
                  <Wand2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Generate New</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* ── Main Content ── */}
        <main className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-8">

          {/* Error */}
          {error && (
            <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-sm text-red-300">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">{error}</p>
                <button
                  onClick={() => fetchImages(1)}
                  className="mt-1 text-xs underline text-red-400 hover:text-red-300"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && images.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
              <div className="relative">
                <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-white/10 flex items-center justify-center">
                  <Wand2 className="w-12 h-12 text-violet-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-black text-white mb-2">Your Studio is empty</h2>
                <p className="text-slate-500 text-sm max-w-xs">
                  Every image you generate will be saved here automatically. Start creating!
                </p>
              </div>
              <button
                onClick={() => router.push("/tools/creator/image-generator")}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-3 font-bold text-white shadow-xl shadow-violet-500/25 hover:from-violet-500 hover:to-blue-500 transition"
              >
                <Wand2 className="w-5 h-5" />
                Generate Your First Image
              </button>
            </div>
          )}

          {/* Masonry Grid */}
          {images.length > 0 && (
            <>
              <div className="studio-grid">
                {images.map((img) => (
                  <div
                    key={img._id}
                    className="studio-card group relative overflow-hidden rounded-2xl border border-white/8 bg-white/3 cursor-pointer transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-black/60 hover:-translate-y-0.5"
                    onClick={() => setLightbox(img)}
                  >
                    {/* Image */}
                    <div className="relative overflow-hidden">
                      <Image
                        src={img.cloudinaryUrl}
                        alt={img.prompt}
                        width={600}
                        height={600}
                        className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        unoptimized
                      />

                      {/* Top model badge */}
                      {img.model && (
                        <div className="absolute top-2 left-2">
                          <span className="rounded-lg bg-black/60 px-2 py-1 text-[9px] font-bold text-white/80 backdrop-blur-sm uppercase tracking-wider">
                            {MODEL_LABELS[img.model] ?? img.model}
                          </span>
                        </div>
                      )}

                      {/* Action buttons on hover */}
                      <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDownload(img); }}
                          className="w-8 h-8 rounded-lg bg-black/60 text-white flex items-center justify-center hover:bg-violet-600 transition backdrop-blur-sm"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCopyPrompt(img); }}
                          className="w-8 h-8 rounded-lg bg-black/60 text-white flex items-center justify-center hover:bg-blue-600 transition backdrop-blur-sm"
                          title="Copy prompt"
                        >
                          {copiedId === img._id
                            ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                            : <Copy className="w-3.5 h-3.5" />
                          }
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(img._id); }}
                          disabled={deletingId === img._id}
                          className="w-8 h-8 rounded-lg bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition backdrop-blur-sm disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === img._id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Trash2 className="w-3.5 h-3.5" />
                          }
                        </button>
                      </div>

                      {/* Bottom overlay with prompt */}
                      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <p className="text-xs text-white/80 line-clamp-2 leading-relaxed">
                          {img.prompt}
                        </p>
                        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-slate-500">
                          <Clock className="w-3 h-3" />
                          {timeAgo(img.createdAt)}
                        </div>
                      </div>

                      {/* Zoom hint */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="rounded-full bg-black/50 p-2 backdrop-blur-sm">
                          <ZoomIn className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1 || loading}
                    className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                  <span className="text-sm font-medium text-slate-500">
                    Page {page} of {pages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    disabled={page >= pages || loading}
                    className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          ref={lightboxRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl"
          onClick={() => setLightbox(null)}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition z-10"
            onClick={() => setLightbox(null)}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Prev arrow */}
          {lightboxIdx > 0 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition z-10"
              onClick={(e) => { e.stopPropagation(); setLightbox(images[lightboxIdx - 1]); }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Next arrow */}
          {lightboxIdx < images.length - 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition z-10"
              onClick={(e) => { e.stopPropagation(); setLightbox(images[lightboxIdx + 1]); }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-4xl w-full flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative rounded-2xl overflow-hidden bg-black/50">
              <Image
                src={lightbox.cloudinaryUrl}
                alt={lightbox.prompt}
                width={1024}
                height={1024}
                className="max-h-[78vh] w-full object-contain"
                unoptimized
              />
            </div>

            {/* Info bar */}
            <div className="flex items-start justify-between gap-4 rounded-2xl bg-white/5 border border-white/10 px-5 py-4 backdrop-blur-sm">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white/90 leading-relaxed line-clamp-3">{lightbox.prompt}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                  {lightbox.model && (
                    <span className="rounded-md bg-violet-500/20 px-2 py-0.5 text-violet-300 font-semibold">
                      {MODEL_LABELS[lightbox.model] ?? lightbox.model}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timeAgo(lightbox.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleCopyPrompt(lightbox)}
                  className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 transition"
                >
                  {copiedId === lightbox._id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedId === lightbox._id ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={() => handleDelete(lightbox._id)}
                  disabled={deletingId === lightbox._id}
                  className="flex items-center gap-1.5 rounded-xl bg-red-500/20 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/30 transition disabled:opacity-50"
                >
                  {deletingId === lightbox._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Delete
                </button>
                <button
                  onClick={() => handleDownload(lightbox)}
                  className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-500 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>
            </div>

            {/* Nav hint */}
            <p className="text-center text-xs text-slate-700 -mt-1">
              {lightboxIdx + 1} / {images.length} · Use ← → arrow keys to navigate
            </p>
          </div>
        </div>
      )}
    </>
  );
}
