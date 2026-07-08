import { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer/Footer";

export const metadata: Metadata = {
  title: "AI Fashion Influencer Generator – Create Virtual Fashion Models | Eromify",
  description: "Generate stunning AI fashion influencers for Instagram, lookbooks, and brand campaigns. Create photorealistic AI models wearing any outfit, in any setting.",
  keywords: "AI fashion influencer generator, AI fashion model, virtual fashion influencer, create AI fashion model, AI clothing model generator",
  alternates: { canonical: "/ai-fashion-influencer-generator" },
  openGraph: {
    title: "AI Fashion Influencer Generator – Create Virtual Fashion Models",
    description: "Generate stunning AI fashion influencers for Instagram, lookbooks, and brand campaigns.",
    url: "/ai-fashion-influencer-generator",
  },
};

export default function AIFashionInfluencerPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-pink-900 via-slate-900 to-[#1736cf]/60 text-white py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-pink-500/20 border border-pink-500/40 text-pink-200 text-sm font-semibold rounded-full mb-6">
            👗 Fashion AI Models
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-[1.1]">AI Fashion Influencer Generator</h1>
          <p className="text-xl text-slate-300 mb-4 font-medium">Generate photorealistic AI fashion models for any brand, style, or campaign.</p>
          <p className="text-slate-400 max-w-3xl mx-auto mb-10 text-lg leading-relaxed">
            Create AI fashion influencers that showcase your clothing line, accessories, or fashion brand — in any setting, with any aesthetic. From editorial couture to street style, Eromify generates consistent AI fashion models at scale.
          </p>
          <Link href="/tools/creator" className="inline-flex items-center gap-2 px-10 py-5 bg-pink-500 hover:bg-pink-400 text-white font-black rounded-2xl transition-all hover:scale-105 shadow-xl text-lg">
            👗 Generate Fashion Influencer
          </Link>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-14 text-center">Fashion Influencer Content You Can Generate</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon:"👗", title:"Outfit of the Day Posts", desc:"Generate daily OOTD content for your AI fashion influencer — any outfit, any season, any aesthetic." },
              { icon:"📸", title:"Editorial Fashion Shoots", desc:"High-fashion editorial images with dramatic lighting, runway poses, and luxury settings." },
              { icon:"🏪", title:"E-commerce Product Modeling", desc:"Showcase clothing and accessories on a consistent AI model without expensive photoshoot logistics." },
              { icon:"🌆", title:"Street Style Content", desc:"Urban, casual, and lifestyle fashion content in realistic city or outdoor environments." },
              { icon:"💎", title:"Luxury Brand Campaigns", desc:"Aspirational luxury content — fine jewelry, designer bags, high-end fashion — on photorealistic AI models." },
              { icon:"📱", title:"Instagram & TikTok Ready", desc:"Generate content sized and styled for social media — portrait format, lifestyle compositions, story-ready images." },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-3xl p-6 border border-slate-200 hover:shadow-lg transition-all">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-slate-900 mb-8 text-center">How to Generate a Fashion AI Influencer</h2>
          <div className="space-y-6">
            {[
              { step:"Step 1", title:"Describe Your Fashion Influencer", desc:"Specify appearance: skin tone, hair style, body type, height. Then add fashion details: the exact outfit, brand, style era, accessories, footwear." },
              { step:"Step 2", title:"Set the Scene", desc:"Choose your environment: studio white background, Paris streets, luxury apartment, outdoor festival, runway stage. Lighting and mood are fully customizable." },
              { step:"Step 3", title:"Generate & Iterate", desc:"Eromify produces HD fashion influencer images in seconds. Adjust your prompt, regenerate, and build a complete content library." },
            ].map((s) => (
              <div key={s.step} className="flex gap-6 bg-white rounded-2xl p-6 border border-slate-200">
                <div className="shrink-0 w-24 text-[#1736cf] font-black text-sm pt-1">{s.step}</div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-black text-slate-900 mb-6 text-center">More AI Influencer Tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { href:"/ai-influencer-generator", label:"AI Influencer Generator" },
              { href:"/ai-fitness-influencer-generator", label:"AI Fitness Influencer" },
              { href:"/ai-female-influencer-generator", label:"AI Female Influencer" },
              { href:"/ai-instagram-influencer-generator", label:"AI Instagram Influencer" },
              { href:"/virtual-influencer-creator", label:"Virtual Influencer Creator" },
              { href:"/realistic-ai-influencer-generator", label:"Realistic AI Influencer" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="text-center py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:text-[#1736cf] transition-all">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-br from-pink-700 to-[#1736cf] text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black mb-6">Build Your AI Fashion Influencer</h2>
          <p className="text-pink-100 text-lg mb-10">No models, no photoshoots, no agencies. Just describe and generate.</p>
          <Link href="/tools/creator" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-pink-700 font-black rounded-2xl hover:scale-105 transition-all shadow-2xl text-lg">
            👗 Start Generating →
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}
