import { create } from 'zustand';
import type { Lecture } from '../types';
import { supabase } from '../lib/supabase';
import { saveLecturesForCurrentUser } from '../utils/app-data-cache';
import { getOfflineMutationMessage } from '../utils/network';

interface LecturesState {
  lectures: Lecture[];
  isLoading: boolean;
  hasHydrated: boolean;
  error: string | null;
  setLectures: (lectures: Lecture[]) => void;
  addLecture: (lecture: Lecture) => void;
  updateLecture: (id: string, data: Partial<Lecture>) => void;
  deleteLecture: (id: string) => Promise<boolean>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useLecturesStore = create<LecturesState>((set) => ({
  lectures: [],
  isLoading: false,
  hasHydrated: false,
  error: null,

  setLectures: (lectures) => {
    void saveLecturesForCurrentUser(lectures);
    set({ lectures, hasHydrated: true, error: null });
  },

  addLecture: (lecture) =>
    set((state) => {
      const lectures = [...state.lectures, lecture];
      void saveLecturesForCurrentUser(lectures);

      return { lectures, hasHydrated: true };
    }),

  updateLecture: (id, data) =>
    set((state) => {
      const lectures = state.lectures.map((l) => (l.id === id ? { ...l, ...data } : l));
      void saveLecturesForCurrentUser(lectures);

      return { lectures };
    }),

  deleteLecture: async (id) => {
    try {
      const offlineMessage = await getOfflineMutationMessage();
      if (offlineMessage) {
        set({ error: offlineMessage });
        return false;
      }

      const { error } = await supabase
        .from('lectures')
        .delete()
        .eq('id', id);

      if (error) {
        set({ error: error.message });
        return false;
      }

      set((state) => {
        const lectures = state.lectures.filter((l) => l.id !== id);
        void saveLecturesForCurrentUser(lectures);

        return { error: null, lectures };
      });
      return true;
    } catch {
      set({ error: 'Failed to delete lecture' });
      return false;
    }
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, hasHydrated: true }),
}));
