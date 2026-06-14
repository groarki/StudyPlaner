import { create } from 'zustand';
import type { Task } from '../types';
import { saveTasksForCurrentUser } from '../utils/app-data-cache';

interface TasksState {
  tasks: Task[];
  isLoading: boolean;
  hasHydrated: boolean;
  error: string | null;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTasksStore = create<TasksState>((set) => ({
  tasks: [],
  isLoading: false,
  hasHydrated: false,
  error: null,

  setTasks: (tasks) => {
    void saveTasksForCurrentUser(tasks);
    set({ tasks, hasHydrated: true, error: null });
  },

  addTask: (task) =>
    set((state) => {
      const tasks = [...state.tasks, task];
      void saveTasksForCurrentUser(tasks);

      return { tasks, hasHydrated: true };
    }),

  updateTask: (id, data) =>
    set((state) => {
      const tasks = state.tasks.map((t) => (t.id === id ? { ...t, ...data } : t));
      void saveTasksForCurrentUser(tasks);

      return { tasks };
    }),

  deleteTask: (id) =>
    set((state) => {
      const tasks = state.tasks.filter((t) => t.id !== id);
      void saveTasksForCurrentUser(tasks);

      return { tasks };
    }),

  toggleComplete: (id) =>
    set((state) => {
      const tasks = state.tasks.map((t) =>
        t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
      );
      void saveTasksForCurrentUser(tasks);

      return { tasks };
    }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, hasHydrated: true }),
}));
