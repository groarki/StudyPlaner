import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../lib/supabase';
import { mapLectureFromDb, mapTaskFromDb } from '../lib/db-mappers';
import { useLecturesStore, useTasksStore } from '../store';
import { loadCachedAppData, saveCachedAppData } from './app-data-cache';
import type { LectureDbRow, TaskDbRow } from '../types';

export async function hydrateAppData(): Promise<void> {
  const {
    setLectures,
    setLoading: setLecturesLoading,
    setError: setLecturesError,
  } = useLecturesStore.getState();
  const {
    setTasks,
    setLoading: setTasksLoading,
    setError: setTasksError,
  } = useTasksStore.getState();

  setLecturesLoading(true);
  setTasksLoading(true);

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      const message = userError?.message ?? 'User not found';
      setLecturesError(message);
      setTasksError(message);
      return;
    }

    const cachedData = await loadCachedAppData(user.id);
    if (cachedData) {
      setLectures(cachedData.lectures);
      setTasks(cachedData.tasks);
    }

    const networkState = await NetInfo.fetch();
    const isOnline =
      networkState.isConnected !== false && networkState.isInternetReachable !== false;

    if (!isOnline) {
      if (!cachedData) {
        setLecturesError('No internet connection. Saved lectures are not available yet.');
        setTasksError('No internet connection. Saved tasks are not available yet.');
      }
      return;
    }

    const [lecturesResponse, tasksResponse] = await Promise.all([
      supabase
        .from('lectures')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true }),
      supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true })
        .order('due_time', { ascending: true }),
    ]);

    const nextLectures = lecturesResponse.data
      ? (lecturesResponse.data as LectureDbRow[]).map(mapLectureFromDb)
      : cachedData?.lectures ?? [];
    const nextTasks = tasksResponse.data
      ? (tasksResponse.data as TaskDbRow[]).map(mapTaskFromDb)
      : cachedData?.tasks ?? [];

    if (lecturesResponse.error) {
      setLecturesError(lecturesResponse.error.message);
    } else {
      setLectures(nextLectures);
    }

    if (tasksResponse.error) {
      setTasksError(tasksResponse.error.message);
    } else {
      setTasks(nextTasks);
    }

    if (!lecturesResponse.error && !tasksResponse.error) {
      await saveCachedAppData(user.id, {
        lectures: nextLectures,
        tasks: nextTasks,
      });
    }
  } finally {
    setLecturesLoading(false);
    setTasksLoading(false);
  }
}
