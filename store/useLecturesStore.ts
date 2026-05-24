import { create } from 'zustand';
import type { Lecture } from '../types';
import { supabase } from '../lib/supabase';

interface LecturesState {
  lectures: Lecture[];
  isLoading: boolean;
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
  error: null,

  setLectures: (lectures) => set({ lectures }),

  addLecture: (lecture) =>
    set((state) => ({ lectures: [...state.lectures, lecture] })),

  updateLecture: (id, data) =>
    set((state) => ({
      lectures: state.lectures.map((l) => (l.id === id ? { ...l, ...data } : l)),
    })),

  deleteLecture: async (id) => {
    try {
      const { error } = await supabase
        .from('lectures')
        .delete()
        .eq('id', id);

      if (error) {
        set({ error: error.message });
        return false;
      }

      set((state) => ({
        error: null,
        lectures: state.lectures.filter((l) => l.id !== id),
      }));
      return true;
    } catch {
      set({ error: 'Failed to delete lecture' });
      return false;
    }
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
