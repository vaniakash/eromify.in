import { Metadata } from "next";
import { Suspense } from "react";
import ImageGenClient from "@/components/tools/ImageGenClient";

export const metadata: Metadata = {
  title: "AI Image Generator — Stable Diffusion 3.5 & Ultra | Eromify",
  description:
    "Generate stunning AI images from text prompts using Stability AI's Stable Diffusion 3.5 Large and Ultra models. Free, fast, no watermarks.",
  openGraph: {
    title: "AI Image Generator | Eromify",
    description:
      "Turn your ideas into stunning visuals with Stable Diffusion 3.5 & Ultra.",
    url: "/tools/image-gen",
  },
  alternates: {
    canonical: "/tools/image-gen",
  },
};

export default function ImageGenPage() {
  return (
    <Suspense>
      <ImageGenClient />
    </Suspense>
  );
}
