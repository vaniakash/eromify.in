"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  Wand2, Download, RefreshCw, Sparkles, ChevronDown,
  ZoomIn, X, Flame, Plus, Search, HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { ImageGenPayModal } from "@/components/ImageGenPayModal";

// ─── Models ──────────────────────────────────────────────────────────────────

const MODELS = [
  {
    id: "nano-banana-pro",
    label: "NanoBanana Pro",
    badge: "Fast",
    badgeColor: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    desc: "Fast generation up to 2K. Ultra-quick results.",
    logo: "/model_logo/nanobanana-color.png",
    tag: null,
  },
  {
    id: "wan-2.7-image-pro",
    label: "Wan 2.7 Image Pro",
    badge: "New",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    desc: "Latest multimodal image model with vision support.",
    logo: "/model_logo/wan-preview.png",
    tag: "New",
  },
  {
    id: "gpt-image-2",
    label: "GPT Image 2",
    badge: "OpenAI",
    badgeColor: "bg-violet-500/20 text-violet-300 border border-violet-500/30",
    desc: "Powerful OpenAI text-to-image with vision.",
    logo: "/model_logo/gpt.png",
    tag: "Popular",
  },
  {
    id: "seedream-4.5-pro",
    label: "Seedream 4.5 Pro",
    badge: "Premium",
    badgeColor: "bg-pink-500/20 text-pink-300 border border-pink-500/30",
    desc: "Premium quality generation up to 4K.",
    logo: "/model_logo/seedream.png",
    tag: "New",
  },
  {
    id: "qwen-image-plus",
    label: "Qwen Image Plus",
    badge: "Vision",
    badgeColor: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    desc: "Advanced multimodal vision-language model.",
    logo: "/model_logo/Qwen_logo.png",
    tag: null,
  },
];

// ─── Templates ───────────────────────────────────────────────────────────────

