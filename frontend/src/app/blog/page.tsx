import { Metadata } from "next";
import { BlogClient } from "@/components/blog/BlogClient";

export const metadata: Metadata = {
  title: "AI Influencer Blog, AI Avatar Guides & Creator SEO | Eromify",
  description: "Read practical Eromify guides on AI influencer creation, AI avatar generators, no-watermark AI images, virtual creators, cinematic videos, and creator growth workflows.",
  openGraph: {
    title: "AI Influencer Blog, AI Avatar Guides & Creator SEO | Eromify",
    description: "Practical guides for building AI influencers, generating no-watermark images, planning virtual creator content, and scaling AI media workflows with Eromify.",
    url: "/blog",
  },
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogPage() {
  return <BlogClient />;
}
