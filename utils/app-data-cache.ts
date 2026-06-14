import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import type { Lecture, Task } from '../types';

type CachedAppData = {
  lectures: Lecture[];
  tasks: Task[];
  savedAt: string;
};

const CACHE_KEY_PREFIX = 'studyplaner_app_data';

function getCacheKey(userId: string): string {
  return `${CACHE_KEY_PREFIX}:${userId}`;
}

async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

export async function loadCachedAppData(userId: string): Promise<CachedAppData | null> {
  try {
    const cached = await AsyncStorage.getItem(getCacheKey(userId));
    if (!cached) return null;

    return JSON.parse(cached) as CachedAppData;
  } catch {
    return null;
  }
}

export async function saveCachedAppData(
  userId: string,
  data: Pick<CachedAppData, 'lectures' | 'tasks'>,
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      getCacheKey(userId),
      JSON.stringify({
        ...data,
        savedAt: new Date().toISOString(),
      }),
    );
  } catch (error) {
    console.warn('Unable to save app data cache', error);
  }
}

export async function saveTasksForCurrentUser(tasks: Task[]): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const cached = await loadCachedAppData(userId);
  await saveCachedAppData(userId, {
    tasks,
    lectures: cached?.lectures ?? [],
  });
}

export async function saveLecturesForCurrentUser(lectures: Lecture[]): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const cached = await loadCachedAppData(userId);
  await saveCachedAppData(userId, {
    lectures,
    tasks: cached?.tasks ?? [],
  });
}
