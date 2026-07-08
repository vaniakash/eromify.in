import { Metadata } from "next";
import { AvatarProfileClient } from "@/components/avatar/AvatarProfileClient";
import { use } from "react";

export const metadata: Metadata = {
  title: "AI Avatar Profile - Eromify",
  description: "View and manage your AI avatar profile.",
};

export default function AvatarProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AvatarProfileClient id={id} />;
}
