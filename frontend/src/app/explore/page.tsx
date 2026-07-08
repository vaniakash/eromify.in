import { Metadata } from "next";
import ExploreClient from "@/components/tools/ExploreClient";

export const metadata: Metadata = {
  title: "Community - Trending AI Influencers | Eromify",
  description: "Discover trending AI influencers and create your own on Eromify's Community feed.",
  openGraph: {
    title: "Community - Trending AI Influencers | Eromify",
    description: "Discover trending AI influencers and create your own on Eromify's Community feed.",
    url: "/explore",
  },
  alternates: {
    canonical: "/explore",
  },
};

export default function ExplorePage() {
  return <ExploreClient />;
}
