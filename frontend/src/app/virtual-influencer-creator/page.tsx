import { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer/Footer";

export const metadata: Metadata = {
  title: "Virtual Influencer Creator – Design & Launch AI Virtual Personas | Eromify",
  description: "Create and launch your own virtual influencer with Eromify. Design realistic AI personas, generate content, and build a digital brand without a real person.",
  keywords: "virtual influencer creator, create virtual influencer, AI virtual persona, digital influencer creator, virtual model creator, synthetic influencer",
  alternates: { canonical: "/virtual-influencer-creator" },
  openGraph: {
    title: "Virtual Influencer Creator – Design & Launch AI Virtual Personas",
    description: "Create and launch your own virtual influencer. Design realistic AI personas and build a digital brand.",
    url: "/virtual-influencer-creator",
  },
};

const faqs = [
  { q: "What is a virtual influencer?", a: "A virtual influencer is a completely AI-generated digital persona — a realistic-looking character that doesn't exist in real life but operates just like a real influencer: posting content, partnering with brands, and building an audience." },
  { q: "How do I create a virtual influencer with Eromify?", a: "Describe your virtual influencer through text prompts — appearance, personality, niche, and style. Eromify generates photorealistic images and videos of your digital persona in seconds." },
  { q: "Can I monetize a virtual influencer?", a: "Yes. Many virtual influencers run brand deals, affiliate partnerships, and digital product sales. Your AI influencer can operate as a full income-generating digital asset." },
  { q: "Are virtual influencers legal to use commercially?", a: "Yes. As long as the AI-generated content doesn't fraudulently impersonate real people, virtual influencers are legal business assets. Eromify's platform generates fully original characters." },
  { q: "How is a virtual influencer different from a regular AI image?", a: "A virtual influencer is a consistent, recurring character — same face, same identity, same personality — across all content. Regular AI images are one-off generations with no identity persistence." },
];

export default function VirtualInfluencerCreatorPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-rose-900 via-slate-900 to-[#1736cf]/70 text-white py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-500/20 border border-rose-500/40 text-rose-200 text-sm font-semibold rounded-full mb-6">
            🌟 Build Your Digital Brand
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-[1.1]">Virtual Influencer Creator</h1>
          <p className="text-xl text-slate-300 mb-4 font-medium">Design, launch, and grow your AI virtual influencer persona.</p>
          <p className="text-slate-400 max-w-3xl mx-auto mb-10 text-lg leading-relaxed">
            Virtual influencers are the future of digital marketing. Create yours with Eromify — a photorealistic AI persona with a consistent identity, unlimited content, and zero management overhead. Build a digital brand that earns without a real person behind it.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/tools/creator" className="px-8 py-4 bg-rose-500 hover:bg-rose-400 text-white font-black rounded-2xl transition-all hover:scale-105 shadow-xl text-lg">🌟 Create Virtual Influencer</Link>
            <Link href="/explore" className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/20 text-lg">See Examples →</Link>
          </div>
        </div>
      </section>

      {/* Why virtual */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 text-center">Why Virtual Influencers Are Taking Over</h2>
          <p className="text-slate-500 text-lg text-center mb-14">Real people have limits. Virtual influencers don&apos;t.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon:"💰", title:"No Talent Fees", desc:"No agencies, no contracts, no per-post fees. Your virtual influencer works around the clock at the cost of generation." },
              { icon:"🔒", title:"Zero Reputation Risk", desc:"No scandals, no drama, no off-brand behavior. Your virtual influencer always represents your brand perfectly." },
              { icon:"⚡", title:"Infinite Scalability", desc:"Need 100 posts this week? No problem. Virtual influencers scale with your demand — no scheduling, no exhaustion." },
              { icon:"🎯", title:"Perfect Brand Alignment", desc:"Design your virtual influencer to be the perfect embodiment of your brand values, aesthetics, and target audience." },
              { icon:"🌍", title:"24/7 Global Presence", desc:"Your AI influencer can post at any hour, in any timezone, without jet lag, time zones, or availability conflicts." },
              { icon:"📈", title:"Growing Audience Acceptance", desc:"Audiences increasingly accept and engage with virtual influencers — especially Gen Z, who grew up with digital personas." },
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

      {/* Success examples */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-slate-900 mb-4 text-center">What&apos;s Possible with a Virtual Influencer</h2>
          <p className="text-slate-500 text-lg text-center mb-14">Real use cases from virtual influencer creators worldwide.</p>
          <div className="space-y-6">
            {[
              { title:"Fashion Brand Campaigns", desc:"A clothing brand creates a virtual model for their e-commerce lookbook — same model across 500 product shots, all generated by AI. Cost: a fraction of a single real shoot." },
              { title:"Faceless Creator Business", desc:"A solo creator builds an AI fashion influencer with 50K+ followers. The influencer posts daily, runs affiliate deals, and earns passive income — with the creator managing prompts from behind the scenes." },
              { title:"Agency at Scale", desc:"A content agency creates 10 virtual influencers for 10 different brand niches, managing all content production through Eromify — serving multiple clients at once without hiring more photographers or models." },
            ].map((e) => (
              <div key={e.title} className="bg-white rounded-2xl p-6 border border-slate-200 border-l-4 border-l-[#1736cf]">
                <h3 className="font-bold text-slate-900 mb-2">{e.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-slate-900 mb-10 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
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
            { href:"/ai-influencer-maker", label:"AI Influencer Maker" },
            { href:"/realistic-ai-influencer-generator", label:"Realistic AI Influencer" },
            { href:"/ai-fashion-influencer-generator", label:"AI Fashion Influencer" },
            { href:"/ai-instagram-influencer-generator", label:"AI Instagram Influencer" },
            { href:"/ai-female-influencer-generator", label:"AI Female Influencer" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="text-center py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:text-[#1736cf] transition-all">
              {l.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-br from-rose-700 to-[#1736cf] text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black mb-6">Launch Your Virtual Influencer Today</h2>
          <p className="text-rose-100 text-lg mb-10">The digital future belongs to AI-generated personas. Be first in your niche.</p>
          <Link href="/tools/creator" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-rose-700 font-black rounded-2xl hover:scale-105 transition-all shadow-2xl text-lg">
            🌟 Create My Virtual Influencer →
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
