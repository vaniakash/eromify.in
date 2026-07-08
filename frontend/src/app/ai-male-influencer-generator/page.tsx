import { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer/Footer";

export const metadata: Metadata = {
  title: "AI Male Influencer Generator – Create Virtual Male Models | Eromify",
  description: "Generate photorealistic AI male influencers for fashion, fitness, lifestyle, and brand campaigns. Create consistent male AI models for any niche or platform.",
  keywords: "AI male influencer generator, AI male model, virtual male influencer, create male AI influencer, AI man model generator",
  alternates: { canonical: "/ai-male-influencer-generator" },
  openGraph: {
    title: "AI Male Influencer Generator – Create Virtual Male Models",
    description: "Generate photorealistic AI male influencers for fashion, fitness, lifestyle, and brand campaigns.",
    url: "/ai-male-influencer-generator",
  },
};

export default function AIMaleInfluencerPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-blue-900 via-slate-900 to-[#1736cf] text-white py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/20 border border-blue-500/40 text-blue-200 text-sm font-semibold rounded-full mb-6">
            👨 Male AI Models
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-[1.1]">AI Male Influencer Generator</h1>
          <p className="text-xl text-slate-300 mb-4 font-medium">Create photorealistic AI male influencers for any niche, platform, or campaign.</p>
          <p className="text-slate-400 max-w-3xl mx-auto mb-10 text-lg leading-relaxed">
            Generate consistent, photorealistic AI male models for fashion, fitness, lifestyle, luxury, and tech content. Eromify&apos;s AI male influencer generator supports diverse ethnicities, ages, body types, and styles — all with identity-locked consistency.
          </p>
          <Link href="/tools/creator" className="inline-flex items-center gap-2 px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all hover:scale-105 shadow-xl text-lg">
            👨 Generate Male AI Influencer
          </Link>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-slate-900 mb-14 text-center">Male AI Influencer Use Cases</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon:"👔", title:"Men's Fashion & Style", desc:"Create AI male models showcasing suits, streetwear, casual style, and luxury fashion for any brand or aesthetic." },
              { icon:"🏋️", title:"Men's Fitness & Health", desc:"Athletic male AI influencers for gym content, supplement brands, fitness challenges, and wellness coaching." },
              { icon:"💼", title:"Business & Lifestyle", desc:"Professional male AI personas for business coaching, finance content, productivity influencers, and career brands." },
              { icon:"🧴", title:"Men's Grooming & Skincare", desc:"Generate male AI models for grooming products, skincare routines, cologne campaigns, and personal care brands." },
              { icon:"🚗", title:"Automotive & Luxury", desc:"AI male influencers for automotive brands, luxury goods, watches, and high-end lifestyle content." },
              { icon:"🎮", title:"Gaming & Tech", desc:"Casual male AI personas for gaming channels, tech reviews, software brands, and digital creator content." },
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

      <section className="py-12 px-4 border-t border-slate-200">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { href:"/ai-influencer-generator", label:"AI Influencer Generator" },
            { href:"/ai-female-influencer-generator", label:"AI Female Influencer" },
            { href:"/ai-fashion-influencer-generator", label:"AI Fashion Influencer" },
            { href:"/ai-fitness-influencer-generator", label:"AI Fitness Influencer" },
            { href:"/virtual-influencer-creator", label:"Virtual Influencer Creator" },
            { href:"/realistic-ai-influencer-generator", label:"Realistic AI Influencer" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="text-center py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:text-[#1736cf] transition-all">
              {l.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-br from-blue-800 to-[#1736cf] text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black mb-6">Create Your AI Male Influencer</h2>
          <p className="text-blue-100 text-lg mb-10">Any niche. Any style. Any ethnicity. Fully consistent across all content.</p>
          <Link href="/tools/creator" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-blue-700 font-black rounded-2xl hover:scale-105 transition-all shadow-2xl text-lg">
            👨 Start Generating →
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}
