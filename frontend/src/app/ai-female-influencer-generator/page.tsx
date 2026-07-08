import { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer/Footer";

export const metadata: Metadata = {
  title: "AI Female Influencer Generator – Create Virtual Women Models | Eromify",
  description: "Generate photorealistic AI female influencers for beauty, fashion, lifestyle, and brand campaigns. Create consistent female AI models with identity-locked accuracy.",
  keywords: "AI female influencer generator, AI woman model, virtual female influencer, create female AI influencer, AI girl model generator",
  alternates: { canonical: "/ai-female-influencer-generator" },
  openGraph: {
    title: "AI Female Influencer Generator – Create Virtual Women Models",
    description: "Generate photorealistic AI female influencers for beauty, fashion, lifestyle, and brand campaigns.",
    url: "/ai-female-influencer-generator",
  },
};

export default function AIFemaleInfluencerPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-rose-900 via-pink-900 to-[#1736cf]/70 text-white py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-500/20 border border-rose-500/40 text-rose-200 text-sm font-semibold rounded-full mb-6">
            👩 Female AI Models
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-[1.1]">AI Female Influencer Generator</h1>
          <p className="text-xl text-slate-300 mb-4 font-medium">Generate photorealistic AI women influencers for any niche, brand, or platform.</p>
          <p className="text-slate-400 max-w-3xl mx-auto mb-10 text-lg leading-relaxed">
            Create consistent, photorealistic AI female models for beauty, fashion, fitness, lifestyle, and luxury content. Eromify&apos;s female AI influencer generator supports diverse ethnicities, skin tones, ages, and aesthetics — with identity-locked consistency across every image.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/tools/creator" className="px-8 py-4 bg-rose-500 hover:bg-rose-400 text-white font-black rounded-2xl transition-all hover:scale-105 shadow-xl text-lg">
              👩 Generate Female AI Influencer
            </Link>
            <Link href="/explore" className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/20 text-lg">
              See Examples →
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-slate-900 mb-14 text-center">Female AI Influencer Content by Niche</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon:"💄", title:"Beauty & Makeup", desc:"AI beauty influencers for makeup tutorials, skincare routines, cosmetic brand campaigns, and glamour content." },
              { icon:"👗", title:"Fashion & Style", desc:"AI female models showcasing clothing, accessories, streetwear, luxury fashion, and editorial looks." },
              { icon:"🧘", title:"Health & Wellness", desc:"Yoga instructors, holistic wellness coaches, and mindfulness content creators in aspirational, calming settings." },
              { icon:"🏋️", title:"Fitness & Gym", desc:"Strong, athletic AI female models for gym brands, activewear, nutrition, and female fitness empowerment content." },
              { icon:"🌍", title:"Travel & Adventure", desc:"AI female travel influencers exploring destinations, hotels, cafes, and iconic global locations." },
              { icon:"🍳", title:"Food & Lifestyle", desc:"Everyday female AI personas for food content, home cooking, hosting, and aspirational domestic lifestyle brands." },
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

      {/* Diversity section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-slate-900 mb-6 text-center">Generate Diverse Female AI Influencers</h2>
          <p className="text-slate-500 text-lg text-center mb-12">Eromify supports diverse representation — because your brand audience is diverse too.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["All Skin Tones","All Ethnicities","All Body Types","All Age Groups","All Hair Types","All Styles","Natural & Glam","Casual & Editorial"].map((d) => (
              <div key={d} className="bg-white border border-slate-200 rounded-xl p-4 text-center text-sm font-semibold text-slate-700">
                {d}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 border-t border-slate-200">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { href:"/ai-influencer-generator", label:"AI Influencer Generator" },
            { href:"/ai-male-influencer-generator", label:"AI Male Influencer" },
            { href:"/ai-fashion-influencer-generator", label:"AI Fashion Influencer" },
            { href:"/ai-fitness-influencer-generator", label:"AI Fitness Influencer" },
            { href:"/ai-instagram-influencer-generator", label:"AI Instagram Influencer" },
            { href:"/virtual-influencer-creator", label:"Virtual Influencer Creator" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="text-center py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:text-[#1736cf] transition-all">
              {l.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-br from-rose-600 to-[#1736cf] text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black mb-6">Create Your AI Female Influencer</h2>
          <p className="text-rose-100 text-lg mb-10">Any look. Any niche. Any style. Consistent across every image and video.</p>
          <Link href="/tools/creator" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-rose-700 font-black rounded-2xl hover:scale-105 transition-all shadow-2xl text-lg">
            👩 Start Generating →
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}
