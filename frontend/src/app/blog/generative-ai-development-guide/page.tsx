import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  Clock,
  Calendar,
  User,
  Tag,
  ArrowLeft,
  Share2,
  Sparkles,
  Zap,
  Target,
  Workflow,
  Cpu,
  Settings,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Generative AI (GenAI) Development: Complete Guide for Beginners | Eromify Blog",
  description:
    "A comprehensive beginner's guide to Generative AI development. Learn about Large Language Models (LLMs), RAG systems, prompt engineering, and the future of AI automation.",
  keywords: [
    "Generative AI",
    "GenAI development",
    "AI guide",
    "Prompt engineering",
    "Retrieval-Augmented Generation",
    "RAG",
    "Fine-tuning",
    "AI agents",
    "LLMOps",
    "Artificial Intelligence",
    "Beginner guide to AI",
  ],
  authors: [{ name: "Akash Rana", url: "https://www.linkedin.com/in/akash-rana-24478421b/" }],
  openGraph: {
    title: "Generative AI (GenAI) Development: Complete Guide for Beginners",
    description:
      "Generative AI is transforming how software is built. Learn the core pillars of GenAI development: prompt engineering, RAG, agents, and fine-tuning.",
    url: "/blog/generative-ai-development-guide",
    siteName: "Eromify",
    type: "article",
    publishedTime: "2026-04-12T00:00:00.000Z",
    authors: ["Akash Rana"],
    tags: ["AI", "Technology", "GenAI", "Development"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Generative AI (GenAI) Development: Complete Guide for Beginners",
    description:
      "A complete breakdown of generative AI development for modern engineers.",
  },
  alternates: {
    canonical: "/blog/generative-ai-development-guide",
  },
};

