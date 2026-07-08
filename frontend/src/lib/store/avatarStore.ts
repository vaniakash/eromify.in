import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AvatarProfile {
  id: string;
  name: string;
  username: string;
  baseImage: string | null;
  createdAt: number;
}

interface AvatarStore {
  avatars: AvatarProfile[];
  createAvatar: (name: string, username: string) => AvatarProfile;
  updateAvatarBaseImage: (id: string, imageUrl: string) => void;
  deleteAvatar: (id: string) => void;
}

export const useAvatarStore = create<AvatarStore>()(
  persist(
    (set, get) => ({
      avatars: [],
      
      createAvatar: (name, username) => {
        const newAvatar: AvatarProfile = {
          id: Math.random().toString(36).substring(2, 11), // Simple unique ID
          name,
          username,
          baseImage: null,
          createdAt: Date.now(),
        };
        
        set((state) => ({
          avatars: [...state.avatars, newAvatar],
        }));
        
        return newAvatar;
      },
      
      updateAvatarBaseImage: (id, imageUrl) => {
        set((state) => ({
          avatars: state.avatars.map((avatar) =>
            avatar.id === id ? { ...avatar, baseImage: imageUrl } : avatar
          ),
        }));
      },
      
      deleteAvatar: (id) => {
        set((state) => ({
          avatars: state.avatars.filter((avatar) => avatar.id !== id),
        }));
      },
    }),
    {
      name: 'eromify-avatars', // name of item in the storage (must be unique)
    }
  )
);
