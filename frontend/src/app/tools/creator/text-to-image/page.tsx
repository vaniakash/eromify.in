import { Metadata } from "next";
import { Suspense } from "react";
import TextToImageClient from "@/components/tools/TextToImageClient";

export const metadata: Metadata = {
  title: "Text-to-Image Generator — AI Image Creation | Eromify",
  description:
    "Generate stunning AI images from text prompts using NanoBanana Pro, Wan 2.7 Image Pro, GPT Image 2, Seedream 4.5 Pro, and Qwen Image Plus. Choose from library templates.",
  openGraph: {
    title: "Text-to-Image Generator — AI Image Creation | Eromify",
    description:
      "Generate stunning AI images from text prompts. Choose from curated templates and advanced AI models.",
    url: "/tools/creator/text-to-image",
  },
  alternates: {
    canonical: "/tools/creator/text-to-image",
  },
};

export default function TextToImagePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950">
          <div className="animate-pulse text-slate-500 text-sm">Loading generator…</div>
        </div>
      }
    >
      <TextToImageClient />
    </Suspense>
  );
}
