'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Upload, X } from 'lucide-react';
import { useAvatarStore } from '@/lib/store/avatarStore';
import { useRouter } from 'next/navigation';

interface CreateAvatarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAvatarModal({ open, onOpenChange }: CreateAvatarModalProps) {
  const router = useRouter();
  const createAvatar = useAvatarStore((state) => state.createAvatar);
  
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    // Simulate network delay for a premium feel
    setTimeout(() => {
      const newAvatar = createAvatar(name.trim(), username.trim() || `@${name.trim().toLowerCase().replace(/\s+/g, '')}.ai`);
      setIsSubmitting(false);
      onOpenChange(false);
      setName('');
      setUsername('');
      router.push(`/avatar/${newAvatar.id}`);
    }, 500);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-md bg-[#0f0f13] border border-white/10 shadow-2xl rounded-2xl p-6 z-50 animate-in fade-in zoom-in-95 duration-200">
          <Dialog.Title className="text-xl font-bold text-white text-center mb-1">
            Create New Influencer
          </Dialog.Title>
          <Dialog.Description className="text-slate-400 text-sm text-center mb-6">
            Give your AI influencer a name and username
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Photo Upload Circle Placeholder */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center text-slate-400 hover:text-white hover:border-white/40 hover:bg-white/10 transition-colors cursor-pointer">
                <Upload className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-medium tracking-wide uppercase">Photo</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-semibold text-white">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Becky"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1736cf]/50 focus:border-[#1736cf]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="username" className="text-sm font-semibold text-white">
                Username <span className="text-slate-500 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-400 font-medium">@</span>
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Becky.ai"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1736cf]/50 focus:border-[#1736cf]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-300 bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim() || isSubmitting}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/25"
              >
                {isSubmitting ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>

          <Dialog.Close asChild>
            <button className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
