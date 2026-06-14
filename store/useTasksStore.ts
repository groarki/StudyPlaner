import { create } from 'zustand';
import type { Task } from '../types';

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

  setTasks: (tasks) => set({ tasks, hasHydrated: true, error: null }),

  addTask: (task) =>
    set((state) => ({ tasks: [...state.tasks, task], hasHydrated: true })),

  updateTask: (id, data) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...data } : t)),
    })),

  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),

  toggleComplete: (id) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
      ),
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, hasHydrated: true }),
}));
