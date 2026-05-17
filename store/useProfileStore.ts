import { create } from 'zustand';
import { HelpfulLink } from '../types';

interface ProfileState {
  name: string;
  avatarUrl: string | null;
  helpfulLinks: HelpfulLink[];
  setName: (name: string) => void;
  setAvatarUrl: (url: string | null) => void;
  setHelpfulLinks: (links: HelpfulLink[]) => void;
  addHelpfulLink: (link: HelpfulLink) => void;
  removeHelpfulLink: (id: string) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
    name: '',
    avatarUrl: null,
    helpfulLinks: [],

    setName: (name) => set({ name }),
    setAvatarUrl: (avatarUrl) => set({ avatarUrl }),
    setHelpfulLinks: (helpfulLinks) => set({ helpfulLinks }),

    addHelpfulLink: (link) =>
        set((state) => ({ helpfulLinks: [...state.helpfulLinks, link] })),

    removeHelpfulLink: (id) =>
        set((state) => ({
            helpfulLinks: state.helpfulLinks.filter((l) => l.id !== id),
        })),
}));