import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { HelpfulLink, NotificationSettings } from '../types';

interface ProfileState {
  name: string;
  avatarUrl: string | null;
  helpfulLinks: HelpfulLink[];
  notificationSettings: NotificationSettings;
  setName: (name: string) => void;
  setAvatarUrl: (url: string | null) => void;
  setHelpfulLinks: (links: HelpfulLink[]) => void;
  addHelpfulLink: (link: HelpfulLink) => void;
  removeHelpfulLink: (id: string) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist((set) => ({
    name: '',
    avatarUrl: null,
    helpfulLinks: [],
    notificationSettings: {
      remindersEnabled: true,
      lectureRemindersEnabled: true,
      taskRemindersEnabled: true,
    },

    setName: (name) => set({ name }),
    setAvatarUrl: (avatarUrl) => set({ avatarUrl }),
    setHelpfulLinks: (helpfulLinks) => set({ helpfulLinks }),

    addHelpfulLink: (link) =>
      set((state) => ({ helpfulLinks: [...state.helpfulLinks, link] })),

    removeHelpfulLink: (id) =>
      set((state) => ({
        helpfulLinks: state.helpfulLinks.filter((l) => l.id !== id),
      })),

    updateNotificationSettings: (settings) =>
      set((state) => ({
        notificationSettings: { ...state.notificationSettings, ...settings },
      })),
  }), {
    name: 'studyplanner-profile',
    storage: createJSONStorage(() => AsyncStorage),
  }),
);
