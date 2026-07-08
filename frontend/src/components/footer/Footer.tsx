import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Bot,
  Gift,
  ScanFace,
  Wand2,
  Globe,
  Shirt,
  Dumbbell,
  Instagram,
  UserRound,
  UserRoundCheck,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0B0F19] mt-auto">
      <div className="max-w-screen-2xl mx-auto px-6 py-12 lg:py-20">

        {/* AI Influencer Tools Hub */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-white font-black text-lg">Popular AI Influencer Tools</h2>
              <p className="text-slate-500 text-xs mt-0.5">Create photorealistic virtual influencers for any platform or niche.</p>
            </div>
            <Link href="/ai-influencer-generator" className="text-xs font-bold text-[#1736cf] hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {([
              { label: "AI Influencer Generator", href: "/ai-influencer-generator", Icon: Bot, color: "text-violet-400", bg: "bg-violet-500/10", desc: "Create consistent AI influencers" },
              { label: "Free Generator", href: "/free-ai-influencer-generator", Icon: Gift, color: "text-emerald-400", bg: "bg-emerald-500/10", desc: "Start free, no card needed" },
              { label: "Realistic AI Influencer", href: "/realistic-ai-influencer-generator", Icon: ScanFace, color: "text-sky-400", bg: "bg-sky-500/10", desc: "Photorealistic output" },
              { label: "AI Influencer Maker", href: "/ai-influencer-maker", Icon: Wand2, color: "text-amber-400", bg: "bg-amber-500/10", desc: "Full persona builder" },
              { label: "Virtual Influencer", href: "/virtual-influencer-creator", Icon: Globe, color: "text-blue-400", bg: "bg-blue-500/10", desc: "Launch a digital brand" },
              { label: "AI Fashion Influencer", href: "/ai-fashion-influencer-generator", Icon: Shirt, color: "text-pink-400", bg: "bg-pink-500/10", desc: "Fashion & style content" },
              { label: "AI Fitness Influencer", href: "/ai-fitness-influencer-generator", Icon: Dumbbell, color: "text-orange-400", bg: "bg-orange-500/10", desc: "Gym & wellness models" },
              { label: "AI Instagram Influencer", href: "/ai-instagram-influencer-generator", Icon: Instagram, color: "text-fuchsia-400", bg: "bg-fuchsia-500/10", desc: "IG-optimized AI personas" },
              { label: "AI Female Influencer", href: "/ai-female-influencer-generator", Icon: UserRound, color: "text-rose-400", bg: "bg-rose-500/10", desc: "Beauty, fashion, lifestyle" },
              { label: "AI Male Influencer", href: "/ai-male-influencer-generator", Icon: UserRoundCheck, color: "text-cyan-400", bg: "bg-cyan-500/10", desc: "Fitness, style, business" },
            ] as const).map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group bg-white/5 border border-white/[0.08] rounded-2xl p-4 hover:bg-white/10 hover:border-[#1736cf]/40 transition-all duration-200"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${tool.bg}`}>
                  <tool.Icon className={`w-5 h-5 ${tool.color}`} />
                </div>
                <p className="text-sm font-bold text-white group-hover:text-[#1736cf] transition-colors leading-snug mb-1">{tool.label}</p>
                <p className="text-xs text-slate-500 leading-snug">{tool.desc}</p>
              </Link>
            ))}
          </div>
          <div className="mt-8 border-t border-white/10" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12 lg:gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6 group w-fit">
              <div className="w-12 h-12 relative bg-white/5 rounded-xl p-2 border border-white/10 transition-colors group-hover:bg-white/10">
                <Image
                  src="/eromifylogo.png"
                  alt="Eromify Logo"
                  fill
                  className="object-contain p-1"
                />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">Eromify</span>
            </Link>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed max-w-sm">
              The ultimate workspace for your daily digital tasks. Fast, secure,
              and always free.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/eromify.in/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#1736cf] hover:shadow-[0_0_20px_rgba(23,54,207,0.5)] transition-all duration-300"
              >
                {/* Instagram SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Company */}
          <div className="col-span-1">
            <h6 className="font-bold text-white tracking-wider uppercase text-xs mb-6">Company</h6>
            <ul className="space-y-4 text-sm text-slate-400">
              {[
                { name: "About Us", href: "/about" },
                { name: "Contact", href: "#" },
                { name: "Affiliates", href: "#" },
                { name: "Blog", href: "/blog" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="group flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 text-[#1736cf] transition-all duration-300" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* AI Influencer Tools */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <h6 className="font-bold text-white tracking-wider uppercase text-xs mb-6">AI Influencer Tools</h6>
            <ul className="space-y-4 text-sm text-slate-400">
              {[
                { name: "AI Influencer Generator", href: "/ai-influencer-generator" },
                { name: "Free AI Influencer Generator", href: "/free-ai-influencer-generator" },
                { name: "Virtual Influencer Creator", href: "/virtual-influencer-creator" },
                { name: "AI Influencer Maker", href: "/ai-influencer-maker" },
                { name: "Realistic AI Influencer", href: "/realistic-ai-influencer-generator" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="group flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 text-[#1736cf] transition-all duration-300" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Niche Generators */}
          <div className="col-span-1">
            <h6 className="font-bold text-white tracking-wider uppercase text-xs mb-6">By Niche</h6>
            <ul className="space-y-4 text-sm text-slate-400">
              {[
                { name: "AI Fashion Influencer", href: "/ai-fashion-influencer-generator" },
                { name: "AI Fitness Influencer", href: "/ai-fitness-influencer-generator" },
                { name: "AI Instagram Influencer", href: "/ai-instagram-influencer-generator" },
                { name: "AI Female Influencer", href: "/ai-female-influencer-generator" },
                { name: "AI Male Influencer", href: "/ai-male-influencer-generator" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="group flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 text-[#1736cf] transition-all duration-300" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom row */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Eromify Online Tools. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-slate-400">
            <Link href="/tools/image-to-webp" className="flex items-center gap-1 text-slate-500 hover:text-white transition-colors">
              <ArrowRight className="h-3 w-3" />
              Image to WebP
            </Link>
            <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium text-slate-300">All systems operational</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
