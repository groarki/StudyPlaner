import { useCallback, useEffect, useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { CirclePlus } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useTasksStore } from '../../store';
import type { TaskDbRow } from '../../types';
import { mapTaskFromDb } from '../../utils';
import TaskCard from '../../components/ui/task-card';
import ScreenWrapper from '../../components/screen-wrapper';
import { BorderRadius, Colors, FontSize, Spacing } from '../../constants/theme';

type ViewMode = 'upcoming' | 'completed';

function parseTaskDate(value: string): Date | null {
  const normalized = value?.trim();
  if (!normalized) return null;

  const iso = new Date(normalized);
  if (!Number.isNaN(iso.getTime())) return iso;

  const parts = normalized.split(/[./-]/).map((part) => Number(part));
  if (parts.length === 3 && parts.every((part) => !Number.isNaN(part))) {
    const [a, b, c] = parts;
    const year = String(a).length === 4 ? a : c;
    const month = String(a).length === 4 ? b : b;
    const day = String(a).length === 4 ? c : a;
    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function formatHeadingDate(value: string): string {
  const date = parseTaskDate(value);
  if (!date) return value;
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${weekday}, ${day}.${month}`;
}

export default function TasksTab() {
  const params = useLocalSearchParams<{ view?: string }>();
  const activeView: ViewMode = params.view === 'completed' ? 'completed' : 'upcoming';
  const { tasks, setTasks, updateTask, isLoading, setLoading } = useTasksStore();

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('tasks').select('*').order('due_date', { ascending: true });
      if (error || !data) return;
      setTasks((data as TaskDbRow[]).map(mapTaskFromDb));
    } finally {
      setLoading(false);
    }
  }, [setLoading, setTasks]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [fetchTasks]),
  );

  const upcomingSections = useMemo(() => {
    const upcoming = tasks.filter((task) => !task.isCompleted);
    const grouped = new Map<string, typeof upcoming>();

    upcoming.forEach((task) => {
      const key = task.dueDate || 'No date';
      const current = grouped.get(key) ?? [];
      current.push(task);
      grouped.set(key, current);
    });

    return Array.from(grouped.entries()).map(([date, items]) => ({ date, items }));
  }, [tasks]);

  const completedTasks = useMemo(() => tasks.filter((task) => task.isCompleted), [tasks]);

  const switchView = (nextView: ViewMode) => {
    router.replace({
      pathname: '/(tabs)/tasks',
      params: { view: nextView },
    });
  };

  const markTaskCompleted = async (taskId: string) => {
    updateTask(taskId, { isCompleted: true });
    const { error } = await supabase
      .from('tasks')
      .update({ is_completed: true })
      .eq('id', taskId);

    if (error) {
      updateTask(taskId, { isCompleted: false });
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Tasks</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add-task')}>
            <CirclePlus size={28} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.switchRow}>
        <TouchableOpacity
          style={[styles.switchButton, activeView === 'upcoming' ? styles.switchActive : styles.switchInactive]}
          onPress={() => switchView('upcoming')}
          activeOpacity={0.9}
        >
          <Text style={[styles.switchText, activeView === 'upcoming' ? styles.switchTextActive : styles.switchTextInactive]}>
            Upcoming tasks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.switchButton, activeView === 'completed' ? styles.switchActive : styles.switchInactive]}
          onPress={() => switchView('completed')}
          activeOpacity={0.9}
        >
          <Text style={[styles.switchText, activeView === 'completed' ? styles.switchTextActive : styles.switchTextInactive]}>
            Completed tasks
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
        ) : activeView === 'upcoming' ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentInner}>
            {upcomingSections.length === 0 ? (
              <Text style={styles.emptyText}>No upcoming tasks</Text>
            ) : (
              upcomingSections.map((section) => (
                <View key={section.date} style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{formatHeadingDate(section.date)}</Text>
                    <View style={styles.sectionLine} />
                  </View>

                  <View style={styles.cards}>
                    {section.items.map((task) => (
                      <TaskCard key={task.id} task={task} swipeEnabled onMarkComplete={markTaskCompleted} />
                    ))}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentInner}>
            {completedTasks.length === 0 ? (
              <Text style={styles.emptyText}>No completed tasks</Text>
            ) : (
              <View style={styles.cards}>
                {completedTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  addButton: {
    padding: 2,
  },
  switchRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  switchButton: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  switchActive: {
    backgroundColor: Colors.primary,
  },
  switchInactive: {
    backgroundColor: '#E9E9E9',
  },
  switchText: {
    fontSize: FontSize.md,
    fontWeight: '500',
  },
  switchTextActive: {
    color: Colors.background,
  },
  switchTextInactive: {
    color: '#7A7A7A',
  },
  content: {
    flex: 1,
    paddingTop: Spacing.md,
  },
  contentInner: {
    paddingBottom: Spacing.xl,
  },
  loader: {
    marginTop: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: FontSize.lg,
    marginTop: 40,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    color: Colors.text,
    fontWeight: '500',
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2F2F2F',
  },
  cards: {
    gap: Spacing.sm,
  },
});