export default function GenAIGuideBlogPost() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Generative AI (GenAI) Development: Complete Guide for Beginners",
    description:
      "Generative AI development is transforming how software is built by enabling machines to create content, automate workflows, and enhance user experiences.",
    author: {
      "@type": "Person",
      name: "Akash Rana",
      url: "https://www.linkedin.com/in/akash-rana-24478421b/",
    },
    publisher: {
      "@type": "Organization",
      name: "Eromify",
      url: "https://www.eromify.in",
    },
    datePublished: "2026-04-12",
    dateModified: "2026-04-12",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://www.eromify.in/blog/generative-ai-development-guide",
    },
    keywords: "Generative AI, GenAI development, AI development guide, LLMs, prompt engineering, RAG",
    articleSection: "AI & Technology",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-slate-50 min-h-screen">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-slate-500">
              <li>
                <Link href="/" className="hover:text-[#1736cf] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <ChevronRight className="h-3 w-3" />
              </li>
              <li>
                <Link href="/blog" className="hover:text-[#1736cf] transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <ChevronRight className="h-3 w-3" />
              </li>
              <li className="text-slate-900 font-medium truncate max-w-[200px]">
                GenAI Guide
              </li>
            </ol>
          </nav>

          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-[#1736cf] font-semibold mb-8 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Link>

          {/* Article Header */}
          <article itemScope itemType="https://schema.org/Article">
            <header className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <span className="px-3 py-1 rounded-full bg-[#1736cf]/10 text-[#1736cf] text-xs font-bold uppercase tracking-wider">
                  AI &amp; Technology
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider">
                  Must Read
                </span>
              </div>

              <h1
                itemProp="headline"
                className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] mb-6"
              >
                Generative AI (GenAI) Development: Complete Guide for Beginners
              </h1>

              <p className="text-xl text-slate-600 leading-relaxed mb-8 font-medium">
                Generative AI (GenAI) development is transforming how software is built by enabling machines to create content, automate workflows, and enhance user experiences.
              </p>

              <div className="flex flex-wrap items-center gap-5 text-sm text-slate-500 pb-8 border-b border-slate-200">
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  <a
                    href="https://www.linkedin.com/in/akash-rana-24478421b/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-slate-800 hover:text-[#1736cf] transition-colors"
                    itemProp="author"
                  >
                    Akash Rana
                  </a>
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <time dateTime="2026-04-12" itemProp="datePublished">
                    April 12, 2026
                  </time>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  8 min read
                </span>
                <div className="flex items-center gap-1.5 ml-auto">
                  <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-[#1736cf] hover:border-[#1736cf] transition-all">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </header>

            {/* Article Content */}
            <div className="prose prose-slate prose-lg max-w-none" itemProp="articleBody">
              <p className="text-slate-700 text-lg leading-relaxed mb-6 italic border-l-4 border-[#1736cf] pl-6 py-2 bg-[#1736cf]/5 rounded-r-xl">
                From chatbots and code generation to image and video creation, GenAI is becoming a core part of modern applications.
              </p>

              <p className="text-slate-700 leading-relaxed mb-10">
                In this guide, we&apos;ll break down what generative AI development is, how it works, and the key areas you need to understand to get started.
              </p>

              <h2 className="text-2xl font-black text-slate-900 mt-12 mb-6 flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-[#1736cf]" />
                What is Generative AI?
              </h2>
              <p className="text-slate-700 leading-relaxed mb-6">
                Generative AI refers to artificial intelligence models that can create new content instead of just analyzing data. These models are trained on large datasets and can generate outputs that closely resemble human-created content.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                {[
                  { icon: MessageCircle, label: "Text", desc: "Blogs, emails, code" },
                  { icon: ImageIcon, label: "Images", desc: "Visuals from prompts" },
                  { icon: Music, label: "Audio", desc: "Speech synthesis" },
                  { icon: Video, label: "Video", desc: "Clips & animations" },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-[#1736cf]">
                      {/* Note: I'll use common icons here to avoid complex imports if needed */}
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm leading-none">{item.label}</p>
                      <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <h2 className="text-2xl font-black text-slate-900 mt-12 mb-8">
                Key Areas of Generative AI Development
              </h2>

              <div className="space-y-12">
                {/* Section 1 */}
                <section>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-4">
                    <span className="w-8 h-8 rounded-lg bg-[#1736cf] text-white flex items-center justify-center text-sm">1</span>
                    Prompt Engineering
                  </h3>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    Prompt engineering is the process of designing inputs to get the best possible output from AI models. A well-structured prompt can significantly improve accuracy and relevance.
                  </p>
                  <ul className="list-disc pl-6 text-slate-600 text-sm space-y-2">
                    <li>Clear instructions & context setting</li>
                    <li>Few-shot examples for pattern matching</li>
                    <li>System-level personality definition</li>
                    <li>Structured formatting requirements</li>
                  </ul>
                </section>

                {/* Section 2 */}
                <section>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-4">
                    <span className="w-8 h-8 rounded-lg bg-[#1736cf]/80 text-white flex items-center justify-center text-sm">2</span>
                    API Integration
                  </h3>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    Most developers use APIs to integrate AI into applications. Platforms like OpenAI, Anthropic, and Google Gemini provide easy access to powerful models via REST or SDKs.
                  </p>
                  <div className="bg-slate-900 rounded-xl p-4 text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-800">
                    {`const response = await ai.generate({ prompt: "Hello world" });`}
                  </div>
                </section>

                {/* Section 3 */}
                <section>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-4">
                    <span className="w-8 h-8 rounded-lg bg-[#1736cf]/60 text-white flex items-center justify-center text-sm">3</span>
                    Retrieval-Augmented Generation (RAG)
                  </h3>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    RAG is a technique that combines AI with your own data. Instead of relying only on training data, the model retrieves relevant context from your databases (like PDFs or SQL) before generating a response.
                  </p>
                  <div className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <Target className="h-5 w-5 text-amber-600 mt-1 shrink-0" />
                    <p className="text-sm text-amber-900">
                      <strong>Why use RAG?</strong> It eliminates hallucinations by grounding the AI in factual, up-to-date company data without expensive re-training.
                    </p>
                  </div>
                </section>

                {/* Section 4 */}
                <section>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-4">
                    <span className="w-8 h-8 rounded-lg bg-[#1736cf]/40 text-white flex items-center justify-center text-sm">4</span>
                    Fine-Tuning
                  </h3>
                  <p className="text-slate-700 leading-relaxed">
                    Fine-tuning involves training a model further on specific datasets to make it better at a particular style or task. For example, a legal assistant trained on specific law documents.
                  </p>
                </section>

                {/* Section 5 */}
                <section>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-4">
                    <span className="w-8 h-8 rounded-lg bg-[#1736cf]/30 text-white flex items-center justify-center text-sm">5</span>
                    AI Agents &amp; Automation
                  </h3>
                  <p className="text-slate-700 leading-relaxed">
                    AI agents are systems that can perform tasks autonomously. They can think, plan, and execute actions using tools like APIs, browsers, or code execution.
                  </p>
                </section>

                {/* Section 6 */}
                <section>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-4">
                    <span className="w-8 h-8 rounded-lg bg-[#1736cf]/20 text-white flex items-center justify-center text-sm">6</span>
                    LLMOps (AI Operations)
                  </h3>
                  <p className="text-slate-700 leading-relaxed">
                    LLMOps focuses on deploying and managing AI systems in production. It includes monitoring performance, optimizing latency, managing token costs, and ensuring reliable output filtering.
                  </p>
                </section>
              </div>

              <h2 className="text-2xl font-black text-slate-900 mt-16 mb-8">
                The Stack: Tools You Need
              </h2>
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Feature</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Popular Tools</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">Frameworks</td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-mono">LangChain, LlamaIndex, Vercel AI SDK</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">Models</td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-mono">GPT-4, Claude 3.5, Gemini 1.5, Llama 3</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">Vector DB</td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-mono">Pinecone, Weaviate, Supabase Vec</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">Ops/Monitoring</td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-mono">LangSmith, Helicone, Weights &amp; Biases</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className="text-2xl font-black text-slate-900 mt-16 mb-6">
                Conclusion
              </h2>
              <p className="text-slate-700 leading-relaxed mb-10">
                Generative AI development is about using AI models to build smarter applications that can create, automate, and assist. Whether you&apos;re building a chatbot, an AI tool, or a full SaaS product, understanding GenAI concepts like prompt engineering, RAG, and AI agents is essential in 2026.
              </p>

              <div className="p-8 bg-slate-900 rounded-2xl text-white">
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-4">Ready to build?</p>
                <h4 className="text-2xl font-bold mb-6 italic">
                  &quot;The gap between having an idea and shipping a product has never been smaller.&quot;
                </h4>
                <Link
                  href="/tools"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#1736cf] rounded-xl font-bold hover:bg-[#1430b8] transition-all"
                >
                  Explore AI Tools <ArrowLeft className="h-4 w-4 rotate-180" />
                </Link>
              </div>
            </div>

            {/* Footer */}
            <footer className="mt-16 pt-8 border-t border-slate-200">
              <div className="flex flex-wrap items-center gap-2 mb-10">
                <Tag className="h-4 w-4 text-slate-400" />
                {["#GenerativeAI", "#LLMs", "#AIdevelopment", "#Coding", "#RAG", "#PromptEngineering"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-slate-100 text-xs font-semibold rounded-full text-slate-500 hover:text-[#1736cf] transition-colors cursor-pointer"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>

              <div className="p-8 bg-white border border-slate-200 rounded-3xl flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden relative shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/AKASH.png" alt="Akash Rana" className="object-cover" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <p className="text-lg font-black text-slate-900 mb-1">Akash Rana</p>
                  <p className="text-sm text-slate-500 mb-4 font-medium uppercase tracking-tighter">
                    Chief Editor &amp; Full-Stack Engineer · Eromify
                  </p>
                  <p className="text-slate-600 text-sm leading-relaxed mb-5 max-w-xl">
                    Passionate about building AI-first tools and exploring the intersection of productivity and engineering. Sharing insights into the rapidly evolving world of automation.
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-4">
                    <a
                      href="#"
                      className="text-xs font-bold text-[#1736cf] hover:underline"
                    >
                      Follow on LinkedIn
                    </a>
                    <a
                      href="#"
                      className="text-xs font-bold text-slate-500 hover:underline"
                    >
                      Follow on Twitter
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex justify-between items-center text-xs text-slate-400">
                <Link href="/blog" className="font-bold text-[#1736cf] hover:underline">
                  ← See All Blogs
                </Link>
                <span>© 2026 Eromify Blog</span>
              </div>
            </footer>
          </article>
        </main>
      </div>
    </>
  );
}

// Dummy lucide icons for components that might not be imported yet
const MessageCircle = (props: any) => <Zap {...props} />;
const ImageIcon = (props: any) => <Zap {...props} />;
const Music = (props: any) => <Zap {...props} />;
const Video = (props: any) => <Zap {...props} />;
