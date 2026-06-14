import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { mapLectureFromDb, mapTaskFromDb } from '../lib/db-mappers';
import { useLecturesStore, useTasksStore } from '../store';
import type { LectureDbRow, TaskDbRow } from '../types';

export function useHydrateAppData() {
  const {
    setLectures,
    setLoading: setLecturesLoading,
    setError: setLecturesError,
  } = useLecturesStore();
  const {
    setTasks,
    setLoading: setTasksLoading,
    setError: setTasksError,
  } = useTasksStore();

  useEffect(() => {
    let isMounted = true;

    const hydrateAppData = async () => {
      setLecturesLoading(true);
      setTasksLoading(true);

      try {
        setLectures([]);
        setTasks([]);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (!isMounted) return;

        if (userError || !user) {
          const message = userError?.message ?? 'User not found';
          setLecturesError(message);
          setTasksError(message);
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

        if (!isMounted) return;

        if (lecturesResponse.error) {
          setLecturesError(lecturesResponse.error.message);
        } else if (lecturesResponse.data) {
          setLectures((lecturesResponse.data as LectureDbRow[]).map(mapLectureFromDb));
        }

        if (tasksResponse.error) {
          setTasksError(tasksResponse.error.message);
        } else if (tasksResponse.data) {
          setTasks((tasksResponse.data as TaskDbRow[]).map(mapTaskFromDb));
        }
      } finally {
        if (isMounted) {
          setLecturesLoading(false);
          setTasksLoading(false);
        }
      }
    };

    hydrateAppData();

    return () => {
      isMounted = false;
    };
  }, [
    setLectures,
    setLecturesError,
    setLecturesLoading,
    setTasks,
    setTasksError,
    setTasksLoading,
  ]);
}
