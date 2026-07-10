"use client";

import {
  Sparkles,
  ArrowRight,
  Zap,
  Crown,
  Check,
  Users,
  Globe,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/footer/Footer";
import LineWaves from "@/components/ui/LineWaves";
import StarBorder from "@/components/ui/StarBorder";
import { ProUpgradeModal } from "@/components/ProUpgradeModal";
import { AIPromoModal } from "@/components/AIPromoModal";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useAnalytics } from "@/lib/useAnalytics";

// ── Cloudinary CDN video URLs (served with auto quality + format) ────────────
const CLD = {
  seefour: "https://res.cloudinary.com/dmbrsdmfb/video/upload/q_auto,f_auto/v1778748158/eromify/homepage/seefour.mp4",
  seedancesix: "https://res.cloudinary.com/dmbrsdmfb/video/upload/q_auto,f_auto/v1778748167/eromify/homepage/seedancesix.mp4",
  seedance: "https://res.cloudinary.com/dmbrsdmfb/video/upload/q_auto,f_auto/v1778748179/eromify/homepage/seedance.mp4",
  sedanc: "https://res.cloudinary.com/dmbrsdmfb/video/upload/q_auto,f_auto/v1778748190/eromify/homepage/sedanc.mp4",
  seedancesss: "https://res.cloudinary.com/dmbrsdmfb/video/upload/q_auto,f_auto/v1778748200/eromify/homepage/seedancesss.mp4",
  reel218: "https://res.cloudinary.com/dmbrsdmfb/video/upload/q_auto,f_auto/v1778748207/eromify/homepage/Video-218.mp4",
  reel420: "https://res.cloudinary.com/dmbrsdmfb/video/upload/q_auto,f_auto/v1778748212/eromify/homepage/Video-420.mp4",
  reel480: "https://res.cloudinary.com/dmbrsdmfb/video/upload/q_auto,f_auto/v1778748221/eromify/homepage/Video-480.mp4",
  reel525: "https://res.cloudinary.com/dmbrsdmfb/video/upload/q_auto,f_auto/v1778748226/eromify/homepage/Video-525.mp4",
};

const FAQS = [
  { q: "What is Eromify?", a: "Eromify is an advanced all-in-one AI platform designed to help you create stunning AI images, cinematic videos, and AI influencers." },
  { q: "What is an AI image generator?", a: "An AI Image Generator (or AI Image Creator) uses artificial intelligence to turn text descriptions into high-quality visual art, photos, and graphics in seconds." },
  { q: "What is an AI video generator?", a: "An AI Video Generator is a powerful Text to Video AI tool that transforms your written prompts into realistic, high-definition videos instantly." },
  { q: "What is an AI influencer generator?", a: "An AI Influencer Generator (or AI Influencer Creator) lets you design and generate consistent virtual personalities and models for social media content." },
  { q: "What can I create with Eromify?", a: "With Eromify, you can create hyper-realistic AI Images, breathtaking AI Videos, and consistent AI Influencers to build your brand or audience." },
  { q: "Which AI models are available?", a: "We offer a wide range of state-of-the-art models including Seedance, Veo, Kling, FLUX, and GPT Image to ensure the highest quality results." },
  { q: "Is Eromify free?", a: "Eromify offers affordable options and acts as a Free AI Generator for select basic features, with premium upgrades available for professional use." },
  { q: "How does Eromify pricing work?", a: "Our AI Generator Pricing is based on a simple Credits system. You purchase or earn credits, which are then consumed based on the complexity of your generations." },
  { q: "Which AI model should I choose?", a: "For still visuals, FLUX is often considered the Best AI Image Generator. For motion, models like Kling and Veo rank as the Best AI Video Generator options." },
  { q: "Can I use AI-generated images and videos commercially?", a: "Yes, you can use Commercial AI Images generated on our platform. However, AI Copyright laws vary by region, so we advise checking local regulations for trademarking." },
  { q: "Can I create AI influencers for Instagram, TikTok, and YouTube?", a: "Absolutely! Our platform is perfect for creating an AI Influencer Instagram model or an AI Influencer TikTok personality with consistent appearances across posts." },
  { q: "How long does AI generation take?", a: "Eromify is built as a Fast AI Generator. Most images are created in seconds, while high-quality videos may take just a few minutes depending on the model." },
  { q: "Do I need design experience?", a: "Not at all. Eromify is a Beginner AI Generator designed to be intuitive. If you can type a text prompt, you can create professional media." },
  { q: "What should I do if my generation fails?", a: "If an AI Image Failed or an AI Video Failed to generate, your credits are automatically refunded. You can try tweaking your prompt or selecting a different model." },
  { q: "How can I contact support?", a: "If you need AI Support or have any questions about your account, you can reach out to us via our contact form or support email directly from your dashboard." },
];

