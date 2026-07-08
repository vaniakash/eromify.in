'use client';

import { useAvatarStore } from "@/lib/store/avatarStore";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft, Instagram, Sparkles, MapPin, Calendar,
  Heart, Share2, Grid, LayoutTemplate, Plus, Wand2, RefreshCw
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AvatarProfileClient({ id }: { id: string }) {
  const router = useRouter();
  const { avatars } = useAvatarStore();
  const [hydrated, setHydrated] = useState(false);

  // Wait for Zustand persist to rehydrate from localStorage
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Show loading spinner while rehydrating
  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
        <RefreshCw className="h-8 w-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  const avatar = avatars.find((a) => a.id === id);

  if (!avatar) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0a0a0f] items-center justify-center">
        <div className="w-20 h-20 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6">
          <Wand2 className="h-10 w-10 text-violet-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Avatar not found</h2>
        <p className="text-slate-400 mb-6 text-center max-w-sm">
          The influencer you are looking for does not exist or has been deleted.
        </p>
        <button
          onClick={() => router.push('/avatar')}
          className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          Go Back to Avatars
        </button>
      </div>
    );
  }

  const joinDate = new Date(avatar.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Build the link to AI Influencer creator — pre-fill avatar as the reference image
  const createLink = avatar.baseImage
    ? `/tools/creator/ai-influencer?avatarId=${avatar.id}&ref=${encodeURIComponent(avatar.baseImage)}`
    : `/tools/creator/ai-influencer`;

  return (
    <div className="flex flex-col min-h-full bg-[#0a0a0f]">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-20 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <Link
            href="/avatar"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-medium text-sm"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Avatars
          </Link>
          <div className="flex items-center gap-3">
            <button className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors border border-white/5">
              <Share2 className="h-4 w-4" />
            </button>
            <button className="h-10 px-4 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center gap-2 font-bold text-sm hover:from-violet-500 hover:to-indigo-500 transition-colors shadow-lg shadow-indigo-500/25">
              <Heart className="h-4 w-4" />
              Follow
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto w-full px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Profile Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#0d0d14] rounded-[32px] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#1736cf]/20 to-transparent opacity-50" />

              {/* Avatar Image */}
              <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-[#0d0d14] shadow-xl mx-auto mb-6 relative z-10 bg-[#151520] flex items-center justify-center">
                {avatar.baseImage ? (
                  <Image
                    src={avatar.baseImage}
                    alt={avatar.name}
                    fill
                    className="object-cover object-top"
                  />
                ) : (
                  <span className="text-5xl font-bold text-violet-400">{avatar.name.charAt(0).toUpperCase()}</span>
                )}
              </div>

              <div className="text-center mb-6 relative z-10">
                <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-2 mb-1">
                  {avatar.name}
                  <span className="bg-violet-500/10 text-violet-400 border border-violet-500/20 text-xs px-2.5 py-0.5 rounded-full font-bold">AI</span>
                </h1>
                <p className="text-slate-400 font-medium">
                  {avatar.username || `@${avatar.name.toLowerCase()}.ai`}
                </p>
              </div>

              {!avatar.baseImage ? (
                <div className="text-center mb-8 relative z-10">
                  <p className="text-amber-400/90 text-sm mb-4 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                    No base model yet. Pick a template to get started.
                  </p>
                  <Link href="/avatar/templates">
                    <button className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-white/10">
                      <LayoutTemplate className="w-4 h-4 text-violet-400" />
                      Assign Template
                    </button>
                  </Link>
                </div>
              ) : (
                <p className="text-slate-400 text-sm leading-relaxed text-center mb-8 relative z-10">
                  Digital creator and virtual influencer. Generating stunning AI content for social media and beyond.
                </p>
              )}

              <div className="flex items-center justify-center gap-8 mb-8 pb-8 border-b border-white/5 relative z-10">
                <div className="text-center">
                  <div className="text-xl font-bold text-white">0</div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white">0</div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Posts</div>
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                  <MapPin className="h-5 w-5 text-slate-500" /> Virtual World
                </div>
                <div className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                  <Calendar className="h-5 w-5 text-slate-500" /> Joined {joinDate}
                </div>
                <div className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                  <Instagram className="h-5 w-5 text-pink-500" /> Instagram Content
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Gallery */}
          <div className="lg:col-span-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Grid className="h-6 w-6 text-violet-400" />
                Content Library
              </h2>
              <Link href={createLink}>
                <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all">
                  <Plus className="w-4 h-4" />
                  Generate Image
                </button>
              </Link>
            </div>

            {!avatar.baseImage ? (
              <div className="rounded-[32px] border-2 border-dashed border-white/10 bg-[#0d0d14] flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
                <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 text-slate-500">
                  <LayoutTemplate className="h-10 w-10" />
                </div>
                <h3 className="text-white font-bold text-xl mb-3">No Base Model Assigned</h3>
                <p className="text-slate-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                  Before you can generate content for {avatar.name}, assign a base AI model template first.
                </p>
                <Link href="/avatar/templates">
                  <button className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all">
                    Browse Templates
                  </button>
                </Link>
              </div>
            ) : (
              <div className="rounded-[32px] border border-white/5 bg-[#0d0d14] flex flex-col items-center justify-center p-16 text-center shadow-xl min-h-[400px]">
                <div className="h-16 w-16 bg-violet-500/10 rounded-2xl flex items-center justify-center mb-6 border border-violet-500/20">
                  <Sparkles className="h-8 w-8 text-violet-400" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">No Content Yet</h3>
                <p className="text-slate-400 text-sm mb-6">
                  Start generating AI images using {avatar.name}&apos;s base image as reference.
                </p>
                <Link href={createLink}>
                  <button className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2">
                    <Wand2 className="w-4 h-4" />
                    Create First Post
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
