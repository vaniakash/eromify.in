import { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer/Footer";

export const metadata: Metadata = {
  title: "AI Instagram Influencer Generator – Create Virtual IG Models | Eromify",
  description: "Generate AI influencers optimized for Instagram — perfect portrait formats, lifestyle aesthetics, and photorealistic quality. Build your IG AI persona today.",
  keywords: "AI Instagram influencer generator, AI Instagram model, virtual Instagram influencer, AI IG influencer, create AI Instagram persona, AI model Instagram",
  alternates: { canonical: "/ai-instagram-influencer-generator" },
  openGraph: {
    title: "AI Instagram Influencer Generator – Create Virtual IG Models",
    description: "Generate AI influencers optimized for Instagram — portrait formats, lifestyle aesthetics, photorealistic quality.",
    url: "/ai-instagram-influencer-generator",
  },
};

export default function AIInstagramInfluencerPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-purple-900 via-pink-900 to-[#1736cf]/60 text-white py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/20 border border-purple-500/40 text-purple-200 text-sm font-semibold rounded-full mb-6">
            📲 Instagram-Optimized AI
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-[1.1]">AI Instagram Influencer Generator</h1>
          <p className="text-xl text-slate-300 mb-4 font-medium">Create AI influencers built for Instagram growth and engagement.</p>
          <p className="text-slate-400 max-w-3xl mx-auto mb-10 text-lg leading-relaxed">
            Generate photorealistic AI influencers styled for Instagram — portrait orientation, lifestyle compositions, consistent aesthetic themes, and the visual quality that earns followers. Build an AI Instagram persona and scale your content production.
          </p>
          <Link href="/tools/creator" className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-black rounded-2xl transition-all hover:scale-105 shadow-xl text-lg">
            📲 Generate IG Influencer
          </Link>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-slate-900 mb-14 text-center">Instagram Content Types You Can Generate</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon:"🤳", title:"Feed Posts", desc:"Polished, high-aesthetic portrait and lifestyle images optimized for grid consistency and visual appeal." },
              { icon:"📖", title:"Instagram Stories", desc:"Vertical format content designed for stories — casual, authentic, and engaging for daily posting." },
              { icon:"🎬", title:"Reels Thumbnails", desc:"Eye-catching thumbnail frames for Instagram Reels — motion stills that drive clicks and views." },
              { icon:"🛍️", title:"Shopping & Collab Content", desc:"Product showcase and affiliate content styled for Instagram's shopping features and brand partnership posts." },
              { icon:"💄", title:"Beauty & Lifestyle", desc:"Makeup, skincare, wellness, and personal care content in the warm, aspirational style Instagram audiences love." },
              { icon:"🌅", title:"Travel & Adventure", desc:"Wanderlust-worthy travel content for AI influencers exploring global destinations, hotels, and experiences." },
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
          <h2 className="text-3xl font-black text-slate-900 mb-12 text-center">Why Instagram Creators Choose Eromify</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title:"Grid Consistency", desc:"Maintain a cohesive Instagram grid aesthetic — same AI influencer, consistent style, across every post. Perfect for professional creator accounts." },
              { title:"Daily Content Volume", desc:"Instagram rewards frequent posting. Eromify lets you generate 10–100+ posts per day, solving the content production bottleneck forever." },
              { title:"Niche Flexibility", desc:"Switch your AI influencer's outfit, location, and style in seconds. Explore fashion, beauty, travel, food, and fitness — all with the same persona." },
              { title:"Commercial-Grade Quality", desc:"Generate images at quality levels that compete with professional photography — not blurry, artificial-looking AI output." },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 border-t border-slate-200">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { href:"/ai-influencer-generator", label:"AI Influencer Generator" },
            { href:"/ai-fashion-influencer-generator", label:"AI Fashion Influencer" },
            { href:"/ai-female-influencer-generator", label:"AI Female Influencer" },
            { href:"/ai-male-influencer-generator", label:"AI Male Influencer" },
            { href:"/virtual-influencer-creator", label:"Virtual Influencer Creator" },
            { href:"/realistic-ai-influencer-generator", label:"Realistic AI Influencer" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="text-center py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:text-[#1736cf] transition-all">
              {l.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-br from-purple-700 to-pink-600 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black mb-6">Build Your AI Instagram Influencer</h2>
          <p className="text-purple-100 text-lg mb-10">Instagram-ready. Consistent. Scalable. Start generating today.</p>
          <Link href="/tools/creator" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-purple-700 font-black rounded-2xl hover:scale-105 transition-all shadow-2xl text-lg">
            📲 Start Generating →
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}
