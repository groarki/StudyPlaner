import { create } from 'zustand';
import { Lecture } from '../types';

interface LecturesState {
  lectures: Lecture[];
  isLoading: boolean;
  error: string | null;
  setLectures: (lectures: Lecture[]) => void;
  addLecture: (lecture: Lecture) => void;
  updateLecture: (id: string, data: Partial<Lecture>) => void;
  deleteLecture: (id: string) => void;
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

  deleteLecture: (id) =>
    set((state) => ({
      lectures: state.lectures.filter((l) => l.id !== id),
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
