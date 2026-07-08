"use client";

import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { Wand2, ImagePlus, Layers, Download, RefreshCw, X,
  Sparkles, AlertCircle, Clock, ChevronRight, Zap,
  Eye, Trash2, Copy, Check, Images, Lock,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { ImageGenPayModal } from "@/components/ImageGenPayModal";

type Mode = "text2img" | "edit" | "multiref";

interface GalleryItem {
  _id: string;
  cloudinaryUrl: string;
  prompt: string;
  mode: Mode;
  generationMs?: number;
  createdAt: string;
}

const MODE_META: Record<Mode, { label: string; icon: React.ReactNode; color: string; desc: string }> = {
  text2img: { label: "Text → Image", icon: <Wand2 className="h-4 w-4" />, color: "from-violet-600 to-indigo-600", desc: "Generate any image from a text prompt" },
  edit: { label: "Image Editing", icon: <ImagePlus className="h-4 w-4" />, color: "from-pink-600 to-rose-600", desc: "Upload an image and transform it with Klein" },
  multiref: { label: "Multi-Reference", icon: <Layers className="h-4 w-4" />, color: "from-amber-500 to-orange-500", desc: "Combine 2 reference images into something new" },
};

const EXAMPLES: Record<Mode, string[]> = {
  text2img: [
    "A stunning AI influencer with glowing skin, neon city at night, fashion editorial",
    "Hyperrealistic portrait of a female influencer with perfect makeup, golden hour lighting",
    "Futuristic AI model in cyberpunk outfit, Tokyo street, cinematic lighting",
  ],
  edit: ["Make it a Studio Ghibli anime painting", "Add dramatic storm clouds to background", "Convert to dark cinematic oil painting"],
  multiref: ["Blend both images into a cohesive surrealist artwork", "Merge style of image 1 with subject of image 2"],
};

function UploadBox({ label, file, preview, onFile, onClear, id }: {
  label: string; file: File | null; preview: string | null;
  onFile: (f: File) => void; onClear: () => void; id: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      {preview ? (
        <div className="relative group overflow-hidden rounded-xl border border-white/10 bg-black/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={label} className="w-full max-h-48 object-contain bg-black/30" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onClear} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg">
              <Trash2 className="h-3 w-3" /> Remove
            </button>
          </div>
          <p className="absolute bottom-2 left-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded">{file?.name}</p>
        </div>
      ) : (
        <label htmlFor={id} className="flex flex-col items-center justify-center gap-3 h-36 rounded-xl border-2 border-dashed border-white/20 bg-white/5 cursor-pointer hover:border-violet-500/60 hover:bg-violet-500/5 transition-all">
          <ImagePlus className="h-8 w-8 text-slate-500" />
          <p className="text-xs text-slate-500">Click to upload image</p>
          <input id={id} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
        </label>
      )}
    </div>
  );
}

function AIInfluencerInner() {
  const { data: session, status } = useSession();
  const [mode, setMode] = useState<Mode>("text2img");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  const searchParams = useSearchParams();
  const [payModal, setPayModal] = useState<{ open: boolean; mode: "login" | "payment" }>({ open: false, mode: "payment" });
  const [credits, setCredits] = useState<number | null>(null);

  // Auto-open modal if ?upgrade=true
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

  useEffect(() => { fetchCredits(); }, [fetchCredits]);

  // Upload states
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [ref1File, setRef1File] = useState<File | null>(null);
  const [ref1Preview, setRef1Preview] = useState<string | null>(null);
  const [ref2File, setRef2File] = useState<File | null>(null);
  const [ref2Preview, setRef2Preview] = useState<string | null>(null);

  // Gallery
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryZoomed, setGalleryZoomed] = useState<GalleryItem | null>(null);

  const loadPreview = useCallback((file: File, setter: (s: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => setter(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const fetchGallery = useCallback(async () => {
    if (!session?.user?.email) return;
    setGalleryLoading(true);
    try {
      const res = await fetch("/api/influencer-gallery");
      const data = await res.json();
      if (data.images) setGallery(data.images);
    } finally {
      setGalleryLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => { fetchGallery(); }, [fetchGallery]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    if (mode === "edit" && !editFile) { setError("Upload a source image for edit mode."); return; }
    if (mode === "multiref" && !ref1File) { setError("Upload at least one reference image."); return; }

    if (credits !== null && credits < 5) {
      setPayModal({ open: true, mode: "payment" });
      return;
    }

    setIsGenerating(true); setError(null);
    try {
      const fd = new FormData();
      fd.append("mode", mode); fd.append("prompt", prompt.trim());
      if (mode === "edit" && editFile) fd.append("image", editFile);
      if (mode === "multiref") { if (ref1File) fd.append("ref1", ref1File); if (ref2File) fd.append("ref2", ref2File); }
      const res = await fetch("/api/influencer-generate", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "INSUFFICIENT_CREDITS") {
          setPayModal({ open: true, mode: "payment" });
          throw new Error("Insufficient credits. Generating an influencer image costs 5 credits.");
        }
        throw new Error(data.error || "Generation failed");
      }
      if (!data.image) throw new Error("Generation failed");

      setCredits((prev) => (prev !== null ? Math.max(0, prev - 5) : null));
      setLastResult(data.image);
      await fetchGallery();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/influencer-gallery?id=${id}`, { method: "DELETE" });
    setGallery((prev) => prev.filter((g) => g._id !== id));
    if (galleryZoomed?._id === id) setGalleryZoomed(null);
  };

  const handleDownload = (url: string, id: string) => {
    const a = document.createElement("a"); a.href = url; a.download = `influencer-${id}.jpg`; a.click();
  };

  const copyPrompt = (text: string) => {
    navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  if (status === "loading") return <div className="min-h-screen bg-[#080C14] flex items-center justify-center"><RefreshCw className="h-8 w-8 text-violet-400 animate-spin" /></div>;

  if (!session) return (
    <div className="min-h-screen bg-[#080C14] flex items-center justify-center text-white">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-violet-500/20 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="h-10 w-10 text-violet-400" />
        </div>
        <h2 className="text-2xl font-black">Sign in to create</h2>
        <p className="text-slate-400">You need to be signed in to use the AI Influencer Creator.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080C14] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black text-white">AI Influencer Creator</h1>
              <p className="text-[10px] text-slate-500">FLUX.2 Klein 4B · Saved to your gallery</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {status === "authenticated" && credits !== null && (
              <div className="flex items-center gap-2 mr-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-bold text-white">
                <span className="text-violet-400">⚡</span>
                <span className="hidden sm:inline">Credits:</span> <span className="text-violet-300">{credits}</span>
                <button onClick={() => setPayModal({ open: true, mode: "payment" })} className="ml-1 rounded bg-violet-500/20 hover:bg-violet-500/40 px-2 py-0.5 transition text-[10px]">Buy</button>
              </div>
            )}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs text-slate-400">Klein API</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Generator Panel */}
        <div className="grid lg:grid-cols-[400px_1fr] gap-8">
          {/* LEFT */}
          <div className="space-y-5">
            {/* Model badge */}
            <div className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-900/20 to-indigo-900/20 p-5">
              <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-violet-400" />
                  <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">Active Model</span>
                </div>
                <h2 className="text-xl font-black text-white mb-1">FLUX.2 Klein 4B</h2>
                <p className="text-sm text-slate-400">All-in-one vision model — text-to-image, editing, and multi-reference.</p>
              </div>
            </div>

            {/* Mode */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mode</p>
              {(["text2img", "edit", "multiref"] as Mode[]).map((m) => {
                const meta = MODE_META[m];
                const isActive = mode === m;
                return (
                  <button key={m} onClick={() => { setMode(m); setError(null); }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${isActive ? "border-violet-500/60 bg-violet-500/10" : "border-white/10 bg-white/5 hover:border-white/20"}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br ${meta.color} ${isActive ? "shadow-lg" : "opacity-60"}`}>{meta.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${isActive ? "text-white" : "text-slate-400"}`}>{meta.label}</p>
                      <p className="text-xs text-slate-500 truncate">{meta.desc}</p>
                    </div>
                    {isActive && <ChevronRight className="h-4 w-4 text-violet-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Upload zones */}
            {mode === "edit" && <UploadBox label="Source Image" id="edit-upload" file={editFile} preview={editPreview} onFile={(f) => { setEditFile(f); loadPreview(f, setEditPreview); }} onClear={() => { setEditFile(null); setEditPreview(null); }} />}
            {mode === "multiref" && (
              <div className="space-y-4">
                <UploadBox label="Reference Image 1" id="ref1-upload" file={ref1File} preview={ref1Preview} onFile={(f) => { setRef1File(f); loadPreview(f, setRef1Preview); }} onClear={() => { setRef1File(null); setRef1Preview(null); }} />
                <UploadBox label="Reference Image 2 (optional)" id="ref2-upload" file={ref2File} preview={ref2Preview} onFile={(f) => { setRef2File(f); loadPreview(f, setRef2Preview); }} onClear={() => { setRef2File(null); setRef2Preview(null); }} />
              </div>
            )}

            {/* Prompt */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prompt</p>
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe your AI influencer…" rows={4}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition" />
              <div className="space-y-1">
                <p className="text-[10px] text-slate-600 uppercase tracking-wider">Examples:</p>
                {EXAMPLES[mode].map((ex, i) => (
                  <button key={i} onClick={() => setPrompt(ex)} className="text-left text-xs text-slate-500 hover:text-violet-400 py-1 px-2 rounded-lg hover:bg-violet-500/10 transition-all w-full truncate">→ {ex}</button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                <p className="text-xs text-red-300 leading-relaxed">{error}</p>
              </div>
            )}

            <button onClick={handleGenerate} disabled={!prompt.trim() || isGenerating}
              className="w-full py-4 rounded-2xl font-black text-base text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden group"
              style={{ background: isGenerating ? "linear-gradient(135deg,#374151,#1f2937)" : "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: isGenerating ? "none" : "0 0 30px rgba(124,58,237,0.4)" }}>
              {!isGenerating && <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />}
              <span className="relative flex items-center justify-center gap-3">
                {isGenerating ? <><RefreshCw className="h-5 w-5 animate-spin" />Generating with Klein…</> : <><Wand2 className="h-5 w-5" />Generate Influencer Image <span className="ml-1 flex items-center justify-center rounded-full bg-white/20 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm"><Zap className="mr-1 h-3 w-3" /> 5 Credits</span></>}
              </span>
            </button>
          </div>

          {/* RIGHT — Live output */}
          <div className="space-y-4">
            {isGenerating && (
              <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-white/10 bg-white/5 p-16 text-center min-h-[400px]">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-violet-500/30 border-t-violet-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center"><Sparkles className="h-7 w-7 text-violet-400 animate-pulse" /></div>
                </div>
                <div>
                  <p className="font-black text-white text-lg">Klein is generating…</p>
                  <p className="text-sm text-slate-500 mt-1">Uploading to your gallery when done</p>
                </div>
              </div>
            )}

            {lastResult && !isGenerating && (
              <div className="rounded-2xl border border-violet-500/30 overflow-hidden bg-black/40">
                <div className="relative cursor-pointer" onClick={() => setZoomed(true)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={lastResult} alt="Generated" className="w-full object-cover hover:scale-[1.01] transition-transform" />
                  <div className="absolute top-3 right-3"><Eye className="h-5 w-5 text-white drop-shadow-lg" /></div>
                  <div className="absolute top-3 left-3 bg-emerald-500 text-black text-[10px] font-black px-2 py-0.5 rounded-md">✓ Saved to Gallery</div>
                </div>
                <div className="p-4 flex gap-3">
                  <button onClick={() => copyPrompt(prompt)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-slate-400 hover:text-white transition">
                    {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}{copied ? "Copied!" : "Copy Prompt"}
                  </button>
                  <button onClick={() => handleDownload(lastResult, "latest")} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-violet-500/20 hover:bg-violet-500/40 text-sm text-violet-300 hover:text-white transition">
                    <Download className="h-4 w-4" />Download
                  </button>
                </div>
              </div>
            )}

            {!lastResult && !isGenerating && (
              <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border-2 border-dashed border-white/10 bg-white/3 p-16 text-center min-h-[400px]">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 flex items-center justify-center">
                  <Wand2 className="h-10 w-10 text-violet-400/60" />
                </div>
                <div>
                  <p className="font-black text-slate-400 text-lg">Ready to create</p>
                  <p className="text-sm text-slate-600 mt-1 max-w-xs">Enter a prompt and hit Generate. Every image is saved to your gallery automatically.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* GALLERY SECTION */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-violet-500/20 rounded-xl flex items-center justify-center">
                <Images className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">My Gallery</h2>
                <p className="text-xs text-slate-500">{gallery.length} image{gallery.length !== 1 ? "s" : ""} saved to Cloudinary</p>
              </div>
            </div>
            <button onClick={fetchGallery} disabled={galleryLoading} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-slate-400 hover:text-white transition">
              <RefreshCw className={`h-3.5 w-3.5 ${galleryLoading ? "animate-spin" : ""}`} />Refresh
            </button>
          </div>

          {galleryLoading && gallery.length === 0 ? (
            <div className="flex items-center justify-center py-16"><RefreshCw className="h-8 w-8 text-violet-400 animate-spin" /></div>
          ) : gallery.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-2xl border-2 border-dashed border-white/10">
              <Images className="h-12 w-12 text-slate-600" />
              <p className="text-slate-500 text-sm">No images yet. Generate your first AI influencer above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {gallery.map((item) => (
                <div key={item._id} className="group relative rounded-xl overflow-hidden border border-white/10 hover:border-violet-500/40 bg-black/40 transition-all hover:-translate-y-1">
                  <div className="relative aspect-square cursor-pointer" onClick={() => setGalleryZoomed(item)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.cloudinaryUrl} alt={item.prompt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <p className="text-[10px] text-white/80 line-clamp-2">{item.prompt}</p>
                    </div>
                  </div>
                  <div className="p-2 flex gap-1">
                    <button onClick={() => handleDownload(item.cloudinaryUrl, item._id)} className="flex-1 flex items-center justify-center py-1 rounded-lg bg-violet-500/20 hover:bg-violet-500/40 text-[10px] text-violet-300 transition">
                      <Download className="h-3 w-3" />
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="flex items-center justify-center px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/30 text-red-400 transition">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox - latest result */}
      {zoomed && lastResult && (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setZoomed(false)}>
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition">
            <X className="h-5 w-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lastResult} alt="Generated" className="max-w-4xl max-h-[85vh] rounded-2xl object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Gallery lightbox */}
      {galleryZoomed && (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setGalleryZoomed(null)}>
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition">
            <X className="h-5 w-5" />
          </button>
          <div className="max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={galleryZoomed.cloudinaryUrl} alt={galleryZoomed.prompt} className="w-full max-h-[70vh] rounded-2xl object-contain shadow-2xl mb-4" />
            <div className="bg-black/60 rounded-xl p-4 space-y-2">
              <p className="text-white text-sm font-semibold">{galleryZoomed.prompt}</p>
              <div className="flex gap-3 text-xs text-slate-400">
                <span className="bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full">{MODE_META[galleryZoomed.mode]?.label}</span>
                {galleryZoomed.generationMs && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{(galleryZoomed.generationMs / 1000).toFixed(1)}s</span>}
                <span>{new Date(galleryZoomed.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => handleDownload(galleryZoomed.cloudinaryUrl, galleryZoomed._id)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-violet-500/20 hover:bg-violet-500/40 text-sm text-violet-300 hover:text-white transition">
                  <Download className="h-4 w-4" />Download
                </button>
                <button onClick={() => handleDelete(galleryZoomed._id)} className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-sm text-red-400 transition">
                  <Trash2 className="h-4 w-4" />Delete
                </button>
              </div>
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
  );
}

export default function AIInfluencerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080C14] flex items-center justify-center"><div className="w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" /></div>}>
      <AIInfluencerInner />
    </Suspense>
  );
}
