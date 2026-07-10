"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Check, Shield, Copy, ExternalLink, Zap, Lock, Activity, RefreshCw } from "lucide-react";

export default function McpLandingPage() {
  const [copiedUrl, setCopiedUrl] = useState(false);


  const copyUrl = () => {
    navigator.clipboard.writeText("https://api.eromify.in/mcp");
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };



  return (
    <div className="min-h-screen bg-[#080a0f] text-slate-200 selection:bg-pink-500/30 font-sans overflow-x-hidden relative">
      {/* Background dot grid */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.15]" 
        style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
      />



      <main className="relative z-10 pt-24 pb-32">
        {/* ── HERO ── */}
        <div className="max-w-7xl mx-auto px-6 text-center mb-32">
          <div className="inline-flex items-center gap-3 border border-white/10 bg-white/5 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-[#ec4899] mb-8">
            MCP CONNECTOR &middot; GROWTH & CREATOR
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-black tracking-normal">NEW</span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[1.1] mb-8 flex flex-wrap justify-center items-center gap-x-4">
            TURN 
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 mx-1 shrink-0 -translate-y-1 relative">
              <Image src="/claude-color.webp" alt="Claude" fill className="object-contain" />
            </div>
            CLAUDE INTO YOUR
            <br className="hidden md:block" />
            CREATIVE ENGINE
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-20 leading-relaxed">
            Connect Eromify to Claude and generate avatar images, videos, and full campaigns right from your conversations.
          </p>

          {/* 3 Steps */}
          <div className="grid md:grid-cols-3 gap-0 border border-white/10 rounded-3xl overflow-hidden bg-black/40 backdrop-blur-xl">
            {/* Step 1 */}
            <div className="p-8 text-left border-b md:border-b-0 md:border-r border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-mono text-white">1</div>
                <h3 className="text-lg font-bold text-white">Open Claude settings</h3>
              </div>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                Launch Claude Desktop or open <span className="text-white">claude.ai</span> and go to:
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-white hover:bg-white/10 cursor-pointer transition-colors">
                Settings &rarr; Connectors <ExternalLink className="w-3.5 h-3.5 opacity-50" />
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="p-8 text-left border-b md:border-b-0 md:border-r border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-mono text-white">2</div>
                <h3 className="text-lg font-bold text-white">Add a custom connector</h3>
              </div>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                Name it <span className="text-white">Eromify</span> and paste the URL:
              </p>
              <div 
                onClick={copyUrl}
                className="flex items-center justify-between gap-2 px-4 py-3 bg-black border border-white/10 rounded-xl text-sm font-mono text-white hover:border-white/30 cursor-pointer transition-all group"
              >
                <span className="truncate">https://api.eromify.in/mcp</span>
                {copiedUrl ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-500 group-hover:text-white" />}
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-8 text-left">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-mono text-white">3</div>
                <h3 className="text-lg font-bold text-white">Click Connect, approve, done</h3>
              </div>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                Claude pops open Eromify in a new tab &mdash; sign in if needed, click <strong className="text-white">Authorize</strong>, and you&apos;re back in Claude. No API keys to paste.
              </p>
              <Link href="/mcp-keys" className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-colors">
                Manage connections &rarr;
              </Link>
            </div>
          </div>
          
          <div className="mt-12 text-sm text-slate-400">
            Already on Growth or Creator? <Link href="/mcp-keys" className="text-white hover:underline font-medium inline-flex items-center gap-1">Jump straight to your API keys &rarr;</Link>
          </div>
        </div>

        {/* ── SECTION: A COMPLETE STUDIO ── */}
        <div className="max-w-6xl mx-auto px-6 mb-32">
          <div className="text-center mb-24">
            <h4 className="text-xs font-bold tracking-widest uppercase text-[#ec4899] mb-4">A COMPLETE STUDIO</h4>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-6">
              YOUR WHOLE ENGINE<br />INSIDE CLAUDE
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              13 tools, one connection. Manage avatars, generate, edit, automate &mdash; all from a chat.
            </p>
          </div>

          {/* Features Grid */}
          <div className="space-y-32">
            
            {/* Feature 1: Avatar Library */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Mockup */}
              <div className="bg-[#121212] rounded-2xl border border-white/10 shadow-2xl p-6 relative overflow-hidden">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-white/20" />
                    <div className="w-3 h-3 rounded-full bg-white/20" />
                    <div className="w-3 h-3 rounded-full bg-white/20" />
                  </div>
                  <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Claude &middot; Eromify</div>
                  <div className="w-12" />
                </div>
                
                <div className="flex justify-end mb-6">
                  <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white">
                    List my avatars
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-transparent flex items-center justify-center shrink-0 mt-0.5 relative overflow-hidden">
                    <Image src="/claude-color.webp" alt="Claude" fill className="object-contain" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-300 mb-4">You have 4 avatars:</p>
                    <div className="space-y-2">
                      {['Lily', 'Aria', 'Noa', 'Maya'].map((name, i) => (
                        <div key={i} className="flex items-center justify-between bg-black/40 border border-white/5 rounded-lg p-2.5">
                          <div className="flex items-center gap-3">
                            <Image src={`/modie/${name.toLowerCase() === 'noa' ? 'ria' : name.toLowerCase() === 'maya' ? 'sia' : name.toLowerCase() === 'aria' ? 'kira' : 'gg'}.png`} width={24} height={24} alt={name} className="w-6 h-6 rounded-full object-cover" />
                            <span className="text-sm text-white font-medium">{name}</span>
                          </div>
                          <span className="text-[9px] font-mono tracking-widest text-emerald-400 uppercase">Ready</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Text */}
              <div>
                <h4 className="text-xs font-bold tracking-widest uppercase text-[#ec4899] mb-4">AVATAR LIBRARY</h4>
                <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.1] mb-6">
                  TALK TO YOUR<br />AVATARS BY NAME
                </h3>
                <p className="text-lg text-slate-400 leading-relaxed">
                  Claude can list every avatar in your account &mdash; name, niche, and reference photo. Reference one by name and it generates new scenes of them with their face kept consistent. No LoRA training, no trigger words.
                </p>
              </div>
            </div>

            {/* Feature 2: Bulk Generation */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Text (Left on Desktop) */}
              <div className="order-2 lg:order-1">
                <h4 className="text-xs font-bold tracking-widest uppercase text-[#ec4899] mb-4">BULK GENERATION</h4>
                <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.1] mb-6">
                  50 POSTS. ONE<br />PROMPT.
                </h3>
                <p className="text-lg text-slate-400 leading-relaxed">
                  Tell Claude what you want, get a campaign. Vary locations, outfits, styles, aspect ratios. Same credit cost as the website &mdash; no markup, no extra fees.
                </p>
              </div>

              {/* Mockup (Right on Desktop) */}
              <div className="order-1 lg:order-2 bg-[#121212] rounded-2xl border border-white/10 shadow-2xl p-6 relative overflow-hidden">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-white/20" />
                    <div className="w-3 h-3 rounded-full bg-white/20" />
                    <div className="w-3 h-3 rounded-full bg-white/20" />
                  </div>
                  <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Claude &middot; Eromify</div>
                  <div className="w-12" />
                </div>
                
                <div className="flex justify-end mb-6">
                  <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-white max-w-[90%] leading-relaxed">
                    Generate 12 IG-ready photos of Lily for next week &mdash; vary the outfits, moods, and lighting. Mix of indoor and outdoor. 4:5 portrait.
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-transparent flex items-center justify-center shrink-0 mt-0.5 relative overflow-hidden">
                    <Image src="/claude-color.webp" alt="Claude" fill className="object-contain" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-300 mb-4">Generating 12 images...</p>
                    <div className="grid grid-cols-4 gap-1 rounded-lg overflow-hidden mb-3">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="aspect-[4/5] bg-slate-800 relative">
                          <Image src={['/modie/gg.png', '/modie/kira.png', '/modie/ria.png', '/modie/sia.png', '/modie/sofi.png', '/modie/sturm.png'][i % 6]} alt="" fill className="object-cover opacity-80" />
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] font-mono text-emerald-400 tracking-wide uppercase">✓ Done &middot; 120 credits used</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Image to Video */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Mockup */}
              <div className="bg-[#121212] rounded-2xl border border-white/10 shadow-2xl p-6 relative overflow-hidden">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-white/20" />
                    <div className="w-3 h-3 rounded-full bg-white/20" />
                    <div className="w-3 h-3 rounded-full bg-white/20" />
                  </div>
                  <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Claude &middot; Eromify</div>
                  <div className="w-12" />
                </div>
                
                <div className="flex justify-end mb-6">
                  <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-white max-w-[85%] leading-relaxed">
                    Make a 5s video of this image &mdash; slow zoom in, cinematic. Use Kling 2.5 turbo.
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-transparent flex items-center justify-center shrink-0 mt-0.5 relative overflow-hidden">
                    <Image src="/claude-color.webp" alt="Claude" fill className="object-contain" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-300 mb-4 flex flex-wrap items-center gap-1.5">
                      <span>Running</span>
                      <code className="text-[#ec4899] bg-[#ec4899]/10 px-1.5 py-0.5 rounded text-xs font-mono">kling-2.5-turbo</code> 
                      <span className="text-slate-500">&middot; 5s &middot; 9:16</span>
                    </p>
                    
                    <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden border border-white/10 mb-3 group cursor-pointer">
                      <Image src="/modie/kira.png" alt="Video thumbnail" fill className="object-cover opacity-60 group-hover:opacity-50 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-[9px] font-mono text-white">00:05</div>
                    </div>
                    <p className="text-[10px] font-mono text-emerald-400 tracking-wide uppercase">✓ 50 credits</p>
                  </div>
                </div>
              </div>

              {/* Text */}
              <div>
                <h4 className="text-xs font-bold tracking-widest uppercase text-[#ec4899] mb-4">IMAGE TO VIDEO</h4>
                <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.1] mb-6">
                  BRING STILLS TO LIFE
                </h3>
                <p className="text-lg text-slate-400 leading-relaxed">
                  Pick any image and a motion prompt. Choose Kling, Veo, Sora, Hailuo, WAN &mdash; Claude picks the right model from cost and quality cues in your prompt.
                </p>
              </div>
            </div>

            {/* Feature 4: Same Credits */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Text (Left on Desktop) */}
              <div className="order-2 lg:order-1">
                <h4 className="text-xs font-bold tracking-widest uppercase text-[#ec4899] mb-4">SAME CREDITS, NO MARKUP</h4>
                <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.1] mb-6">
                  YOUR BUDGET,<br />YOUR CONTROL
                </h3>
                <p className="text-lg text-slate-400 leading-relaxed">
                  Claude can read your credit balance, plan, and daily limits before any expensive call. You stay in control of spend &mdash; and you never pay extra to drive Eromify from Claude.
                </p>
              </div>

              {/* Mockup (Right on Desktop) */}
              <div className="order-1 lg:order-2 bg-[#121212] rounded-2xl border border-white/10 shadow-2xl p-6 relative overflow-hidden">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-white/20" />
                    <div className="w-3 h-3 rounded-full bg-white/20" />
                    <div className="w-3 h-3 rounded-full bg-white/20" />
                  </div>
                  <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Claude &middot; Eromify</div>
                  <div className="w-12" />
                </div>
                
                <div className="flex justify-end mb-6">
                  <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-white max-w-[85%] leading-relaxed">
                    How many credits do I have? Can I run 50 videos?
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-transparent flex items-center justify-center shrink-0 mt-0.5 relative overflow-hidden">
                    <Image src="/claude-color.webp" alt="Claude" fill className="object-contain" />
                  </div>
                  <div className="flex-1 text-sm text-slate-300">
                    <p className="mb-4 text-slate-400 italic">Pulling your balance...</p>
                    
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-black/40 border border-white/5 rounded-lg p-3 text-center">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Credits</div>
                        <div className="text-xl font-mono text-white">6,000</div>
                      </div>
                      <div className="bg-black/40 border border-white/5 rounded-lg p-3 text-center">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Plan</div>
                        <div className="text-sm font-bold text-white mt-1">Growth</div>
                      </div>
                      <div className="bg-black/40 border border-emerald-500/20 rounded-lg p-3 text-center">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Status</div>
                        <div className="text-sm font-bold text-emerald-400 mt-1">Active</div>
                      </div>
                    </div>

                    <p className="leading-relaxed">
                      50 videos at ~50 credits each = 2,500 credits. You have 6,000 &mdash; plenty of room.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── SECTION: WHAT YOU CAN SHIP ── */}
        <div className="border-y border-white/5 bg-white/[0.01] py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h4 className="text-xs font-bold tracking-widest uppercase text-[#ec4899] mb-4">WHAT YOU CAN SHIP</h4>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                FROM IDEA TO CAMPAIGN<br />IN ONE CONVERSATION
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors flex flex-col">
                <div>
                  <div className="inline-block bg-white/10 rounded-lg px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase text-slate-300 mb-6">
                    QUICK ASSET
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Generate one asset in seconds</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-8">
                    Describe what you need and Claude picks the best model, sets parameters, and delivers the result. Images, videos, or both.
                  </p>
                </div>
                <div className="mt-auto bg-black/40 rounded-xl p-5 text-xs font-mono text-slate-500 leading-relaxed">
                  Generate a cinematic wide shot of a neon-lit Tokyo alley at night.
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors flex flex-col">
                <div>
                  <div className="inline-block bg-white/10 rounded-lg px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase text-slate-300 mb-6">
                    FULL CAMPAIGN
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Build a campaign from a chat</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-8">
                    Pick a character, generate scenes across locations and styles with their face kept consistent, produce videos, manage everything from your generation history.
                  </p>
                </div>
                <div className="mt-auto bg-black/40 rounded-xl p-5 text-xs font-mono text-slate-500 leading-relaxed">
                  Using Lily, generate a 12-image campaign across 4 cities, then 5s videos for each.
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors flex flex-col">
                <div>
                  <div className="inline-block bg-white/10 rounded-lg px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase text-slate-300 mb-6">
                    CURSOR / SCRIPTS
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Automate posting on a schedule</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-8">
                    In Cursor (or any code editor), write scripts that drive Eromify on a cron. Generate one new post per day, save to S3, post to Make.com.
                  </p>
                </div>
                <div className="mt-auto bg-black/40 rounded-xl p-5 text-xs font-mono text-slate-500 leading-relaxed">
                  Write a Node script that uses my MCP key to generate one new image per day at 9am UTC.
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* ── SECTION: CTA ── */}
        <div className="max-w-4xl mx-auto px-6 pt-16 pb-32 text-center">
          <h4 className="text-xs font-bold tracking-widest uppercase text-[#ec4899] mb-4">READY WHEN YOU ARE</h4>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-8">
            YOUR INFLUENCER<br />STACK JUST LEVELED UP
          </h2>
          <p className="text-xl text-slate-400 mb-12">
            Available on Growth and Creator. Same credits. Cancel anytime.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/mcp-keys" className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 hover:scale-105 transition-all text-lg">
              Get started
            </Link>
          </div>
        </div>
      </main>


    </div>
  );
}