export default function HomePage() {
  const [showModal, setShowModal] = useState(false);
  const [showAIPromo, setShowAIPromo] = useState(false);
  const [isUserPro, setIsUserPro] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [targetCount, setTargetCount] = useState(259);
  const [mutedMap, setMutedMap] = useState<Record<number, boolean>>({});
  const toggleMute = (i: number) =>
    setMutedMap(prev => ({ ...prev, [i]: !prev[i] }));
  const { status } = useSession();
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      // scroll by a bit less than the clientWidth so that we don't skip items if the screen is wide
      const scrollAmount = carouselRef.current.clientWidth * 0.8;
      const targetScroll = direction === "left"
        ? carouselRef.current.scrollLeft - scrollAmount
        : carouselRef.current.scrollLeft + scrollAmount;
      carouselRef.current.scrollTo({ left: targetScroll, behavior: "smooth" });
    }
  };

  const { trackEvent } = useAnalytics("homepage");

  useEffect(() => {
    fetch("/api/stats/users")
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.count === "number") {
          // If DB has fewer than 259, still use 259 as base so it doesn't look empty
          setTargetCount(data.count > 259 ? data.count : 259);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (userCount < targetCount) {
      const step = Math.max(1, Math.ceil(targetCount / 50));
      const timer = setTimeout(() => {
        setUserCount(prev => (prev + step > targetCount ? targetCount : prev + step));
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [userCount, targetCount]);

  useEffect(() => {
    const checkPro = () => {
      const pro = localStorage.getItem("eromify_pro");
      setIsUserPro(pro === "true");
    };

    if (status === "unauthenticated") {
      setIsUserPro(false);
    } else {
      checkPro();
    }

    window.addEventListener("eromify_pro_updated", checkPro);
    return () =>
      window.removeEventListener("eromify_pro_updated", checkPro);
  }, [status]);

  useEffect(() => {
    const shown = sessionStorage.getItem("ai_promo_shown");
    if (!shown) {
      const t = setTimeout(() => {
        setShowAIPromo(true);
        sessionStorage.setItem("ai_promo_shown", "1");
      }, 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const handleProSuccess = () => {
    setIsUserPro(true);
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 px-4 sm:px-6 py-8 max-w-screen-2xl mx-auto w-full">

        {/* HERO */}
        <section className="mb-10 bg-white rounded-2xl p-8 lg:p-12 border border-slate-200 shadow-sm overflow-hidden relative">

          <div className="absolute inset-0 z-0 opacity-20">
            <LineWaves
              speed={0.3}
              innerLineCount={32}
              outerLineCount={36}
              warpIntensity={1}
              rotation={-45}
              color1="#1736cf"
              color2="#1430b8"
              color3="#0f269c"
              enableMouseInteraction
            />
          </div>

          <div className="relative z-10 max-w-2xl">

            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1736cf]/10 text-[#1736cf] text-sm font-semibold rounded-full mb-5">
              <Zap className="h-3.5 w-3.5" />
              Powerful AI. Affordable for Everyone.
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-slate-900 mb-5 leading-[1.1]">
              The Ultimate AI{" "}
              <br className="hidden sm:block" />
              <span className="text-[#1736cf]">
                Influencer Platform
              </span>
            </h1>

            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              Create Photos, Videos & Content Effortlessly
            </p>

            {/* FEATURES */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8">
              {[
                "AI Image Generation",
                "AI Video Creation",
                "AI Influencer Content",
                "Advanced AI Models",
                "Fast • No Setup",
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">
                    {f}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex gap-3">
              <Link
                href="/tools/creator"
                onClick={() => trackEvent("cta_click", "start_creating")}
                className="px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1 hover:scale-105 shadow-md"
                style={{
                  background:
                    "linear-gradient(135deg, #1736cf, #4f46e5)",
                  color: "white",
                }}
              >
                <Sparkles className="h-3 w-3" />
                Start Creating Now
              </Link>

              <StarBorder as={Link} href="/tools/creator" color="#1736cf" innerClassName="px-3 py-1.5">
                <span
                  onClick={() => trackEvent("cta_click", "explore_tools")}
                  className="flex items-center gap-1 text-xs font-semibold"
                >
                  Explore AI Tools <ArrowRight className="h-3 w-3" />
                </span>
              </StarBorder>
            </div>

          </div>

          {/* TRUST */}
          <div className="flex gap-10 mt-10 pt-8 border-t">
            <div className="flex items-center gap-3">
              <Users className="text-amber-500" />
              <div>
                <p className="font-bold flex items-center gap-2">
                  <span className="tabular-nums">{userCount}</span> total users
                </p>
                <p className="text-sm text-slate-500">
                  in 2 months
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Globe className="text-blue-500" />
              <div>
                <p className="font-bold">Growing fast</p>
                <p className="text-sm text-slate-500">
                  join early users
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CLAUDE CONNECTOR SECTION */}
        <section className="mb-10 px-1 w-full">
          <div className="relative bg-[#080a0f] rounded-3xl border border-white/8 overflow-hidden">

            {/* Background radial glows */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#c17d3c]/10 rounded-full blur-[120px]" />
              <div className="absolute -bottom-24 right-0 w-[400px] h-[400px] bg-violet-700/8 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 p-8 lg:p-14">

              {/* Badge */}
              <div className="flex justify-center mb-6">
                <span className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-[#c17d3c]/40 bg-[#c17d3c]/10 text-[#e8a96a] text-xs font-bold tracking-widest uppercase">
                  MCP Connector &middot; Growth &amp; Creator
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-black tracking-normal ml-1">NEW</span>
                </span>
              </div>

              {/* Headline */}
              <h2 className="text-center text-3xl sm:text-4xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight mb-5 uppercase">
                Turn{" "}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/claude-color.webp"
                  alt="Claude"
                  className="inline-block h-10 sm:h-12 lg:h-16 w-auto align-middle -mt-1 mx-1"
                />{" "}
                Claude Into Your
                <br className="hidden sm:block" /> Creative Engine
              </h2>

              <p className="text-center text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
                Plug Eromify into Claude and generate avatar portraits, cinematic videos, and full content weeks &mdash; all without leaving your chat window.
              </p>

              {/* Two-column layout */}
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">

                {/* Left: Chat mockup */}
                <div className="w-full lg:w-[55%] shrink-0">
                  <div className="bg-[#111318] border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)]">

                    {/* Window chrome */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 bg-[#0d0f14]">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                        <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">
                        Claude &middot; Eromify Connector
                      </span>
                      <div className="w-12" />
                    </div>

                    {/* Chat body */}
                    <div className="p-5 space-y-5">

                      {/* User bubble */}
                      <div className="flex justify-end">
                        <div className="max-w-[85%] bg-white/8 border border-white/10 rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-slate-200 leading-relaxed">
                          Shoot 6 IG-ready photos of Aria this week &mdash; mix outfits, moods, and lighting. Indoor cafe vibes and outdoor rooftop. 4:5 portrait.
                        </div>
                      </div>

                      {/* Claude response */}
                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="/claude-color.webp" alt="" className="w-5 h-5 object-contain" />
                        </div>
                        <div className="flex-1 text-sm text-slate-300 leading-relaxed">
                          <p className="mb-3">
                            On it. Generating 6 portraits of Aria &mdash; mixing warm cafe corners, rooftop golden hour, and moody studio lighting.
                          </p>

                          {/* Image grid */}
                          <div className="grid grid-cols-3 gap-1.5 rounded-xl overflow-hidden">
                            {[
                              "/modie/gg.png",
                              "/modie/kira.png",
                              "/modie/ria.png",
                              "/modie/sia.png",
                              "/modie/sofi.png",
                              "/modie/sturm.png",
                            ].map((src, i) => (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                key={i}
                                src={src}
                                alt={`Generated portrait ${i + 1}`}
                                className="w-full aspect-[4/5] object-cover rounded-md"
                              />
                            ))}
                          </div>

                          {/* Stats bar */}
                          <p className="mt-3 text-[11px] font-mono text-slate-500 tracking-wider uppercase">
                            6 Images &middot; 45 Credits &middot; ~30s
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Right: Feature list */}
                <div className="w-full lg:w-[45%] flex flex-col gap-4 lg:pt-2">
                  {[
                    {
                      num: "01",
                      title: "Address your avatars by name",
                      body: "Aria, Maya, Luna — Claude knows which persona to use and keeps them in character across every prompt.",
                    },
                    {
                      num: "02",
                      title: "Batch-generate a week of content",
                      body: "One prompt, one send. Twelve portraits rendered while you plan what to post next.",
                    },
                    {
                      num: "03",
                      title: "Kick off videos without switching tabs",
                      body: "Animate any image with Wan, Veo, or Seedance — Claude picks the right model and queues it automatically.",
                    },
                  ].map(({ num, title, body }) => (
                    <div
                      key={num}
                      className="bg-white/4 border border-white/8 rounded-2xl p-5 hover:border-[#c17d3c]/40 hover:bg-white/6 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-[#c17d3c] font-mono text-sm font-bold shrink-0 mt-0.5">
                          {num}
                        </span>
                        <div>
                          <p className="text-white font-bold text-sm mb-1.5">{title}</p>
                          <p className="text-slate-400 text-sm leading-relaxed">{body}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              {/* CTAs */}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href={isUserPro ? "/mcp-keys" : "/pricing"}
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-black font-bold rounded-xl hover:bg-slate-100 hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] text-sm"
                >
                  Connect Claude
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/mcp"
                  className="text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  See how it works
                </Link>
              </div>

              {/* Fine print */}
              <p className="mt-6 text-center text-xs text-slate-600 leading-relaxed">
                Available on{" "}
                <span className="text-slate-400 font-semibold">Growth</span> and{" "}
                <span className="text-slate-400 font-semibold">Creator</span> plans &middot; 5-minute setup &middot; Works with Claude Desktop, claude.ai &amp; Cursor
              </p>

            </div>
          </div>
        </section>

        {/* WHAT WILL YOU CREATE TODAY */}
        <section className="mb-10 px-1 w-full">
          <div className="bg-[#101314] rounded-3xl p-8 lg:p-12 flex flex-col lg:flex-row items-center gap-8 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-emerald-900/10 to-transparent pointer-events-none" />

            {/* Left Content */}
            <div className="w-full lg:w-[35%] relative z-10 shrink-0">
              <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight mb-4 tracking-tight uppercase">
                What will you <br />
                <span className="text-[#ccff00]">Create Today?</span>
              </h2>
              <p className="text-slate-400 text-sm lg:text-base leading-relaxed mb-8 max-w-xs">
                Create authentic images and videos with natural texture and easy style
              </p>
              <Link
                href="/tools/creator"
                className="inline-flex items-center gap-2 bg-[#ccff00] text-black font-bold px-6 py-3 rounded-xl hover:scale-105 hover:bg-[#b8e600] transition-all shadow-[0_0_20px_rgba(204,255,0,0.2)]"
              >
                Explore all tools <Sparkles className="w-4 h-4" />
              </Link>
            </div>

            {/* Right Content - Cards Scroll */}
            <div className="w-full lg:w-[65%] overflow-x-auto flex gap-4 pb-4 lg:pb-0 pt-2 lg:pt-0 snap-x snap-mandatory z-10 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {[
                { title: "Create Image", img: "/loginlayout/logind.webp", link: "/tools/creator/image-generator", isNew: false },
                { title: "Create Video", video: CLD.seefour, link: "/video-generation", isNew: false },
                { title: "Seedance 2.0", video: CLD.seedancesix, link: "/video-generation", isNew: true },
                { title: "Wan 2.7", video: CLD.seedance, link: "/video-generation", isNew: false },
              ].map((tool, i) => (
                <Link
                  key={i}
                  href={tool.link}
                  className="shrink-0 snap-center w-[160px] sm:w-[180px] group flex flex-col bg-[#1a1d1e] rounded-xl border border-white/5 hover:border-white/20 transition-all hover:-translate-y-1"
                >
                  <div className="relative h-[160px] sm:h-[180px] w-full rounded-t-xl overflow-hidden bg-black/50">
                    {tool.video ? (
                      <video src={tool.video} autoPlay loop muted playsInline className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={tool.img} alt={tool.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    )}
                    {tool.isNew && (
                      <span className="absolute top-2 left-2 bg-[#ccff00] text-black text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                        NEW
                      </span>
                    )}
                  </div>
                  <div className="p-3.5 flex items-center justify-between">
                    <span className="text-white font-bold text-sm">{tool.title}</span>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CREATOR REELS */}
        <section className="mb-10 px-1 w-full relative">
          <style>{`
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {/* Navigation Buttons */}
          <button
            onClick={() => scrollCarousel('left')}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-slate-900 rounded-full p-2 shadow-lg backdrop-blur transition-all hover:scale-110 md:hidden group-hover/carousel:flex"
            aria-label="Previous videos"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() => scrollCarousel('right')}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-slate-900 rounded-full p-2 shadow-lg backdrop-blur transition-all hover:scale-110 md:hidden group-hover/carousel:flex"
            aria-label="Next videos"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="relative group/carousel">
            {/* Desktop buttons shown on hover */}
            <button
              onClick={() => scrollCarousel('left')}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-slate-900 rounded-full p-2 shadow-lg backdrop-blur transition-all hover:scale-110 opacity-0 group-hover/carousel:opacity-100 hidden md:block"
              aria-label="Previous videos"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={() => scrollCarousel('right')}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-slate-900 rounded-full p-2 shadow-lg backdrop-blur transition-all hover:scale-110 opacity-0 group-hover/carousel:opacity-100 hidden md:block"
              aria-label="Next videos"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div
              ref={carouselRef}
              className="flex overflow-x-auto gap-4 lg:gap-6 pb-6 snap-x snap-mandatory hide-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {[
                {
                  src: CLD.reel218,
                  tag: "AI Influencer",
                  handle: "@niabasic",
                  name: "Nia Noir",
                  posts: "82",
                  followers: "664K",
                  following: "0",
                  bio: ""
                },
                {
                  src: CLD.reel420,
                  tag: "Motion Control",
                  handle: "",
                  name: "",
                  posts: "",
                  followers: "",
                  following: "",
                  bio: ""
                },
                {
                  src: CLD.reel480,
                  tag: "AI Influencer",
                  handle: "@carrieparker.ai",
                  name: "Carrie Parker",
                  posts: "170",
                  followers: "16.6K",
                  following: "985",
                  bio: "💛 AI Influencer\n✨ Build an AI that earns income\n💌 Collabs: carrieparker.ai@gmail.com"
                },
                {
                  src: CLD.reel525,
                  tag: "Blogger",
                  handle: "@dahliamartinx",
                  name: "Dahlia Martin 💗",
                  posts: "21",
                  followers: "85.8K",
                  following: "842",
                  bio: "Influencer | Creator of CTRL//VAULT and TRDR\n🇬🇧 / 🇲🇾\n💌 Collabs - dahliamartinx@gmail.com\nbeacons.ai/dahliamartin"
                }
              ].map((reel, i) => (
                <div
                  key={i}
                  className="snap-center shrink-0 w-[85vw] sm:w-[40vw] md:w-[28vw] lg:w-[22vw] max-w-[320px] relative aspect-[9/16] rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-200/50 group bg-slate-900"
                >
                  <video
                    src={reel.src}
                    autoPlay
                    loop
                    muted={mutedMap[i] !== false}
                    playsInline
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Always-on Gradient for Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

                  {/* Top row: badge + per-card mute button */}
                  <div className="absolute top-3 left-0 right-0 px-3 flex items-center justify-between z-20">
                    {reel.tag ? (
                      <div className="bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide border border-white/20">
                        {reel.tag}
                      </div>
                    ) : <div />}

                    <button
                      onClick={() => toggleMute(i)}
                      title={mutedMap[i] !== false ? "Unmute" : "Mute"}
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-black/80 transition-all hover:scale-110 active:scale-95"
                      style={{ fontSize: 16, lineHeight: 1 }}
                    >
                      {mutedMap[i] !== false ? "🔇" : "🔊"}
                    </button>
                  </div>

                  {/* Bottom Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10 flex flex-col gap-1.5 pointer-events-none">
                    {reel.name && (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm tracking-tight">{reel.name}</span>
                        {reel.handle && <span className="text-xs text-white/70 font-medium">{reel.handle}</span>}
                      </div>
                    )}

                    {(reel.followers || reel.posts) && (
                      <div className="flex items-center gap-3 text-[10px] text-white/90 font-semibold tracking-wide">
                        {reel.posts && <span>{reel.posts} posts</span>}
                        {reel.followers && <span>{reel.followers} followers</span>}
                        {reel.following && <span>{reel.following} following</span>}
                      </div>
                    )}

                    {reel.bio && (
                      <div className="text-[10px] text-white/70 line-clamp-2 group-hover:line-clamp-none mt-0.5 leading-snug whitespace-pre-line transition-all duration-300">
                        {reel.bio}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED MODELS */}
        <section className="mb-10 px-1">
          <div className="flex flex-col items-center text-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-black text-black mb-2">
              Featured Models
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: "Wan 2.6", img: "/image.webp", type: "image-to-video", isNew: true, badgeText: "LATEST", desc: "Text-to-video & image-to-video — describe a scene from scratch" },
              { name: "Seedance 2.0", img: "/image2.webp", type: "image-to-video", isNew: true, badgeText: "LATEST", desc: "High-fidelity video generation with cinematic motion quality" },
              { name: "Veo 3.1 Fast", img: "/image4.webp", type: "image-to-video", isNew: true, badgeText: "LATEST", desc: "Google's Veo — ultra-fast video with exceptional visual quality" },
              { name: "FLUX.2 Klein 4B", img: "/featured/featured.webp", type: "text-to-image", isNew: true, desc: "High-quality text-to-image model based on FLUX architecture." },
              { name: "klein", img: "/featured/featuredf.webp", type: "text-to-image", isNew: true, desc: "A fast and efficient text-to-image model." },
              { name: "FLUX.1 Kontext", img: "/featured/featuredb.webp", type: "text-to-image", isNew: false, desc: "An advanced version of FLUX for creative image generation." },
              { name: "GPT Image 2", img: "/featured/featuredc.webp", type: "text-to-image", isNew: true, desc: "Next-generation text-to-image generation from OpenAI." },
              { name: "FLUX.1 Kontext", img: "/featured/featuredd.webp", type: "text-to-image", isNew: false, desc: "An advanced version of FLUX for creative image generation." },
              { name: "Qwen Image Plus", img: "/featured/featurede.webp", type: "text-to-image", isNew: false, desc: "State-of-the-art vision generation model from Alibaba." },
            ].map((model, i) => {
              const typeColors: Record<string, string> = {
                "image-to-video": "bg-rose-100 text-rose-700",
                "text-to-image": "bg-violet-100 text-violet-700",
                "image-to-image": "bg-sky-100 text-sky-700",
                "video-to-video": "bg-amber-100 text-amber-700",
                "upscale": "bg-emerald-100 text-emerald-700",
              };
              return (
                <div
                  key={i}
                  className="group relative bg-[#111] rounded-xl overflow-hidden border border-white/10 hover:border-white/25 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(23,54,207,0.15)] cursor-pointer"
                  style={{
                    animation: `float ${3 + (i % 3)}s ease-in-out infinite alternate`,
                    animationDelay: `${(i % 5) * 0.4}s`
                  }}
                >
                  <style jsx>{`
                    @keyframes float {
                      0% { transform: translateY(0px); }
                      100% { transform: translateY(-4px); }
                    }
                  `}</style>
                  {/* Thumbnail */}
                  <div className="relative h-40 overflow-hidden bg-zinc-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={model.img}
                      alt={model.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111]/80 via-transparent to-transparent" />
                    {/* NEW / LATEST badge */}
                    {model.isNew && (
                      <span className={`absolute top-3 left-3 text-black text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide ${model.badgeText === 'LATEST' ? 'bg-[#ccff00]' : 'bg-[#00e676]'}`}>
                        {model.badgeText || "NEW"}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="text-white font-bold text-sm mb-2 leading-snug">{model.name}</p>
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 ${typeColors[model.type] ?? "bg-slate-100 text-slate-600"}`}
                    >
                      {model.type}
                    </span>
                    <p className="text-zinc-400 text-xs leading-relaxed line-clamp-3">{model.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SEEDANCE PRO BANNER */}
        <section className="mb-16 px-1 w-full">
          <div className="bg-[#0b0e14] rounded-3xl border border-white/10 p-4 lg:p-6 flex flex-col lg:flex-row gap-6 lg:gap-8 relative overflow-hidden items-center">
            {/* Background glow */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-blue-500/10 blur-[100px] pointer-events-none" />

            {/* Left Side: Image with Overlay Button */}
            <div className="w-full lg:w-[35%] flex justify-center lg:justify-start relative z-10 shrink-0">
              <div className="relative inline-block w-full max-w-[320px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/seedacepro.webp"
                  alt="Seedance 2.0"
                  className="w-full h-auto object-contain"
                />

                {/* Create Button Overlaying the Image */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[80%]">
                  <Link
                    href="/video-generation"
                    className="block w-full bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-300 hover:to-cyan-300 text-black font-bold py-2.5 px-6 rounded-lg text-center shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all hover:scale-105"
                  >
                    Create
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Side: Responsive Video Grid */}
            <div className="w-full lg:w-[65%] relative z-10">
              <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 lg:gap-3">
                {[
                  CLD.seefour, CLD.seedancesix, CLD.seedance, CLD.sedanc,
                  CLD.seedancesss, CLD.seefour, CLD.seedance, CLD.seedancesix
                ].map((src, idx) => (
                  <div key={idx} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-[#1a1d24] border border-white/5 group shadow-lg">
                    <video
                      src={src}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              {/* Overlay Button */}
              <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 z-20 pointer-events-none">
                <Link
                  href="/video-generation"
                  className="bg-[#ccff00]/90 hover:bg-[#ccff00] text-black font-bold py-1.5 px-4 md:py-2 md:px-5 rounded-lg text-xs md:text-sm transition-all shadow-lg flex items-center gap-1.5 md:gap-2 backdrop-blur-md pointer-events-auto"
                >
                  View all <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* UPCOMING MODELS */}
        <section className="mb-10 px-1">
          <div className="flex flex-col items-center text-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-black text-black mb-2">
              Upcoming Models
            </h2>
            <p className="text-black text-sm max-w-xl mx-auto font-medium">
              Generate images, videos, edits and more with the latest AI models.
            </p>
            <Link
              href="/tools/creator"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#1736cf] hover:underline bg-[#1736cf]/10 px-4 py-2 rounded-full transition-colors hover:bg-[#1736cf]/20"
            >
              Explore All Tools <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { name: "Seedance 2.0", img: "/image.webp", type: "image-to-video", isNew: true, desc: "ByteDance's most advanced video generation model. Cinematic output with native audio, real-world physics, and director-level camera control." },
              { name: "Seedance 2.0 Fast", img: "/image2.webp", type: "image-to-video", isNew: true, desc: "ByteDance's most advanced video generation model. Cinematic output with native audio, real-world physics, and director-level camera control." },
              { name: "Kling 3.0 Pro", img: "/image3.webp", type: "image-to-video", isNew: true, desc: "Top-tier image-to-video with cinematic visuals, fluid motion, and native audio generation, with custom element support." },
              { name: "Nano Banana 2", img: "/image4.webp", type: "text-to-image", isNew: true, desc: "Google's new state-of-the-art fast image generation and editing model." },
              { name: "Sora 2 Pro", img: "/image5.webp", type: "image-to-video", isNew: false, desc: "OpenAI's state-of-the-art video model capable of creating richly detailed, dynamic clips with audio from natural language or images." },
              { name: "Veo 3.1", img: "/image6.webp", type: "image-to-video", isNew: false, desc: "The latest state-of-the-art video generation model from Google DeepMind." },
              { name: "FLUX 2 Max", img: "/image7.webp", type: "text-to-image", isNew: false, desc: "Ultra-high-quality image generation model for maximum detail, realism, and prompt accuracy." },
              { name: "Seedance 2.0", img: "/image8.webp", type: "text-to-image", isNew: false, desc: "A new-generation image creation model by ByteDance, integrating image generation and editing capabilities into a single, unified architecture." },
              { name: "Kling Motion Control Pro", img: "/image.webp", type: "video-to-video", isNew: false, desc: "Transfer movements from a reference video to any character image. Pro mode delivers higher quality output." },
              { name: "Kling Image O3", img: "/image2.webp", type: "image-to-image", isNew: true, desc: "Advanced image editing model for modifying images with high realism and detail." },
              { name: "Seedance 1.5", img: "/image3.webp", type: "image-to-video", isNew: false, desc: "Generate videos with audio with Seedance 1.5 (supports start & end frame)." },
              { name: "WAN 2.6", img: "/image4.webp", type: "image-to-video", isNew: false, desc: "AI video generation model supporting stylized motion and creative scenes." },
              { name: "Z-image Turbo", img: "/image5.webp", type: "text-to-image", isNew: false, desc: "A super fast text-to-image model of 6B parameters developed by Tongyi-MAI." },
              { name: "Topaz Video Upscale", img: "/image6.webp", type: "upscale", isNew: false, desc: "Professional-grade video upscaling using Topaz technology. Enhance your videos with high-quality upscaling." },
              { name: "Kling Video O3", img: "/image7.webp", type: "video-to-video", isNew: true, desc: "Generates new shots guided by an input reference video, preserving cinematic language such as motion and camera style." },
              { name: "Kling 2.6 Pro", img: "/image8.webp", type: "image-to-video", isNew: false, desc: "Top-tier image-to-video with cinematic visuals, fluid motion, and native audio generation." },
            ].map((model, i) => {
              const typeColors: Record<string, string> = {
                "image-to-video": "bg-rose-100 text-rose-700",
                "text-to-image": "bg-violet-100 text-violet-700",
                "image-to-image": "bg-sky-100 text-sky-700",
                "video-to-video": "bg-amber-100 text-amber-700",
                "upscale": "bg-emerald-100 text-emerald-700",
              };
              return (
                <div
                  key={i}
                  className="group relative bg-[#111] rounded-xl overflow-hidden border border-white/10 hover:border-white/25 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(23,54,207,0.15)] cursor-pointer"
                  style={{
                    animation: `float ${3 + (i % 3)}s ease-in-out infinite alternate`,
                    animationDelay: `${(i % 5) * 0.4}s`
                  }}
                >
                  <style jsx>{`
                    @keyframes float {
                      0% { transform: translateY(0px); }
                      100% { transform: translateY(-4px); }
                    }
                  `}</style>
                  {/* Thumbnail */}
                  <div className="relative h-40 overflow-hidden bg-zinc-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={model.img}
                      alt={model.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111]/80 via-transparent to-transparent" />
                    {/* NEW badge */}
                    {model.isNew && (
                      <span className="absolute top-3 left-3 bg-[#00e676] text-black text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide">
                        NEW
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="text-white font-bold text-sm mb-2 leading-snug">{model.name}</p>
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 ${typeColors[model.type] ?? "bg-slate-100 text-slate-600"}`}
                    >
                      {model.type}
                    </span>
                    <p className="text-zinc-400 text-xs leading-relaxed line-clamp-3">{model.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </section>


        {/* FAQ SECTION */}
        <section className="mb-10 mt-16 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-3">Frequently Asked Questions</h2>
            <p className="text-slate-500">Everything you need to know about Eromify AI.</p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <details key={i} className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow [&_summary::-webkit-details-marker]:hidden">
                <summary className="text-lg font-bold text-slate-900 flex items-center justify-between gap-3 cursor-pointer list-none">
                  <div className="flex items-start gap-3">
                    <span className="text-[#1736cf] mt-0.5">Q.</span>
                    <span>{faq.q}</span>
                  </div>
                  <span className="transition-transform duration-300 group-open:rotate-180 flex-shrink-0 text-slate-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <p className="text-slate-600 leading-relaxed pl-7 mt-4 animate-in fade-in duration-300">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>

          {/* JSON-LD SEO Schema for FAQ */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "name": "Eromify – Frequently Asked Questions",
                "description": "Common questions about Eromify, the all-in-one AI media generation platform for creators and brands.",
                "url": "https://www.eromify.in",
                "mainEntity": FAQS.map(faq => ({
                  "@type": "Question",
                  "name": faq.q,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.a
                  }
                }))
              })
            }}
          />
        </section>
      </div>
      <Footer />
      <ProUpgradeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleProSuccess}
      />
      <AIPromoModal
        isOpen={showAIPromo}
        onClose={() => setShowAIPromo(false)}
      />
    </div>
  );
}
