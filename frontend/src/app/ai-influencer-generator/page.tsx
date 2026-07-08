import { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer/Footer";

export const metadata: Metadata = {
  title: "AI Influencer Generator – Create Realistic Virtual Influencers Free | Eromify",
  description: "Generate photorealistic AI influencers for Instagram, YouTube & brand campaigns in seconds. No design skills needed. Try Eromify's AI Influencer Generator free today.",
  keywords: "AI influencer generator, create AI influencer, virtual influencer generator, AI influencer maker, realistic AI influencer, free AI influencer tool",
  alternates: { canonical: "/ai-influencer-generator" },
  openGraph: {
    title: "AI Influencer Generator – Create Realistic Virtual Influencers Free",
    description: "Generate photorealistic AI influencers for Instagram, YouTube & brand campaigns in seconds.",
    url: "/ai-influencer-generator",
    type: "website",
  },
};

const faqs = [
  { q: "What is an AI influencer generator?", a: "An AI influencer generator uses advanced machine learning to create photorealistic virtual influencer personas with consistent faces, expressions, and style — without hiring a real person." },
  { q: "Can I generate AI influencers for free?", a: "Yes. Eromify offers free credits on signup, letting you generate AI influencer images right away. Paid plans unlock unlimited generation, HD quality, and video content." },
  { q: "How consistent are AI influencer identities?", a: "Eromify uses identity-locked generation — once you define your AI influencer, every subsequent image maintains the same face structure, skin tone, and style with no drift." },
  { q: "Can I use AI influencers for Instagram and brand campaigns?", a: "Absolutely. AI influencers from Eromify can be used for social media posts, brand partnerships, sponsored content, YouTube thumbnails, and any digital marketing campaign." },
  { q: "How is Eromify different from other AI influencer tools?", a: "Eromify combines consistent character generation with cinematic video creation, motion control, and multiple AI models — all in a single platform built for influencer content." },
];

export default function AIInfluencerGeneratorPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-[#0f1e7a] to-slate-900 text-white py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#1736cf]/30 border border-[#1736cf]/50 text-blue-200 text-sm font-semibold rounded-full mb-6">
            🤖 #1 AI Influencer Generator
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-[1.1]">Create AI Influencers Online</h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-4 font-medium">Generate photorealistic AI influencers for Instagram, YouTube &amp; brand campaigns.</p>
          <p className="text-slate-400 max-w-3xl mx-auto mb-10 text-lg leading-relaxed">
            Eromify&apos;s AI Influencer Generator lets anyone build a consistent, photorealistic virtual influencer in seconds. No design skills. No expensive photoshoots. No talent management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/tools/creator" className="px-8 py-4 bg-[#1736cf] hover:bg-[#1430b8] text-white font-bold rounded-2xl transition-all hover:scale-105 shadow-xl text-lg">✨ Start Generating Free</Link>
            <Link href="/explore" className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all border border-white/20 text-lg">See Examples →</Link>
          </div>
          <p className="text-slate-500 text-sm mt-6">No credit card required · Free credits on signup</p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-slate-50 border-b border-slate-200 py-8">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[["50,000+","AI Influencers Created"],["2,000+","Active Creators"],["20+","AI Models Available"],["< 10s","Avg. Generation Time"]].map(([v,l]) => (
            <div key={l}><p className="text-3xl font-black text-[#1736cf] mb-1">{v}</p><p className="text-slate-500 text-sm">{l}</p></div>
          ))}
        </div>
      </section>

      {/* What is */}
      <section className="py-20 px-4 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">What is an AI Influencer Generator?</h2>
        <div className="space-y-5 text-slate-600 text-lg leading-relaxed">
          <p>An <strong>AI influencer generator</strong> is a tool powered by advanced generative AI that creates photorealistic virtual human personas — complete with consistent facial identity, style, and expressions — entirely from text prompts.</p>
          <p>Unlike traditional influencer marketing — requiring real people, contracts, and shoots — an AI influencer generator lets brands produce unlimited content around a single digital persona at a fraction of the cost.</p>
          <p><strong>Eromify</strong> uses the latest diffusion models — FLUX, GPT Image 2, and proprietary identity-lock technology — ensuring your AI influencer looks identical across every image and video.</p>
          <p>Whether you&apos;re building a faceless brand, launching an Instagram persona, or creating product campaigns — Eromify is your all-in-one creation engine.</p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 text-center">How It Works</h2>
          <p className="text-slate-500 text-lg text-center mb-14">Three steps from idea to ready-to-post influencer content.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step:"1", title:"Describe Your Influencer", desc:"Enter a prompt describing appearance, style, vibe, and niche. Be as specific as you want." },
              { step:"2", title:"Generate & Refine", desc:"Our AI models produce photorealistic results in seconds. Regenerate or tweak until perfect." },
              { step:"3", title:"Create Unlimited Content", desc:"Use your AI influencer across images, videos, and campaigns — maintaining full identity consistency." },
            ].map((s) => (
              <div key={s.step} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-[#1736cf] text-white rounded-2xl flex items-center justify-center font-black text-xl mb-6">{s.step}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{s.title}</h3>
                <p className="text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 text-center">Who Uses This Tool?</h2>
          <p className="text-slate-500 text-lg text-center mb-14">From solo creators to marketing agencies — the use cases are endless.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title:"Social Media Content", desc:"Create scroll-stopping AI influencer posts for Instagram, TikTok, and YouTube at scale.", icon:"📸" },
              { title:"Brand Campaigns", desc:"Partner your brand with a custom AI influencer that perfectly embodies your values — no management fees.", icon:"💼" },
              { title:"E-commerce Modeling", desc:"Showcase products on AI models without expensive photoshoots. Update looks on demand.", icon:"🛍️" },
              { title:"YouTube & Video", desc:"Generate AI influencer videos with motion control and cinematic output.", icon:"🎬" },
              { title:"Newsletter & Blogs", desc:"Add consistent AI personas to your written content and editorial imagery.", icon:"✍️" },
              { title:"Faceless Business", desc:"Build a monetizable AI influencer brand without revealing your own identity.", icon:"🤖" },
            ].map((u) => (
              <div key={u.title} className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-[#1736cf]/30 hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">{u.icon}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{u.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 px-4 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-4 text-center">AI Influencer vs Human Influencer</h2>
          <p className="text-slate-400 text-lg text-center mb-14">Why more brands are switching to AI-generated influencers.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 pr-6 text-slate-400">Factor</th>
                  <th className="text-center py-4 px-4 text-[#4f8fff] font-bold">AI Influencer (Eromify)</th>
                  <th className="text-center py-4 pl-4 text-slate-400">Human Influencer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  ["Cost per post","< $1","$500–$50,000"],
                  ["Content consistency","✅ Always identical","❌ Varies"],
                  ["Availability","✅ 24/7, instant","❌ Scheduling required"],
                  ["Brand control","✅ 100% controlled","❌ Limited"],
                  ["Scale","✅ Unlimited","❌ One post at a time"],
                  ["Identity risk","✅ Zero controversy","❌ Reputation risk"],
                ].map(([f,ai,hm]) => (
                  <tr key={f}>
                    <td className="py-4 pr-6 text-slate-300 font-medium">{f}</td>
                    <td className="py-4 px-4 text-center text-green-400 font-semibold">{ai}</td>
                    <td className="py-4 pl-4 text-center text-slate-400">{hm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-12 text-center">Key Features</h2>
          <div className="space-y-8">
            {[
              { title:"Identity Consistency Across All Content", desc:"Eromify solves identity drift with identity-locked generation. Define your AI influencer once — every output maintains the exact same facial structure, skin tone, and style." },
              { title:"Multiple State-of-the-Art AI Models", desc:"Access FLUX, GPT Image 2, FLUX Kontext, and more — all from one dashboard. Each model has different strengths for realism or style." },
              { title:"AI Video Generation", desc:"Animate your AI influencer with Kling, Seedance, and Sora — producing cinematic reels, YouTube content, and dynamic ads." },
              { title:"Prompt-Based Customization", desc:"Describe appearance, outfit, location, mood, and lighting through natural language. No design software. Just describe and generate." },
              { title:"Instant, Scalable Production", desc:"Generate hundreds of unique influencer images per day — perfect for agencies and e-commerce brands who need volume without sacrificing quality." },
            ].map((f) => (
              <div key={f.title} className="border-l-4 border-[#1736cf] pl-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed">{f.desc}</p>
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
              <div key={faq.q} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Internal Links */}
      <section className="py-16 px-4 border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-slate-900 mb-8 text-center">Explore More AI Influencer Tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { href:"/free-ai-influencer-generator", label:"Free AI Influencer Generator" },
              { href:"/realistic-ai-influencer-generator", label:"Realistic AI Influencer Generator" },
              { href:"/virtual-influencer-creator", label:"Virtual Influencer Creator" },
              { href:"/ai-influencer-maker", label:"AI Influencer Maker" },
              { href:"/ai-fashion-influencer-generator", label:"AI Fashion Influencer" },
              { href:"/ai-instagram-influencer-generator", label:"AI Instagram Influencer" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="text-center py-3 px-4 bg-slate-50 hover:bg-[#1736cf]/5 border border-slate-200 hover:border-[#1736cf]/30 rounded-xl text-sm font-semibold text-slate-700 hover:text-[#1736cf] transition-all">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-gradient-to-br from-[#1736cf] to-[#0f1e7a] text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black mb-6">Ready to Build Your AI Influencer?</h2>
          <p className="text-blue-200 text-lg mb-10">Join thousands of creators using Eromify to generate photorealistic AI influencers at scale.</p>
          <Link href="/tools/creator" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-[#1736cf] font-black rounded-2xl hover:scale-105 transition-all shadow-2xl text-lg">
            ✨ Start Generating Free →
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
