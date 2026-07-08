import { Metadata } from "next";
import ExploreClient from "@/components/tools/ExploreClient";

const BASE = "https://www.eromify.in";

export const metadata: Metadata = {
  title: "AI Influencer Studio — Browse & Create AI Influencers | Eromify",
  description:
    "Explore trending AI influencers created by the Eromify community. Browse photorealistic virtual models, copy generation prompts, and create your own AI influencer in seconds.",
  keywords:
    "AI influencer studio, virtual influencer gallery, AI model creator, AI influencer generator, create AI influencer, photorealistic virtual models, AI persona creator, Eromify studio",
  alternates: {
    canonical: `${BASE}/ai-influencer-studio`,
  },
  openGraph: {
    title: "AI Influencer Studio — Trending AI Influencers | Eromify",
    description:
      "Browse photorealistic AI influencers, copy prompts, and generate your own virtual personas using advanced AI models on Eromify.",
    url: `${BASE}/ai-influencer-studio`,
    siteName: "Eromify",
    type: "website",
    images: [
      {
        url: `${BASE}/eromifylogo.png`,
        width: 512,
        height: 512,
        alt: "Eromify AI Influencer Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Influencer Studio | Eromify",
    description:
      "Browse and create photorealistic AI influencers. No limits, no watermarks.",
    images: [`${BASE}/eromifylogo.png`],
  },
};

// JSON-LD structured data for rich results
const collectionPageSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "AI Influencer Studio",
  description:
    "A curated gallery of photorealistic AI influencers created with Eromify's advanced AI generation platform.",
  url: `${BASE}/ai-influencer-studio`,
  inLanguage: "en",
  isPartOf: {
    "@type": "WebSite",
    name: "Eromify",
    url: BASE,
  },
  about: {
    "@type": "Thing",
    name: "AI Influencer Generation",
  },
};

export default function AIInfluencerStudioPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />
      <ExploreClient />
    </>
  );
}
