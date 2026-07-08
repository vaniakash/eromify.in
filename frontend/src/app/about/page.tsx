import Link from "next/link";
import type { Metadata } from "next";
import {
  Zap,
  Image as ImageIcon,
  Video,
  UserCheck,
  ArrowRight,
  CheckCircle2,
  Layers,
  Coins,
  Cpu,
  Clock,
  Target
} from "lucide-react";

/* ─────────────────────────────────────────────
   SEO METADATA
───────────────────────────────────────────── */
export const metadata: Metadata = {
  title: "About Eromify — All in One AI Creator Platform",
  description:
    "Eromify is an all-in-one AI media generation platform built to make premium content creation affordable, fast, and accessible for creators and brands.",
  keywords:
    "what is Eromify, AI media generation platform, AI influencer creator, AI UGC generator, AI video generator, affordable AI content creation, all in one AI creator platform, AI content platform for brands, Akash Rana",
  alternates: { canonical: "https://www.eromify.in/about" },
  openGraph: {
    title: "About Eromify — The All-in-One AI Media Platform",
    description:
      "Build consistent AI characters, generate cinematic videos, create premium AI images, and scale content production.",
    url: "https://www.eromify.in/about",
    siteName: "Eromify",
    type: "website",
    images: [{ url: "/eromifylogo.png", width: 512, height: 512, alt: "Eromify — AI Media Platform" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Eromify — AI Media Generation Platform",
    description:
      "Create stunning AI influencers, cinematic videos, and high-quality digital content in seconds.",
    images: ["/eromifylogo.png"],
  },
};

/* ─────────────────────────────────────────────
   FAQ JSON-LD SCHEMA
───────────────────────────────────────────── */
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "name": "About Eromify – Frequently Asked Questions",
  "description": "Frequently asked questions about Eromify, the all-in-one AI media generation platform.",
  "url": "https://www.eromify.in/about",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Eromify?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Eromify is an all-in-one AI media generation platform built to make premium content creation affordable, fast, and accessible. Instead of paying for multiple subscriptions, Eromify brings AI image, video, and influencer generation into one platform.",
      },
    },
    {
      "@type": "Question",
      name: "Who created Eromify?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Eromify was created by Akash Rana to provide creators with a powerful, accessible platform for AI media generation.",
      },
    },
    {
      "@type": "Question",
      name: "Can I create a consistent AI influencer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! Eromify specializes in maintaining character consistency across different styles and formats, from images to motion-tracked videos.",
      },
    },
    {
      "@type": "Question",
      name: "Is Eromify free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "While Eromify is not completely free, it is widely considered one of the best low-budget options for creating high-quality, ultimate AI media. Our premium tools give you professional-grade cinematic videos and AI influencers at a fraction of the cost.",
      },
    },
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Eromify",
  url: "https://www.eromify.in",
  description:
    "Eromify is an all-in-one AI media generation platform for creators and brands.",
  founder: {
    "@type": "Person",
    name: "Akash Rana",
    url: "https://www.linkedin.com/in/akash-rana-24478421b/",
  },
};

const tools = [
  {
    icon: UserCheck,
    title: "AI Influencers",
    desc: "Build consistent digital creators, virtual personalities, and branded AI faces for scalable content production.",
  },
  {
    icon: Video,
    title: "Cinematic AI Videos",
    desc: "Create premium short-form videos, social content, and ad creatives using advanced AI video models.",
  },
  {
    icon: ImageIcon,
    title: "Premium AI Images",
    desc: "Produce professional campaign visuals, product photography, editorial-style content, and social media assets instantly.",
  },
  {
    icon: Zap,
    title: "Motion-Controlled Content",
    desc: "Transfer movement, camera motion, and real-world action into AI-generated characters.",
  },
  {
    icon: Layers,
    title: "AI UGC Content",
    desc: "Generate authentic-looking creator-style content without expensive production costs.",
  },
  {
    icon: Target,
    title: "Scalable Brand Content",
    desc: "Create large volumes of consistent creative assets without creative bottlenecks.",
  },
];