const TEMPLATES = [
  {
    id: "soft-luxury-cafe",
    name: "Soft Luxury Café Girl",
    desc: "Ultra realistic candid outdoor café portrait, warm olive skin, messy tied dark brown hair, vintage round gold sunglasses, beige oversized trench coat…",
    prompt: "Ultra realistic candid outdoor café portrait of a stylish young woman with warm olive skin tone and naturally soft facial features, standing near a luxury café during bright afternoon sunlight. She has messy tied dark brown hair with loose strands falling naturally around her face, wearing vintage round gold sunglasses, a beige oversized trench coat layered over a blue-and-white striped button-up shirt with visible cuffs and collar details. Subtle glossy nude makeup, natural eyebrows, soft pink lips, minimal jewelry with delicate silver necklace. Relaxed confident pose adjusting sunglasses with one hand while looking slightly downward. Background filled with blurred outdoor café seating, plants, and soft urban luxury environment. Warm sunlight creating realistic highlights on skin and clothing textures. Rich Pinterest old-money aesthetic, effortless rich-girl fashion energy, soft earthy tones, luxury lifestyle photography. Shot on DSLR with shallow depth of field, realistic skin pores, detailed fabric texture, cinematic sunlight reflections, authentic candid composition, soft shadows, premium Instagram editorial quality, balanced exposure, highly detailed realistic photography.",
    thumb: "/sofia/image.webp",
    tags: ["Female", "Fashion"],
  },
  {
    id: "late-night-passenger",
    name: "Late Night Passenger",
    desc: "Ultra realistic direct flash iPhone night photo inside a luxury SUV, long messy dark brown hair, white ribbed crop tank, denim jeans, candid Gen Z vibe…",
    prompt: "Ultra realistic direct flash iPhone night photo of a beautiful young woman sitting casually inside a luxury SUV passenger seat during nighttime. She has long messy dark brown hair, warm tan skin, soft glossy makeup, natural eyelashes, glossy pink lips, subtle cheek highlights. Wearing a fitted white ribbed crop tank top and loose light-wash denim jeans. One knee raised casually toward the seat, relaxed confident posture. Strong direct flash illuminating face and upper body while background remains darker with cinematic low-light atmosphere. Car interior features cream leather seats, luxury black handbag beside her, realistic reflections on windows and dashboard. Urban nightlife aesthetic with subtle city lights outside the vehicle. Authentic Gen Z influencer vibe, realistic candid composition, slight iPhone grain texture, realistic skin texture and pores, moody warm tones, flash reflections on hair and skin, shallow depth of field, luxury nightlife Instagram aesthetic, highly detailed modern lifestyle photography.",
    thumb: "/sofia/s.webp",
    tags: ["Female", "Urban"],
  },
  {
    id: "warm-glow-muse",
    name: "Warm Glow Muse",
    desc: "Soft indoor golden-hour portrait, long dark wavy hair, glowing tan skin, olive-green spaghetti strap, intimate feminine energy, ultra realistic DSLR…",
    prompt: "Soft indoor golden-hour portrait of a gorgeous young woman with long dark wavy hair sitting indoors near warm ambient lighting. She has glowing tan skin, soft feminine facial structure, glossy nude lips, subtle eyeliner, natural brows, radiant cheek highlights, delicate gold necklace. Wearing a fitted olive-green spaghetti strap tank top with elegant minimal styling. Relaxed seated pose with shoulders slightly angled toward camera, calm confident expression, eyes softly focused toward viewer. Warm ambient lighting mixed with subtle flash creates glowing skin highlights and soft realistic shadows. Cozy luxury home environment with blurred doors and interior background elements. Natural beauty influencer aesthetic, intimate feminine energy, realistic skin pores, smooth but natural texture, ultra realistic DSLR photography, shallow depth of field, balanced warm exposure, soft cinematic tones without over-editing, premium Instagram editorial portrait style, highly detailed fashion lifestyle composition.",
    thumb: "/sofia/sofia.webp",
    tags: ["Female", "Studio"],
  },
  {
    id: "midnight-bedroom-glow",
    name: "Midnight Bedroom Glow",
    desc: "Ultra realistic cozy bedroom portrait, slightly messy blonde hair, silver satin tank, pink headphones, snacking candid late-night influencer vibe…",
    prompt: "Ultra realistic cozy bedroom portrait of a glamorous young woman sitting casually on a bed late at night. She has slightly messy blonde hair with soft waves, glowing tan skin, glossy lips, subtle sparkly eye makeup, flushed cheeks, playful sleepy expression. Wearing a silver satin fitted tank top with soft reflective fabric texture and pink over-ear headphones. Holding a potato chip near her lips while casually snacking, creating relaxed candid influencer energy. Warm bedside lighting mixed with subtle direct flash creates glossy highlights on skin and satin fabric. Background includes soft hotel-room bedding, warm ambient shadows, intimate luxury nighttime atmosphere. Soft Pinterest bedroom aesthetic, late-night influencer vibe, realistic skin pores and texture, cinematic warm tones, authentic candid composition, shallow depth of field, premium lifestyle photography, cozy feminine mood, ultra detailed DSLR realism.",
    thumb: "/sofia/soff.webp",
    tags: ["Female", "Fashion"],
  },
  {
    id: "streetlight-elegance",
    name: "Streetlight Elegance",
    desc: "Luxury outdoor café portrait, long dark natural hair, oversized blue striped shirt, warm glowing skin, effortless rich-girl Pinterest fashion aesthetic…",
    prompt: "Luxury outdoor café fashion portrait of a naturally beautiful young woman sitting at an elegant city café during daytime. She has long dark natural hair with slightly messy soft texture, warm glowing skin tone, minimal makeup with glossy lips and subtle blush. Wearing an oversized blue striped button-up shirt layered casually over a black fitted inner top. Relaxed elegant pose with one hand gently touching her neck while looking calmly toward camera. Bright natural sunlight creates realistic highlights on face and hair. Urban café environment in background with blurred people, tables, plants, and luxury city atmosphere. Modern Pinterest fashion aesthetic, effortless rich-girl energy, natural influencer beauty style, realistic candid expression, premium Instagram editorial look, shallow depth of field, soft warm daylight tones, realistic fabric texture, ultra realistic DSLR photography with balanced exposure and highly detailed skin texture.",
    thumb: "/sofia/sofiaaa.webp",
    tags: ["Female", "Outdoor"],
  },
  {
    id: "soft-flash-selfie",
    name: "Soft Flash Selfie",
    desc: "Ultra realistic close-up indoor flash selfie, long dark messy hair, warm tan skin, white halter top, gold necklace, luxury beauty influencer aesthetic…",
    prompt: "Ultra realistic close-up indoor flash selfie portrait of a beautiful young woman with long dark slightly messy hair cascading naturally over shoulders. Warm tan skin with realistic pores and soft glow, glossy nude lips, natural makeup, subtle eyeliner, softly defined eyebrows, feminine delicate facial features. Wearing a white halter-style top and minimal gold necklace. Relaxed intimate selfie angle with soft confident expression and slightly tilted head. Warm indoor ambient lighting combined with subtle direct flash creates glossy skin highlights and smooth shadows. Background softly blurred with cozy neutral indoor environment. Luxury beauty influencer aesthetic, authentic Instagram selfie style, ultra realistic DSLR-quality detail, cinematic shallow depth of field, natural skin texture, balanced warm tones, premium feminine portrait composition, clean minimal beauty photography.",
    thumb: "/sofia/sofiiiia.webp",
    tags: ["Female", "Fashion"],
  },
];

