import { Metadata } from "next";
import { AvatarHubClient } from "@/components/avatar/AvatarHubClient";

export const metadata: Metadata = {
  title: "AI Avatar & Influencer Studio | Eromify",
  description: "Manage your consistent AI identities. Create, edit, and scale your virtual influencers directly from the Eromify Avatar Studio.",
};

export default function AvatarPage() {
  return <AvatarHubClient />;
}