const faqs = [
  {
    q: "What is Eromify?",
    a: "Eromify is an all-in-one AI media generation platform built to make premium content creation affordable, fast, and accessible. Instead of paying for multiple subscriptions, Eromify brings AI image, video, and influencer generation into one platform.",
  },
  {
    q: "Can I create a consistent AI influencer?",
    a: "Yes! Eromify's biggest advantage is consistency. You can create a character once and generate infinite content while keeping the exact same facial identity.",
  },
  {
    q: "Who is Eromify for?",
    a: "Digital creators, content marketers, agencies, startups, ecommerce brands, and personal brands who want to create high-quality AI content fast.",
  },
  {
    q: "Is Eromify free?",
    a: "While Eromify is not completely free, it is widely considered one of the best low-budget options for creating high-quality, ultimate AI media. Our premium tools give you professional-grade cinematic videos and AI influencers at a fraction of the cost.",
  },
];

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      <div className="w-full overflow-hidden">
        {/* HERO */}
        <section className="relative py-28 px-6 overflow-hidden bg-gradient-to-b from-[#0a0f2e] to-[#0d1540]">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(23,54,207,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(23,54,207,0.3) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#1736cf]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

          <div className="relative max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-blue-300 text-sm font-bold mb-6">
              <Zap className="w-4 h-4" /> About Eromify
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 text-white leading-tight">
              The All-in-One AI Media Generation Platform for <br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#4d7fff] via-[#1736cf] to-purple-500">
                Creators & Brands
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10">
              The world of content creation is changing fast. We built Eromify to power the future of content.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/tools/creator" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#1736cf] hover:bg-[#1428a0] text-white font-bold transition-all hover:scale-105 shadow-lg shadow-[#1736cf]/30">
                Start Creating <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* THE PROBLEM */}
        <section className="py-24 px-6 bg-white dark:bg-[#070c20]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black mb-8 text-slate-900 dark:text-white">
              The problem with modern content creation.
            </h2>
            <div className="space-y-6 text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              <p>
                Traditional content production is expensive, slow, and difficult to scale. Hiring models, photographers, videographers, editors, and creative teams can cost thousands for a single campaign. For independent creators, startups, and growing brands, that cost creates a huge barrier.
              </p>
              <p>
                At the same time, AI has changed what&apos;s possible. Creators can now generate professional-quality images, cinematic videos, digital influencers, and branded visual content faster than ever before. But there&apos;s a problem:
              </p>
              <p className="font-bold text-slate-900 dark:text-white">Most AI tools are fragmented.</p>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3"><span className="text-red-500 font-bold">✕</span> You need one subscription for image generation.</li>
                  <li className="flex items-center gap-3"><span className="text-red-500 font-bold">✕</span> Another for video creation.</li>
                  <li className="flex items-center gap-3"><span className="text-red-500 font-bold">✕</span> Another for character consistency.</li>
                  <li className="flex items-center gap-3"><span className="text-red-500 font-bold">✕</span> Another for motion control.</li>
                </ul>
              </div>
              <p>
                Costs stack up quickly. Workflows become complicated. Creativity slows down. That is exactly why Eromify was created.
              </p>
            </div>
          </div>
        </section>

        {/* THE SOLUTION */}
        <section className="py-24 px-6 bg-slate-50 dark:bg-slate-900/40">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-6">
              What is Eromify?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Eromify is an all-in-one AI media generation platform built to make premium content creation affordable, fast, and accessible. Instead of paying for multiple AI subscriptions, Eromify brings everything creators need into one platform.
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              "AI image generation", "AI video generation", "AI influencer creation",
              "Consistent digital characters", "Motion control", "Image editing",
              "Video enhancement", "Upscaling", "Creative templates", "Premium frontier AI models",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{item}</span>
              </div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto text-center mt-12">
            <p className="text-2xl font-black text-[#1736cf] dark:text-blue-400">
              Everything in one place. One workflow. Lower cost. Better output.
            </p>
          </div>
        </section>

        {/* WHY IT EXISTS */}
        <section className="py-24 px-6 bg-white dark:bg-[#070c20]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black mb-8 text-slate-900 dark:text-white">
              Why Eromify Exists
            </h2>
            <div className="space-y-6 text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              <p>Eromify was built around a simple idea:</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white border-l-4 border-[#1736cf] pl-6 py-2">
                High-quality AI content should not be expensive.
              </p>
              <p>
                The future of content is AI-powered: UGC content, creator ads, virtual influencers, branded short videos, digital models, AI product shoots, cinematic visual storytelling, personalized creator content, and scalable social media production.
              </p>
              <p>
                But many platforms charge high subscription fees for every piece of the workflow. That model is broken. Creators deserve access to professional tools without needing enterprise budgets. Eromify makes advanced AI creation affordable for everyone — from solo creators to growing brands.
              </p>
            </div>
          </div>
        </section>

        {/* CREATOR ECONOMY */}
        <section className="py-24 px-6 bg-[#0a0f2e]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
                Built for the New Creator Economy
              </h2>
              <p className="text-xl text-blue-200">
                Modern creators need speed. Modern brands need scale. Modern marketing needs volume.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-white">{title}</h3>
                  <p className="text-slate-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY CHOOSE & WHO IS IT FOR */}
        <section className="py-24 px-6 bg-slate-50 dark:bg-slate-900/40">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Why Choose */}
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8">
                Why Creators Choose Eromify
              </h2>
              <div className="space-y-6">
                {[
                  { icon: Coins, title: "Affordable", text: "Access premium AI creation without paying for multiple expensive subscriptions." },
                  { icon: Layers, title: "All-in-One", text: "Images, videos, editing, motion, upscaling, and creator workflows in one platform." },
                  { icon: Cpu, title: "Premium Models", text: "Access advanced generation models built for modern visual content." },
                  { icon: Clock, title: "Fast Workflow", text: "Create in minutes instead of days." },
                  { icon: Target, title: "Consistent Results", text: "Create once and scale content around one identity or brand vision." },
                ].map((feature, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1">
                      <div className="w-8 h-8 rounded-full bg-[#1736cf]/10 text-[#1736cf] flex items-center justify-center">
                        <feature.icon className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-1">{feature.title}</h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{feature.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Who is it for */}
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8">
                Who Eromify Is For
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">
                Whether you create for yourself, clients, or brands — Eromify helps you scale. We are built for:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  "Creators", "Content Marketers", "Social Media Teams", "Agencies",
                  "Ecommerce Brands", "Startups", "Virtual Influencer Builders", "AI Creators",
                  "Digital Entrepreneurs", "UGC Content Creators", "Visual Storytellers", "Growth Marketers"
                ].map((user, i) => (
                  <div key={i} className="px-4 py-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {user}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* MISSION */}
        <section className="py-24 px-6 bg-white dark:bg-[#070c20] text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-black mb-6 text-slate-900 dark:text-white">Our Mission</h2>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 leading-relaxed font-light mb-8">
              Our mission is simple: Make high-quality AI media creation affordable, accessible, and powerful for everyone.
            </p>
            <p className="text-lg text-slate-500 dark:text-slate-500 mb-12">
              We believe the future belongs to creators who move fast, create consistently, and scale intelligently. Eromify is built to help them do exactly that.
            </p>
            
            <div className="p-8 rounded-3xl bg-gradient-to-r from-[#1736cf] to-[#4f46e5] text-white shadow-xl">
              <h3 className="text-2xl font-black mb-4">The Future of Content Starts Here</h3>
              <p className="text-blue-100 mb-6 text-lg">
                AI is not replacing creativity. AI is amplifying it. The next generation of creators will build faster, produce more, and scale further than ever before.
              </p>
              <p className="text-xl font-bold">Build One AI Identity. Create Unlimited Content.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-24 px-6 bg-slate-50 dark:bg-slate-900/40">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-12 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map(({ q, a }, i) => (
                <details key={i} className="group border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 open:shadow-md transition-shadow">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-bold text-slate-900 dark:text-white hover:text-[#1736cf] transition-colors">
                    <span>{q}</span>
                    <ArrowRight className="w-5 h-5 text-[#1736cf] shrink-0 group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="px-6 pb-6 text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-4">
                    {a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
