import { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer/Footer";

export const metadata: Metadata = {
  title: "AI Influencer Maker – Build Your Virtual Influencer from Scratch | Eromify",
  description: "Design, create, and deploy your AI influencer from scratch. Eromify's AI Influencer Maker lets you build a full virtual persona with consistent identity for any niche.",
  keywords: "AI influencer maker, make AI influencer, build virtual influencer, create AI persona, AI model maker, virtual influencer builder",
  alternates: { canonical: "/ai-influencer-maker" },
  openGraph: {
    title: "AI Influencer Maker – Build Your Virtual Influencer from Scratch",
    description: "Design, create, and deploy your AI influencer from scratch with consistent identity for any niche.",
    url: "/ai-influencer-maker",
  },
};

const faqs = [
  { q: "What's the difference between an AI influencer maker and a generator?", a: "A generator typically produces one-off images. An AI influencer maker like Eromify is a complete workflow — you define an identity, generate consistent content across sessions, and build a full virtual persona over time." },
  { q: "Can I make an AI influencer for any niche?", a: "Yes. Eromify supports AI influencers for fashion, fitness, gaming, travel, beauty, finance, lifestyle, food, and any other niche you can describe in a prompt." },
  { q: "How do I maintain consistency across many posts?", a: "Eromify's identity-lock system stores your influencer's core visual DNA. Reference your influencer in any new prompt and the AI maintains the same face, proportions, and style." },
  { q: "Can I use the AI influencer I make commercially?", a: "Yes. Content made on Eromify can be used for social media, brand campaigns, e-commerce, and advertising. Pro users receive a full commercial use license." },
];

export default function AIInfluencerMakerPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-violet-900 via-slate-900 to-[#1736cf] text-white py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-500/20 border border-violet-500/40 text-violet-200 text-sm font-semibold rounded-full mb-6">
            🛠️ Full Influencer Building Suite
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-[1.1]">AI Influencer Maker</h1>
          <p className="text-xl text-slate-300 mb-4 font-medium">Build a full virtual influencer persona — from concept to content.</p>
          <p className="text-slate-400 max-w-3xl mx-auto mb-10 text-lg leading-relaxed">
            Eromify is not just a generator — it&apos;s a complete AI influencer making platform. Define your persona, maintain consistent identity, generate images and videos, and build a content library that grows with your brand.
          </p>
          <Link href="/tools/creator" className="inline-flex items-center gap-2 px-10 py-5 bg-violet-500 hover:bg-violet-400 text-white font-black rounded-2xl transition-all hover:scale-105 shadow-xl text-lg">
            🛠️ Start Making Your Influencer
          </Link>
        </div>
      </section>

      {/* What you can build */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-14 text-center">Everything You Can Build</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title:"Define Appearance & Style", desc:"Describe your AI influencer's facial features, hair, body type, skin tone, fashion aesthetic, and signature style — all through natural language.", step:"01" },
              { title:"Generate Portrait & Lifestyle Content", desc:"Create headshots, lifestyle images, indoor shoots, outdoor adventures, product placements, and more — all starring your AI influencer.", step:"02" },
              { title:"Produce Short-Form Video", desc:"Animate your AI influencer with AI video models to produce reels, shorts, and dynamic social content that moves and breathes.", step:"03" },
              { title:"Deploy Across Platforms", desc:"Take your generated content and post directly to Instagram, TikTok, YouTube, or any platform. Your influencer is platform-agnostic.", step:"04" },
            ].map((s) => (
              <div key={s.step} className="bg-slate-50 rounded-3xl p-8 border border-slate-200 hover:border-[#1736cf]/30 hover:shadow-lg transition-all">
                <span className="text-5xl font-black text-slate-100">{s.step}</span>
                <h3 className="text-xl font-bold text-slate-900 mt-2 mb-3">{s.title}</h3>
                <p className="text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Niches */}
      <section className="py-20 px-4 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black mb-12 text-center">Build AI Influencers for Any Niche</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Fashion & Beauty","Fitness & Wellness","Travel & Lifestyle","Food & Cooking","Gaming & Esports","Tech & Reviews","Finance & Business","Entertainment"].map((n) => (
              <div key={n} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-slate-300 font-semibold text-sm hover:bg-white/10 transition-colors">
                {n}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-slate-900 mb-10 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-white rounded-2xl p-6 border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 border-t border-slate-200">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { href:"/ai-influencer-generator", label:"AI Influencer Generator" },
            { href:"/free-ai-influencer-generator", label:"Free Generator" },
            { href:"/realistic-ai-influencer-generator", label:"Realistic AI Influencer" },
            { href:"/virtual-influencer-creator", label:"Virtual Influencer Creator" },
            { href:"/ai-fashion-influencer-generator", label:"AI Fashion Influencer" },
            { href:"/ai-fitness-influencer-generator", label:"AI Fitness Influencer" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="text-center py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:text-[#1736cf] transition-all">
              {l.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-br from-violet-700 to-[#1736cf] text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black mb-6">Make Your AI Influencer Today</h2>
          <p className="text-violet-100 text-lg mb-10">The most complete AI influencer maker on the internet. Start free.</p>
          <Link href="/tools/creator" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-violet-700 font-black rounded-2xl hover:scale-105 transition-all shadow-2xl text-lg">
            🛠️ Start Making →
          </Link>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } }))
      }) }} />
      <Footer />
    </div>
  );
}
