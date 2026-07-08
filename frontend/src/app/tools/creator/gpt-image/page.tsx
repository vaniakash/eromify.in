import { Metadata } from "next";
import { Suspense } from "react";
import GptImageClient from "@/components/tools/GptImageClient";

export const metadata: Metadata = {
  title: "GPT Image 1 Mini — Text & Image-to-Image Generator | Eromify",
  description:
    "Generate stunning images using OpenAI's GPT Image 1 model via Pollinations.AI. Supports text-to-image and image-to-image editing. Fast, high-quality, no watermarks.",
  openGraph: {
    title: "GPT Image 1 Mini | Eromify",
    description:
      "OpenAI GPT Image 1 powered image generator — text to image or transform any photo with a prompt.",
    url: "/tools/creator/gpt-image",
  },
  alternates: {
    canonical: "/tools/creator/gpt-image",
  },
};

export default function GptImagePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950">
          <div className="animate-pulse text-sm text-slate-500">Loading GPT Image 1…</div>
        </div>
      }
    >
      <GptImageClient />
    </Suspense>
  );
}
