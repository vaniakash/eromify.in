import { Metadata } from "next";
import { Suspense } from "react";
import ImageGenClient from "@/components/tools/ImageGenClient";

export const metadata: Metadata = {
  title: "AI Image Generator — Free Text-to-Image Tool | Eromify",
  description:
    "Generate stunning, high-resolution AI images from any text prompt for free. Powered by Pollinations.AI with FLUX.1 Dev, Realism, and Turbo models. No watermarks, no sign-up.",
  openGraph: {
    title: "AI Image Generator — Free Text-to-Image Tool | Eromify",
    description:
      "Generate stunning AI images from text prompts. Powered by Pollinations.AI — FLUX, Realism & Turbo models. Free, no watermarks.",
    url: "/tools/creator/image-generator",
  },
  alternates: {
    canonical: "/tools/creator/image-generator",
  },
};

export default function ImageGeneratorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950">
          <div className="animate-pulse text-slate-500 text-sm">Loading generator…</div>
        </div>
      }
    >
      <ImageGenClient />
    </Suspense>
  );
}
