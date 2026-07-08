"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, ArrowRight, TrendingUp, Mail, Filter } from "lucide-react";
import NewsletterForm from "@/components/newsletter/NewsletterForm";
import { cn } from "@/lib/utils";

const ALL_CATEGORIES = [
  { id: "all", label: "All Topics" },
  { id: "tech-gadgets", label: "Tech & Gadgets" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "money-finance", label: "Money & Finance" },
  { id: "health-wellness", label: "Health & Wellness" },
  { id: "career-growth", label: "Career & Growth" },
  { id: "travel-explore", label: "Travel & Explore" },
  { id: "food-drinks", label: "Food & Drinks" },
  { id: "entertainment", label: "Entertainment" },
  { id: "opinions-hot-takes", label: "Opinions & Hot Takes" },
  { id: "personal-stories", label: "Personal & Stories" },
];

const ALL_POSTS = [
  {
    id: "ai-influencer-blog-ideas",
    title: "Top 10 AI Influencer Blog Post Ideas to Publish in 2026",
    description: "A practical SEO content roadmap for AI influencer builders, AI avatar generators, virtual creator workflows, and no-watermark image generation.",
    category: "tech-gadgets",
    categoryLabel: "AI Influencer SEO",
    image: "/influencer.webp",
    author: "AKASH",
    authorImage: "/AKASH.png",
    date: "May 3, 2026",
    readTime: "8 min read",
    href: "/blog/top-10-ai-influencer-blog-post-ideas-2026",
    isFeatured: true,
  },
  {
    id: "what-is-eromify",
    title: "What is Eromify? The Future of AI Influencer & UGC Creation",
    description: "Discover how Eromify helps creators and brands build AI influencers, generate UGC-style content, and scale premium AI media production.",
    category: "tech-gadgets",
    categoryLabel: "AI Influencers",
    image: "/influencer.webp",
    author: "AKASH",
    authorImage: "/AKASH.png",
    date: "May 3, 2026",
    readTime: "9 min read",
    href: "/blog/what-is-eromify-future-ai-influencer-ugc-creation",
    isFeatured: true,
  },
  {
    id: "future-of-ai",
    title: "The Future of AI in Modern Software Development & Engineering",
    description: "Discover how large language models are fundamentally changing the software development lifecycle.",
    category: "tech-gadgets",
    categoryLabel: "Tech & Gadgets",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDOwADqxhLJcMynnNjWJrmyDKtM9NBmPMJdTD2fYCrHd-btm2Od57uWIw9WbGdi_0xtfYuQnDi9jCX6JrLCmQe_D3vmcvHUUG1mcy8CET0zrvbP1jAKLOsZwAVjsJKctg5K6xYA7L72pr8sc788utv74qM1Iv6l1I_rakXx7Kp750O63Uu1V2K3MY4vfcDS_Gv7zqVZcY4AJ43taRDWwvNFpb6t7owHJzOhHeLnqkKcs4r-arS_7aKmXgMlhLYmFWkBl4qo4pS09CI",
    author: "AKASH",
    authorImage: "/AKASH.png",
    date: "March 13, 2026",
    readTime: "12 min read",
    href: "/blog/future-of-ai-software-development",
    isFeatured: true
  },
  {
    id: "generative-ai-guide",
    title: "Generative AI (GenAI) Development: Complete Guide for Beginners",
    description: "Master the pillars of modern AI: from Prompt Engineering and RAG to AI Agents and LLMOps.",
    category: "tech-gadgets",
    categoryLabel: "Tech & Gadgets",
    image: "/generativeai.webp",
    author: "AKASH",
    authorImage: "/AKASH.png",
    date: "April 12, 2026",
    readTime: "8 min read",
    href: "/blog/generative-ai-development-guide",
    isMustRead: true
  }
];

