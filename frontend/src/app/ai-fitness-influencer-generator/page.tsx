import { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer/Footer";

export const metadata: Metadata = {
  title: "AI Fitness Influencer Generator – Create Virtual Gym & Wellness Models | Eromify",
  description: "Generate photorealistic AI fitness influencers for gyms, wellness brands, and health content. Create consistent AI personal trainers and fitness models in any setting.",
  keywords: "AI fitness influencer generator, AI gym model, virtual fitness influencer, AI personal trainer model, AI wellness influencer",
  alternates: { canonical: "/ai-fitness-influencer-generator" },
  openGraph: {
    title: "AI Fitness Influencer Generator – Virtual Gym & Wellness Models",
    description: "Generate photorealistic AI fitness influencers for gyms, wellness brands, and health content.",
    url: "/ai-fitness-influencer-generator",
  },
};

export default function AIFitnessInfluencerPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-orange-900 via-slate-900 to-emerald-900 text-white py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/20 border border-orange-500/40 text-orange-200 text-sm font-semibold rounded-full mb-6">
            💪 Fitness AI Models
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-[1.1]">AI Fitness Influencer Generator</h1>
          <p className="text-xl text-slate-300 mb-4 font-medium">Create photorealistic AI personal trainers, gym models, and wellness influencers.</p>
          <p className="text-slate-400 max-w-3xl mx-auto mb-10 text-lg leading-relaxed">
            Generate AI fitness influencers in athletic wear, gym settings, outdoor workouts, and wellness environments. Perfect for fitness brands, supplement companies, gym marketing, and health content creators.
          </p>
          <Link href="/tools/creator" className="inline-flex items-center gap-2 px-10 py-5 bg-orange-500 hover:bg-orange-400 text-white font-black rounded-2xl transition-all hover:scale-105 shadow-xl text-lg">
            💪 Generate Fitness Influencer
          </Link>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-slate-900 mb-14 text-center">Fitness Content You Can Generate</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon:"🏋️", title:"Gym Workout Content", desc:"AI influencers lifting, training, and working out in realistic gym environments with proper equipment and lighting." },
              { icon:"🧘", title:"Yoga & Wellness Shots", desc:"Serene, aspirational wellness content — yoga poses, meditation, outdoor stretching, spa-like environments." },
              { icon:"🏃", title:"Running & Outdoor Fitness", desc:"Dynamic outdoor running, trail workout, and athletic movement content in realistic natural settings." },
              { icon:"👙", title:"Activewear Modeling", desc:"Showcase athletic wear and fitness apparel on consistent AI models — perfect for e-commerce and brand campaigns." },
              { icon:"💊", title:"Supplement Brand Content", desc:"Health and supplement brand content featuring AI wellness models in aspirational fitness scenarios." },
              { icon:"📱", title:"Social Media Fitness Reels", desc:"Short-form fitness content styled for Instagram Reels and TikTok — motivational, dynamic, scroll-stopping." },
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
            { href:"/ai-fashion-influencer-generator", label:"AI Fashion Influencer" },
            { href:"/ai-female-influencer-generator", label:"AI Female Influencer" },
            { href:"/ai-male-influencer-generator", label:"AI Male Influencer" },
            { href:"/ai-instagram-influencer-generator", label:"AI Instagram Influencer" },
            { href:"/virtual-influencer-creator", label:"Virtual Influencer Creator" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="text-center py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:text-[#1736cf] transition-all">
              {l.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-br from-orange-700 to-emerald-700 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black mb-6">Build Your AI Fitness Influencer</h2>
          <p className="text-orange-100 text-lg mb-10">Gyms, supplement brands, and fitness creators are already using Eromify. Join them.</p>
          <Link href="/tools/creator" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-orange-700 font-black rounded-2xl hover:scale-105 transition-all shadow-2xl text-lg">
            💪 Start Generating →
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}
