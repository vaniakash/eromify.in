'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X, Download, UserPlus, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { useAvatarStore } from '@/lib/store/avatarStore';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TemplateModalProps {
  template: { id: string; src: string; alt: string; category: string } | null;
  onClose: () => void;
}

export function TemplateModal({ template, onClose }: TemplateModalProps) {
  const router = useRouter();
  const { avatars, updateAvatarBaseImage } = useAvatarStore();
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  if (!template) return null;

  const handleApply = () => {
    if (!selectedAvatarId) return;
    setIsApplying(true);
    
    // Simulate slight delay
    setTimeout(() => {
      updateAvatarBaseImage(selectedAvatarId, template.src);
      setIsApplying(false);
      onClose();
      router.push(`/avatar/${selectedAvatarId}`);
    }, 400);
  };

  return (
    <Dialog.Root open={!!template} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-[#0a0a0f]/80 backdrop-blur-md z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-4xl bg-[#0f0f13] border border-white/10 shadow-2xl rounded-[32px] overflow-hidden z-50 flex flex-col md:flex-row max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
          
          {/* Image Side */}
          <div className="relative w-full md:w-1/2 aspect-[4/5] md:aspect-auto bg-[#151520]">
            <Image
              src={template.src}
              alt={template.alt}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Details & Actions Side */}
          <div className="w-full md:w-1/2 p-8 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="bg-white/5 border border-white/10 text-slate-300 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                  {template.category}
                </span>
                <Dialog.Close className="text-slate-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
                  <X className="w-5 h-5" />
                </Dialog.Close>
              </div>
              
              <Dialog.Title className="text-3xl font-bold text-white mb-2 tracking-tight">AI Base Model</Dialog.Title>
              <Dialog.Description className="text-slate-400 text-sm leading-relaxed mb-8">
                Use this template as a base image for one of your AI influencers. All generated content will use this likeness.
              </Dialog.Description>

              {/* Avatar Selection */}
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-violet-400" />
                Select Avatar
              </h3>
              
              {avatars.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                  <p className="text-slate-400 text-sm mb-4">You haven't created any avatars yet.</p>
                  <button 
                    onClick={() => {
                      onClose();
                      router.push('/avatar');
                    }}
                    className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg transition-all"
                  >
                    Create Avatar First
                  </button>
                </div>
              ) : (
                <div className="space-y-3 mb-8 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {avatars.map((avatar) => (
                    <div 
                      key={avatar.id}
                      onClick={() => setSelectedAvatarId(avatar.id)}
                      className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                        selectedAvatarId === avatar.id 
                          ? 'border-violet-500 bg-violet-500/10' 
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#151520] border border-white/10 overflow-hidden relative flex items-center justify-center">
                          {avatar.baseImage ? (
                            <Image src={avatar.baseImage} alt={avatar.name} fill className="object-cover" />
                          ) : (
                            <span className="text-sm font-bold text-violet-400">{avatar.name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">{avatar.name}</p>
                          <p className="text-slate-500 text-xs">{avatar.baseImage ? 'Change model' : 'No model assigned'}</p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        selectedAvatarId === avatar.id ? 'border-violet-500 bg-violet-500' : 'border-slate-600'
                      }`}>
                        {selectedAvatarId === avatar.id && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-6 border-t border-white/5 mt-auto">
              <button 
                className="px-6 py-4 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/5 flex items-center gap-2 transition-colors"
              >
                <Download className="w-5 h-5" />
                <span className="hidden sm:inline">Download</span>
              </button>
              <button 
                onClick={handleApply}
                disabled={!selectedAvatarId || isApplying}
                className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
              >
                {isApplying ? 'Applying...' : 'Apply to Avatar'}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