export function BlogClient() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <section className="mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                AI Influencer Guides &amp; Creator Growth for <span className="text-[#1736cf]">Eromify</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-xl">
                Learn how to build AI influencers, generate no-watermark images,
                create cinematic videos, and turn virtual creator workflows into
                real audience growth.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                  <input
                    className="w-full px-4 py-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[#1736cf]/20 focus:border-[#1736cf] outline-none transition-all"
                    placeholder="Search articles, guides..."
                    type="email"
                  />
                </div>
                <button className="px-8 py-4 bg-[#1736cf] text-white font-bold rounded-xl hover:bg-[#1430b8] transition-all flex items-center justify-center gap-2">
                  <Search className="w-5 h-5 border-white" /> Search
                </button>
              </div>
            </div>

            {/* Featured Post Card */}
            <div className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50 transition-transform hover:-translate-y-1">
              <div className="aspect-video w-full bg-slate-100 overflow-hidden relative">
                <Image
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  alt="AI influencer content strategy and virtual creator workflow"
                  src="/influencer.webp"
                />
              </div>
              <div className="p-6 md:p-8 relative">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full bg-[#1736cf]/10 text-[#1736cf] text-xs font-bold uppercase tracking-wider">
                    Featured Article
                  </span>
                  <span className="text-slate-400 text-sm">• 8 min read</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 group-hover:text-[#1736cf] transition-colors leading-tight">
                  Top 10 AI Influencer Blog Post Ideas to Publish in 2026
                </h2>
                <p className="text-slate-600 mb-6 line-clamp-2">
                  A practical SEO content roadmap for AI influencer, AI avatar,
                  virtual creator, and no-watermark image generation topics that
                  can attract creators and brands.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden relative">
                      <Image
                        fill
                        className="object-cover"
                        alt="Portrait of a young professional male editor"
                        src="/AKASH.png"
                      />
                    </div>
                    <div>
                      <a href="https://www.linkedin.com/in/akash-rana-24478421b/" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-slate-900 hover:text-[#1736cf] transition-colors">
                        AKASH
                      </a>
                      <p className="text-xs text-slate-500">
                        Chief Editor • May 3, 2026
                      </p>
                    </div>
                  </div>
                  <a
                    className="text-[#1736cf] font-bold text-sm flex items-center gap-1 group/btn"
                    href="/blog/top-10-ai-influencer-blog-post-ideas-2026"
                  >
                    Read More{" "}
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Filter */}
        <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-4 no-scrollbar">
          <button className="px-6 py-2.5 rounded-full bg-[#1736cf] text-white font-semibold whitespace-nowrap">
            All Topics
          </button>
          <button className="px-6 py-2.5 rounded-full bg-white border border-slate-200 text-slate-600 font-medium hover:border-[#1736cf] hover:text-[#1736cf] transition-all whitespace-nowrap">
            AI &amp; Technology
          </button>
          <button className="px-6 py-2.5 rounded-full bg-white border border-slate-200 text-slate-600 font-medium hover:border-[#1736cf] hover:text-[#1736cf] transition-all whitespace-nowrap">
            AI Influencers
          </button>
          <button className="px-6 py-2.5 rounded-full bg-white border border-slate-200 text-slate-600 font-medium hover:border-[#1736cf] hover:text-[#1736cf] transition-all whitespace-nowrap">
            Cinematic Videos
          </button>
          <button className="px-6 py-2.5 rounded-full bg-white border border-slate-200 text-slate-600 font-medium hover:border-[#1736cf] hover:text-[#1736cf] transition-all whitespace-nowrap">
            Creator Economy
          </button>
          <button className="px-6 py-2.5 rounded-full bg-white border border-slate-200 text-slate-600 font-medium hover:border-[#1736cf] hover:text-[#1736cf] transition-all whitespace-nowrap">
            Generative AI
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Blog Posts Grid */}
          <div className="flex-1">
            <div className="grid md:grid-cols-2 gap-8">
              {/* AI Influencer SEO Roadmap */}
              <article className="flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group">
                <Link href="/blog/top-10-ai-influencer-blog-post-ideas-2026" className="contents">
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <Image
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      alt="AI influencer blog ideas and content strategy"
                      src="/influencer.webp"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#1736cf] bg-[#1736cf]/10 px-2 py-0.5 rounded">
                        AI Influencer SEO
                      </span>
                      <span className="text-xs text-slate-400">8 min read</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3 leading-snug group-hover:text-[#1736cf] transition-colors">
                      Top 10 AI Influencer Blog Post Ideas to Publish in 2026
                    </h3>
                    <p className="text-slate-600 text-sm mb-6 flex-1 line-clamp-2">
                      A practical content roadmap for AI influencer builders, AI avatar generators, virtual creator workflows, and no-watermark image generation SEO.
                    </p>
                    <div className="flex items-center gap-3 pt-6 border-t border-slate-100 mt-auto">
                      <div className="w-8 h-8 rounded-full bg-slate-200 relative overflow-hidden">
                        <Image
                          fill
                          className="object-cover"
                          alt="Akash Rana"
                          src="/AKASH.png"
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700">AKASH</span>
                      <span className="text-xs text-slate-400 ml-auto flex flex-col items-end">
                        <span>May 3, 2026</span>
                        <span className="text-[10px] text-emerald-600 font-bold">SEO Guide 🔥</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </article>

              {/* Premium Eromify Introduction */}
              <article className="flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group">
                <Link href="/blog/what-is-eromify-future-ai-influencer-ugc-creation" className="contents">
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <Image
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      alt="AI influencer and UGC creation platform concept"
                      src="/influencer.webp"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#1736cf] bg-[#1736cf]/10 px-2 py-0.5 rounded">
                        AI Influencers
                      </span>
                      <span className="text-xs text-slate-400">9 min read</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3 leading-snug group-hover:text-[#1736cf] transition-colors">
                      What is Eromify? The Future of AI Influencer &amp; UGC Creation
                    </h3>
                    <p className="text-slate-600 text-sm mb-6 flex-1 line-clamp-2">
                      Discover how Eromify helps creators and brands build AI influencers, generate UGC-style content, and scale premium AI media production.
                    </p>
                    <div className="flex items-center gap-3 pt-6 border-t border-slate-100 mt-auto">
                      <div className="w-8 h-8 rounded-full bg-slate-200 relative overflow-hidden">
                        <Image
                          fill
                          className="object-cover"
                          alt="Akash Rana"
                          src="/AKASH.png"
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700">AKASH</span>
                      <span className="text-xs text-slate-400 ml-auto flex flex-col items-end">
                        <span>May 3, 2026</span>
                        <span className="text-[10px] text-amber-600 font-bold">Premium Guide ✨</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </article>

              {/* Card -1 (Generative AI Guide) */}
              <article className="flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group">
                <Link href="/blog/generative-ai-development-guide" className="contents">
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <Image
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      alt="Neural network and digital human visualization"
                      src="/generativeai.webp"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#1736cf] bg-[#1736cf]/10 px-2 py-0.5 rounded">
                        AI & Technology
                      </span>
                      <span className="text-xs text-slate-400">8 min read</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3 leading-snug group-hover:text-[#1736cf] transition-colors">
                      Generative AI (GenAI) Development: Complete Guide for Beginners
                    </h3>
                    <p className="text-slate-600 text-sm mb-6 flex-1 line-clamp-2">
                      Master the pillars of modern AI: from Prompt Engineering and RAG to AI Agents and LLMOps. A complete guide for engineers.
                    </p>
                    <div className="flex items-center gap-3 pt-6 border-t border-slate-100 mt-auto">
                      <div className="w-8 h-8 rounded-full bg-slate-200 relative overflow-hidden">
                        <Image
                          fill
                          className="object-cover"
                          alt="Akash Rana"
                          src="/AKASH.png"
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700">AKASH</span>
                      <span className="text-xs text-slate-400 ml-auto flex flex-col items-end">
                        <span>April 12, 2026</span>
                        <span className="text-[10px] text-emerald-600 font-bold">Must Read 🔥</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </article>



              {/* Card 1 */}
              <article className="flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group">
                <div className="aspect-[16/10] overflow-hidden relative">
                  <Image
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    alt="Laptop with lines of code on screen in a dark room"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRoZwhVnCHB4lVvNT9DwEP--CAbxI1_1QsN_l71_Vw-hWnUBsXW9rE0ZIcErMocgRXWx90161LO8J6bjR1M13McBr7KqD4gYJIbR073NbyhDKj1QsSFGlP_6QxOcemaC02o0OLhjsJe_Wd09-2ub4PY7qjsOJroV4yMCJUTNr6oevyPzq6rEZFiQEXxOlZZBSF_mIo1CYtJGt42pVGbuT6WQ6ttHTzWy2VZ-XOPONvex8VmlyOMTGUocRwTQOjwmCn8oq-Yt-ZLLI"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#1736cf] bg-[#1736cf]/10 px-2 py-0.5 rounded">
                      Dev Tools
                    </span>
                    <span className="text-xs text-slate-400">8 min read</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug">
                    Essential Next.js 14 Performance Optimizations
                  </h3>
                  <p className="text-slate-600 text-sm mb-6 flex-1">
                    Master server components and edge runtime to deliver
                    lightning fast user experiences with the latest Next.js
                    updates.
                  </p>
                  <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-slate-200 relative overflow-hidden">
                      <Image
                        fill
                        className="object-cover"
                        alt="Portrait of a professional man"
                        src="/AKASH.png"
                      />
                    </div>
                    <a href="https://www.linkedin.com/in/akash-rana-24478421b/" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-slate-700 hover:text-[#1736cf] transition-colors">
                      AKASH
                    </a>
                    <span className="text-xs text-slate-400 ml-auto">
                      March 13, 2026
                    </span>
                  </div>
                </div>
              </article>

              {/* Card 2 */}
              <article className="flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group">
                <div className="aspect-[16/10] overflow-hidden relative">
                  <Image
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    alt="Clean desk setup with notebook and laptop"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZD2-g6j7TLS-GuKR_ZB2j_f73yE9c7B4JGYFfH6aG1cAetlAYCOdE-ZCeIMQ9HO5ulhAQbyy76k4Q1tmQmKX0OKeGtsDEciol5_LsVH5y4PmCJgStcQwDd2-2oVHJJthx98NK8TjwoMOhBQLk9vKqrBOWxjRq7ILPSFqze5aswF9nZKVhU0LUMQsCbzREAxgXZt0SYwGYj9sz8utqiNjM6QMlwdmeE-TrDVPeaEeXY_AiEdhs0JnzOLfGwnze0mZzEcsT0vpNlEg"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      Productivity
                    </span>
                    <span className="text-xs text-slate-400">5 min read</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug">
                    The Pomodoro Technique for CS Students
                  </h3>
                  <p className="text-slate-600 text-sm mb-6 flex-1">
                    How to structure your deep work sessions to master complex
                    algorithms without burning out during finals.
                  </p>
                  <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-slate-200 relative overflow-hidden">
                      <Image
                        fill
                        className="object-cover"
                        alt="Portrait of a woman smiling"
                        src="/AKASH.png"
                      />
                    </div>
                    <a href="https://www.linkedin.com/in/akash-rana-24478421b/" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-slate-700 hover:text-[#1736cf] transition-colors">
                      AKASH
                    </a>
                    <span className="text-xs text-slate-400 ml-auto">
                      March 13, 2026
                    </span>
                  </div>
                </div>
              </article>

              {/* Card 3 */}
              <article className="flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group">
                <div className="aspect-[16/10] overflow-hidden relative">
                  <Image
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    alt="AI robot arm interacting with digital circuit"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPFIwnFydDCYcPc_NoNDZwxN-w5xqpjycrF0lqXSAI3DgvP3IPKujz_itoOQ1NDXxvLOXM8jKtWMc9tufdt39wP4K0DKFh6P16624ZyVuIfEcT9qf6mi6DM8DFCRw_JrLjjOBS97tWzO3J4CFkjRUtdTuLlw3IFSzX4qL-VaVjMvgBBlWgGZmoTjW0P52rbfVenaCHRr1r4QUZQuC3qtn9hDaroVmnx3faHo9EiIejhX3xuaPuoBcBvDabOpQyeDmYyaI42g21aFg"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                      Career
                    </span>
                    <span className="text-xs text-slate-400">10 min read</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug">
                    Navigating the Tech Market in 2024
                  </h3>
                  <p className="text-slate-600 text-sm mb-6 flex-1">
                    Proven strategies to stand out in a competitive hiring
                    environment and landing your first senior role.
                  </p>
                  <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-slate-200 relative overflow-hidden">
                      <Image
                        fill
                        className="object-cover"
                        alt="Editor portrait"
                        src="/AKASH.png"
                      />
                    </div>
                    <a href="https://www.linkedin.com/in/akash-rana-24478421b/" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-slate-700 hover:text-[#1736cf] transition-colors">
                      AKASH
                    </a>
                    <span className="text-xs text-slate-400 ml-auto">
                      March 13, 2026
                    </span>
                  </div>
                </div>
              </article>

              {/* Card 4 */}
              <article className="flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group">
                <div className="aspect-[16/10] overflow-hidden relative">
                  <Image
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    alt="Close up of mechanical keyboard with code background"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDi_9NVNkWe92YHCDiGKlafYwIo6DPS98hBbe2kjNrOuq08NSEfYl3tUc2CWsVXcUue8xrexYpKNkvbD812lV4LwgWR7PfqmDRaBvNNYUs1CBQuQUb6ZA2kR8-XrdVO3xJCSdPVCTM8dL-WVDvMrlv4n_Pc03s7qo6sGpTgLPj9TG0q8qeS4U3qf3H_CXPoEzBlrl_CGfa6CO-TEusuc-DZVi3JbsqCKsv2CytVNsBgs2bflWRG4DoICXOQBkrWhrNEWZE4tHJCj7c"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                      AI Tools
                    </span>
                    <span className="text-xs text-slate-400">7 min read</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug">
                    Top 5 LLMs for Code Generation
                  </h3>
                  <p className="text-slate-600 text-sm mb-6 flex-1">
                    An objective comparison between GPT-4o, Claude 3.5 Sonnet,
                    and Llama 3 for software engineers.
                  </p>
                  <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-slate-200 relative overflow-hidden">
                      <Image
                        fill
                        className="object-cover"
                        alt="Portrait of a man in glasses"
                        src="/AKASH.png"
                      />
                    </div>
                    <a href="https://www.linkedin.com/in/akash-rana-24478421b/" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-slate-700 hover:text-[#1736cf] transition-colors">
                      AKASH
                    </a>
                    <span className="text-xs text-slate-400 ml-auto">
                      March 13, 2026
                    </span>
                  </div>
                </div>
              </article>
            </div>

            <div className="mt-12 flex justify-center">
              <button className="px-8 py-3 rounded-xl border border-slate-200 font-bold hover:bg-slate-50 transition-colors text-slate-700">
                Load More Articles
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 space-y-10">
            {/* Trending Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold flex items-center gap-2">
                <TrendingUp className="text-[#1736cf] w-5 h-5" /> Trending Now
              </h4>
              <div className="space-y-6">
                <a className="group block" href="#">
                  <p className="text-xs font-bold text-[#1736cf] mb-1 uppercase tracking-tighter">
                    01. Artificial Intelligence
                  </p>
                  <h5 className="text-sm font-bold group-hover:text-[#1736cf] transition-colors">
                    How to build your own personal RAG system
                  </h5>
                </a>
                <a className="group block" href="#">
                  <p className="text-xs font-bold text-[#1736cf] mb-1 uppercase tracking-tighter">
                    02. Web Dev
                  </p>
                  <h5 className="text-sm font-bold group-hover:text-[#1736cf] transition-colors">
                    Rust vs Go: Which one for backend in 2024?
                  </h5>
                </a>
                <a className="group block" href="#">
                  <p className="text-xs font-bold text-[#1736cf] mb-1 uppercase tracking-tighter">
                    03. Career
                  </p>
                  <h5 className="text-sm font-bold group-hover:text-[#1736cf] transition-colors">
                    Mastering the behavioral interview for FAANG
                  </h5>
                </a>
              </div>
            </div>

            {/* Newsletter Widget */}
            <div className="bg-[#1736cf]/5 border border-[#1736cf]/20 p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-10">
                <Mail className="w-32 h-32 text-[#1736cf]" />
              </div>
              <h4 className="text-lg font-bold mb-2">Join the Newsletter</h4>
              <p className="text-sm text-slate-600 mb-6">
                Weekly insights on tech, tools, and developer growth delivered
                to your inbox.
              </p>
              <NewsletterForm variant="sidebar" />
              <p className="text-[10px] text-slate-500 mt-4 text-center">
                No spam. Unsubscribe at any time.
              </p>
            </div>

            {/* AI Influencer Tools Hub */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold flex items-center gap-2">
                🤖 AI Influencer Tools
              </h4>
              <div className="space-y-2">
                {[
                  { label: "AI Influencer Generator", href: "/ai-influencer-generator" },
                  { label: "Free AI Influencer Generator", href: "/free-ai-influencer-generator" },
                  { label: "Realistic AI Influencer", href: "/realistic-ai-influencer-generator" },
                  { label: "AI Influencer Maker", href: "/ai-influencer-maker" },
                  { label: "Virtual Influencer Creator", href: "/virtual-influencer-creator" },
                  { label: "AI Fashion Influencer", href: "/ai-fashion-influencer-generator" },
                  { label: "AI Fitness Influencer", href: "/ai-fitness-influencer-generator" },
                  { label: "AI Instagram Influencer", href: "/ai-instagram-influencer-generator" },
                  { label: "AI Female Influencer", href: "/ai-female-influencer-generator" },
                  { label: "AI Male Influencer", href: "/ai-male-influencer-generator" },
                ].map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-[#1736cf] hover:bg-[#1736cf]/5 px-3 py-2 rounded-lg transition-all group"
                  >
                    <ArrowRight className="w-3 h-3 text-[#1736cf] opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all duration-200" />
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Popular Tags */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold">Popular Tags</h4>
              <div className="flex flex-wrap gap-2">
                {["#nextjs", "#ai", "#typescript", "#productivity", "#python", "#remote", "#career"].map(tag => (
                  <a
                    key={tag}
                    className="px-3 py-1 bg-slate-100 text-xs font-medium rounded hover:bg-[#1736cf]/10 hover:text-[#1736cf] transition-colors text-slate-600"
                    href="#"
                  >
                    {tag}
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Full-width CTA Section */}
      <section className="bg-slate-900 py-20 mt-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1736cf]/20 to-transparent pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
            Stay ahead of the curve
          </h2>
          <p className="text-slate-400 text-lg mb-10">
            Join 15,000+ developers and students who receive our weekly breakdown
            of the most important news in AI and software engineering.
          </p>
          <NewsletterForm variant="cta" />
        </div>
      </section>
    </div>
  );
}
