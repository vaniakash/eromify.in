'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Users, ChevronRight, Plus, Star, Sparkles, ArrowRight, Trash2, Edit2 } from "lucide-react";
import { useAvatarStore } from "@/lib/store/avatarStore";
import { CreateAvatarModal } from "./CreateAvatarModal";
import { useRouter } from "next/navigation";

export function AvatarHubClient() {
  const router = useRouter();
  const { avatars, deleteAvatar } = useAvatarStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fallback avatars like Sofia if store is completely empty, 
  // but to match user screenshots, we should show empty state if no avatars exist.
  
  if (avatars.length === 0) {
    return (
      <div className="flex flex-col min-h-full bg-[#0a0a0f]">
        {/* Header */}
        <div className="px-8 py-8 flex items-center justify-between border-b border-white/5">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Avatars</h1>
            <p className="text-slate-400 text-sm">Manage your AI avatars and their content library</p>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors border border-white/10"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-2xl border border-white/5 rounded-3xl bg-[#0d0d14] flex flex-col items-center justify-center py-24 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#1736cf]/5 to-transparent opacity-50" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 mb-4 text-slate-500">
                <Users className="w-full h-full" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">No influencers yet</h2>
              <p className="text-slate-400 text-sm mb-6">Create your first AI influencer to start building content.</p>
              
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/25"
              >
                <Plus className="w-4 h-4" />
                Create New
              </button>
            </div>
          </div>
        </div>
        
        <CreateAvatarModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-[#0a0a0f]">
      {/* Header */}
      <div className="px-8 py-8 flex items-center justify-between border-b border-white/5">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Avatars</h1>
          <p className="text-slate-400 text-sm">Manage your AI avatars and their content library</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-indigo-500/25"
        >
          <Plus className="w-4 h-4" />
          Create
        </button>
      </div>

      {/* Avatars Grid */}
      <div className="flex-1 max-w-screen-xl mx-auto w-full px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {avatars.map((avatar) => (
            <div
              key={avatar.id}
              className="group block rounded-[24px] border border-white/10 overflow-hidden bg-[#0d0d14] hover:border-[#1736cf]/40 hover:shadow-2xl hover:shadow-[#1736cf]/10 transition-all duration-500 relative"
            >
              <div className="absolute top-4 left-4 z-20">
                <button className="w-8 h-8 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-current" />
                    <div className="w-1 h-1 rounded-full bg-current" />
                    <div className="w-1 h-1 rounded-full bg-current" />
                  </div>
                </button>
              </div>

              {/* Image Container */}
              <div 
                className="aspect-[4/5] w-full relative overflow-hidden bg-[#151520] flex items-center justify-center cursor-pointer"
                onClick={() => router.push(`/avatar/${avatar.id}`)}
              >
                {avatar.baseImage ? (
                  <>
                    <Image
                      src={avatar.baseImage}
                      alt={avatar.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d14] via-[#0d0d14]/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
                  </>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-[#1e1e2e] border border-white/5 flex items-center justify-center shadow-2xl">
                    <span className="text-4xl font-bold text-violet-400">{avatar.name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>

              {/* Info Bottom Bar */}
              <div className="p-5 bg-[#0d0d14] absolute bottom-0 left-0 w-full">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-white text-xl font-bold tracking-tight">
                      {avatar.name}
                    </h2>
                    <p className="text-slate-400 text-sm">
                      {avatar.username || `@${avatar.name.toLowerCase()}.ai`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-slate-500 hover:text-white transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if(confirm('Are you sure you want to delete this avatar?')) {
                          deleteAvatar(avatar.id);
                        }
                      }}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => router.push(`/avatar/${avatar.id}`)}
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  View Content
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CreateAvatarModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </div>
  );
}