const FILTER_TAGS = ["All", "Female", "Male", "Couple", "Nano Banana", "text-to-image"];
const ASPECT_RATIOS = ["1:1", "4:3", "3:4", "16:9", "9:16"];

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  model: string;
}

export default function TextToImageClient() {
  const [prompt, setPrompt] = useState("");
  const [negPrompt, setNegPrompt] = useState("");
  const [showNegPrompt, setShowNegPrompt] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-image-2");
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"tasks" | "gallery" | "library">("library");
  const [filterTag, setFilterTag] = useState("All");
  const [search, setSearch] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [lightboxImage, setLightboxImage] = useState<GeneratedImage | null>(null);
  const [payModal, setPayModal] = useState<{ open: boolean; mode: "login" | "payment" }>({ open: false, mode: "payment" });
  const [credits, setCredits] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { status } = useSession();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("upgrade") === "true") {
      setPayModal({ open: true, mode: status === "authenticated" ? "payment" : "login" });
    }
  }, [searchParams, status]);

  const fetchCredits = useCallback(async () => {
    if (status !== "authenticated") return;
    try {
      const res = await fetch("/api/user/credits");
      if (res.ok) { const d = await res.json(); setCredits(d.credits); }
    } catch {}
  }, [status]);

  useEffect(() => { fetchCredits(); }, [fetchCredits]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    if (status !== "authenticated") { window.location.href = "/login"; return; }
    if (credits !== null && credits <= 0) { setPayModal({ open: true, mode: "payment" }); return; }
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
        if (data.code === "INSUFFICIENT_CREDITS") { setPayModal({ open: true, mode: "payment" }); }
        throw new Error(data.error || "Failed to generate image.");
      }
      if (!data.image) throw new Error("Failed to generate image.");
      setCredits(p => p !== null ? Math.max(0, p - 1) : null);
      setCurrentImage({ id: Date.now().toString(), url: data.image, prompt, model: selectedModel });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (img: GeneratedImage) => {
    const a = document.createElement("a");
    a.href = img.url;
    a.download = `eromify-tti-${img.id}.jpg`;
    a.click();
  };

  const modelInfo = MODELS.find(m => m.id === selectedModel) ?? MODELS[0];

  const filteredTemplates = TEMPLATES.filter(t => {
    const matchTag = filterTag === "All" || t.tags.some(tag => tag.toLowerCase().includes(filterTag.toLowerCase()));
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase());
    return matchTag && matchSearch;
  });

  return (
    <>
      <div className="min-h-screen lg:h-screen bg-[#050505] flex flex-col lg:flex-row overflow-hidden font-sans selection:bg-violet-500/30">
        
        {/* MAIN WORKSPACE */}
        <div className="flex-1 flex flex-col overflow-y-auto relative scroll-smooth">
          {/* Subtle gradient glow */}
          <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-violet-500/10 to-transparent pointer-events-none" />

          <div className="relative max-w-5xl mx-auto w-full px-6 py-10 flex-1 flex flex-col gap-10">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-light text-white tracking-tight">Create <span className="font-semibold text-violet-400">Image</span></h1>
                <p className="text-sm text-slate-400 mt-2 font-light">Transform your ideas into stunning visuals using AI.</p>
              </div>
              <button className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 rounded-full px-4 py-2 transition-all backdrop-blur-md">
                <HelpCircle className="h-4 w-4" />
                Guide
              </button>
            </div>

            {/* Prompt Area */}
            <div className="flex flex-col gap-3">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-3xl blur opacity-20 group-focus-within:opacity-50 transition duration-500"></div>
                <div className="relative bg-[#0a0a0c] border border-white/10 rounded-3xl p-5 shadow-2xl transition-all focus-within:border-violet-500/50">
                  <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="Describe what you want to see... be as detailed as possible."
                    rows={4}
                    className="w-full resize-none bg-transparent text-lg text-white placeholder-slate-600 outline-none font-light leading-relaxed"
                  />
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                    <button
                      onClick={() => setShowNegPrompt(!showNegPrompt)}
                      className={cn(
                        "flex items-center gap-2 text-xs font-medium transition-colors",
                        showNegPrompt ? "text-violet-400" : "text-slate-500 hover:text-slate-300"
                      )}
                    >
                      <X className={cn("h-3.5 w-3.5 transition-transform", showNegPrompt ? "rotate-45" : "")} />
                      Negative Prompt
                    </button>
                    
                    <div className="text-xs text-slate-500 font-medium">
                      {prompt.length} chars
                    </div>
                  </div>
                </div>
              </div>

              {/* Negative Prompt */}
              {showNegPrompt && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                  <textarea
                    value={negPrompt}
                    onChange={e => setNegPrompt(e.target.value)}
                    placeholder="What should not be in the image? (e.g. blurry, bad anatomy, text...)"
                    rows={2}
                    className="w-full resize-none rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-slate-300 placeholder-red-900/40 outline-none transition focus:border-red-500/40"
                  />
                </div>
              )}
            </div>

            {/* RESULT SECTION */}
            {(isGenerating || currentImage) && (
              <div className="flex flex-col gap-5 bg-[#0a0a0c] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-medium text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-violet-400" /> 
                    {isGenerating ? "Crafting your vision..." : "Generation Result"}
                  </h2>
                  {currentImage && (
                    <div className="flex gap-2">
                       <button onClick={() => setLightboxImage(currentImage)} className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors" title="Zoom In">
                         <ZoomIn className="h-4 w-4" />
                       </button>
                       <button onClick={() => setCurrentImage(null)} className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors" title="Close Result">
                         <X className="h-4 w-4" />
                       </button>
                    </div>
                  )}
                </div>

                <div className="relative w-full rounded-2xl overflow-hidden bg-black/50 min-h-[300px] md:min-h-[400px] flex items-center justify-center border border-white/5">
                   {isGenerating && !currentImage ? (
                      <div className="flex flex-col items-center gap-6">
                        <div className="relative w-16 h-16">
                          <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
                          <div className="absolute inset-0 rounded-full border-2 border-violet-500 border-t-transparent animate-spin"></div>
                          <Sparkles className="absolute inset-0 m-auto h-5 w-5 text-violet-400 animate-pulse" />
                        </div>
                        <p className="text-sm font-medium text-slate-400 tracking-wide">Bringing your vision to life...</p>
                      </div>
                   ) : currentImage && (
                     <div className="relative w-full h-full flex items-center justify-center p-4">
                       <Image
                         src={currentImage.url}
                         alt={currentImage.prompt}
                         width={1024}
                         height={1024}
                         className="max-w-full max-h-[50vh] object-contain rounded-lg shadow-2xl"
                         unoptimized
                       />
                     </div>
                   )}
                </div>

                {currentImage && (
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-300 font-light truncate">{currentImage.prompt}</p>
                        <p className="text-xs text-slate-500 mt-1">Generated with {MODELS.find(m => m.id === currentImage.model)?.label}</p>
                      </div>
                      <button
                        onClick={() => handleDownload(currentImage)}
                        className="shrink-0 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Image
                      </button>
                   </div>
                )}
              </div>
            )}

            {/* Templates */}
            <div className="flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-medium text-white">Inspirations</h2>
                
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5 self-start sm:self-auto">
                   {(["tasks", "gallery", "library"] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                          "px-4 py-1.5 text-xs font-medium rounded-full capitalize transition-all",
                          activeTab === tab
                            ? "bg-white/10 text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-300"
                        )}
                      >
                        {tab}
                      </button>
                    ))}
                </div>
              </div>
              
              {/* Tags */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {FILTER_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setFilterTag(tag)}
                    className={cn(
                      "whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-all border",
                      filterTag === tag
                        ? "bg-violet-500/20 text-violet-300 border-violet-500/30"
                        : "bg-transparent text-slate-400 border-white/10 hover:border-white/20 hover:text-white"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Template Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5 pb-10">
                {filteredTemplates.map(t => (
                  <div
                    key={t.id}
                    onClick={() => { setPrompt(t.prompt); textareaRef.current?.focus(); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                    className="group relative rounded-2xl overflow-hidden cursor-pointer bg-white/5 border border-white/5 hover:border-violet-500/30 transition-all duration-300"
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <Image
                        src={t.thumb}
                        alt={t.name}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-sm font-semibold text-white mb-1">{t.name}</p>
                      <p className="text-xs text-slate-300/70 line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">{t.desc}</p>
                    </div>
                    
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                       <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-2">
                          <Wand2 className="h-4 w-4 text-white" />
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="w-full lg:w-[360px] shrink-0 bg-[#0a0a0c] border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col z-10 shadow-2xl relative">
          
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div>
              <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                 <Wand2 className="h-4 w-4 text-violet-400" />
                 Model Settings
              </h3>
              
              <div className="relative">
                <button
                  onClick={() => setModelDropdownOpen(o => !o)}
                  className="w-full flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3 text-left transition hover:bg-white/[0.05] group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Image
                      src={modelInfo.logo}
                      alt={modelInfo.label}
                      width={24}
                      height={24}
                      className="object-contain w-6 h-6 rounded-md"
                      unoptimized
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{modelInfo.label}</p>
                    </div>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-slate-500 transition-transform", modelDropdownOpen && "rotate-180")} />
                </button>

                {modelDropdownOpen && (
                  <div className="absolute z-50 mt-2 w-full rounded-xl border border-white/10 bg-[#0f0f13] shadow-xl overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                    {MODELS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => { setSelectedModel(m.id); setModelDropdownOpen(false); }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-white/5",
                          selectedModel === m.id && "bg-violet-500/10"
                        )}
                      >
                        <Image src={m.logo} alt={m.label} width={24} height={24} className="object-contain w-6 h-6 rounded-md" unoptimized />
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm font-medium truncate", selectedModel === m.id ? "text-violet-300" : "text-white")}>{m.label}</p>
                        </div>
                        {m.tag && <span className="bg-white/10 text-slate-300 text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0">{m.tag}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-sm font-medium text-white">Aspect Ratio</h3>
                 <span className="text-xs text-slate-500">{aspectRatio}</span>
               </div>
               <div className="grid grid-cols-5 gap-1.5 p-1 bg-white/[0.02] border border-white/5 rounded-xl">
                 {ASPECT_RATIOS.map(r => (
                   <button
                     key={r}
                     onClick={() => setAspectRatio(r)}
                     className={cn(
                       "py-2 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-1.5",
                       aspectRatio === r
                         ? "bg-white/10 text-white shadow-sm"
                         : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                     )}
                   >
                     <div className={cn(
                       "border-2 rounded-sm transition-colors",
                       aspectRatio === r ? "border-violet-400" : "border-slate-600",
                       r === "1:1" ? "w-4 h-4" :
                       r === "4:3" ? "w-5 h-3.5" :
                       r === "3:4" ? "w-3.5 h-5" :
                       r === "16:9" ? "w-5 h-2.5" :
                       "w-2.5 h-5"
                     )} />
                     {r}
                   </button>
                 ))}
               </div>
            </div>
            
          </div>

          <div className="p-6 border-t border-white/5 bg-[#0a0a0c]">
            {status === "authenticated" && credits !== null && (
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-orange-400" />
                  <span className="text-xs text-slate-300">
                    <span className="font-semibold text-white">{Math.floor((credits ?? 0) / 100)}</span> credits
                  </span>
                </div>
                <button
                  onClick={() => setPayModal({ open: true, mode: "payment" })}
                  className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Add More
                </button>
              </div>
            )}

            {error && (
              <div className="mb-4 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className={cn(
                "relative w-full rounded-2xl py-4 text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden",
                !prompt.trim() || isGenerating
                  ? "cursor-not-allowed bg-white/5 text-slate-500"
                  : "bg-white text-black hover:scale-[1.02] shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)]"
              )}
            >
              {!prompt.trim() || isGenerating ? null : (
                 <div className="absolute inset-0 bg-gradient-to-r from-violet-200/0 via-violet-200/30 to-violet-200/0 translate-x-[-100%] hover:animate-[shimmer_2s_infinite]" />
              )}
              
              {isGenerating ? (
                <><RefreshCw className="h-4 w-4 animate-spin text-slate-400" />Generating...</>
              ) : (
                <><Sparkles className="h-4 w-4" />Generate Image</>
              )}
            </button>
            
            <p className="text-[10px] text-center text-slate-500 mt-3 font-medium">
               Takes ~10 seconds. Costs 1 credit.
            </p>
          </div>
        </div>
      </div>



      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4 backdrop-blur-lg animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute right-5 top-5 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-all border border-white/10 z-[70]"
            onClick={() => setLightboxImage(null)}
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative max-h-[95vh] max-w-5xl flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <Image
              src={lightboxImage.url}
              alt={lightboxImage.prompt}
              width={2048}
              height={2048}
              className="max-h-[90vh] rounded-xl object-contain shadow-[0_0_100px_-20px_rgba(255,255,255,0.1)]"
              unoptimized
            />
          </div>
        </div>
      )}

      {/* Pay Modal */}
      <ImageGenPayModal
        isOpen={payModal.open}
        mode={payModal.mode}
        onClose={() => setPayModal({ ...payModal, open: false })}
        onSuccess={creditsAdded => {
          if (creditsAdded) setCredits(p => (p ?? 0) + creditsAdded);
          setPayModal({ ...payModal, open: false });
          fetchCredits();
        }}
      />
    </>
  );
}
