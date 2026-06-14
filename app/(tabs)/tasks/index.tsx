import { useState } from 'react';
import {
 ActivityIndicator,
 FlatList,
 StyleSheet,
 Text,
 TouchableOpacity,
 View,
} from 'react-native';
import { router } from 'expo-router';
import { CirclePlus } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';
import { useTasksStore } from '../../../store';
import type { Task } from '../../../types';
import TaskCard from '../../../components/tasks/task-card';
import ScreenWrapper from '../../../components/screen-wrapper';
import { BorderRadius, Colors, FontSize, Spacing } from '../../../constants/theme';
import { hydrateAppData } from '../../../utils/hydrate-app-data';
import { offlineAlert } from '../../../utils/network';

type ViewMode = 'upcoming' | 'completed';
type UpcomingListItem =
 | { type: 'header'; id: string; date: string }
 | { type: 'task'; id: string; task: Task };

function parseTaskDate(value: string): Date | null {
 const normalized = value?.trim();
 if (!normalized) return null;

 const iso = new Date(normalized);
 if (!Number.isNaN(iso.getTime())) return iso;

 const parts = normalized.split(/[./-]/).map((part) => Number(part));
 if (parts.length === 3 && parts.every((part) => !Number.isNaN(part))) {
  const [a, b, c] = parts;
  const year = String(a).length === 4 ? a : c;
  const month = b;
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

export default function TasksScreen() {
 const [activeView, setActiveView] = useState<ViewMode>('upcoming');
 const { tasks, updateTask, isLoading, error } = useTasksStore();

 const upcoming = tasks.filter((task) => !task.isCompleted);
 const groupedTasks = new Map<string, Task[]>();

 upcoming.forEach((task) => {
  const key = task.dueDate || 'No date';
  const current = groupedTasks.get(key) ?? [];
  current.push(task);
  groupedTasks.set(key, current);
 });

 const upcomingSections = Array.from(groupedTasks.entries()).map(([date, items]) => ({
  date,
  items,
 }));

 const completedTasks = tasks.filter((task) => task.isCompleted);

 const upcomingListItems: UpcomingListItem[] = upcomingSections.flatMap((section) => [
  { type: 'header' as const, id: `header-${section.date}`, date: section.date },
  ...section.items.map((task) => ({ type: 'task' as const, id: task.id, task })),
 ]);

 const openTask = (taskId: string) => {
  router.push({
   pathname: '/(tabs)/tasks/[id]',
   params: { id: taskId },
  });
 };

 const markTaskCompleted = async (taskId: string) => {
  if (!(await offlineAlert('Unable to update task'))) return;

  updateTask(taskId, { isCompleted: true });
  const { error } = await supabase.from('tasks').update({ is_completed: true }).eq('id', taskId);

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
                    style={[
                        styles.switchButton,
                        activeView === 'upcoming' ? styles.switchActive : styles.switchInactive,
                    ]}
                    onPress={() => setActiveView('upcoming')}
                    activeOpacity={0.9}
                >
                    <Text
                        style={[
                            styles.switchText,
                            activeView === 'upcoming' ? styles.switchTextActive : styles.switchTextInactive,
                        ]}
                    >
                        Upcoming tasks
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.switchButton,
                        activeView === 'completed' ? styles.switchActive : styles.switchInactive,
                    ]}
                    onPress={() => setActiveView('completed')}
                    activeOpacity={0.9}
                >
                    <Text
                        style={[
                            styles.switchText,
                            activeView === 'completed' ? styles.switchTextActive : styles.switchTextInactive,
                        ]}
                    >
                        Completed tasks
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {isLoading ? (
                    <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
                ) : activeView === 'upcoming' ? (
                    <FlatList
                        data={upcomingListItems}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.contentInner}
                        ListEmptyComponent={
                          error && tasks.length === 0 ? (
                            <View style={styles.errorState}>
                              <Text style={styles.emptyText}>Unable to load tasks</Text>
                              <Text style={styles.errorText}>{error}</Text>
                              <TouchableOpacity
                                style={styles.retryButton}
                                activeOpacity={0.85}
                                onPress={hydrateAppData}
                              >
                                <Text style={styles.retryButtonText}>Retry</Text>
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <Text style={styles.emptyText}>No upcoming tasks</Text>
                          )
                        }
                        renderItem={({ item }) => {
                            if (item.type === 'header') {
                                return (
                                    <View style={styles.sectionHeader}>
                                        <Text style={styles.sectionTitle}>{formatHeadingDate(item.date)}</Text>
                                        <View style={styles.sectionLine} />
                                    </View>
                                );
                            }

                            return (
                                <View style={styles.taskListItem}>
                                    <TaskCard
                                        task={item.task}
                                        swipeEnabled
                                        onPress={() => openTask(item.task.id)}
                                        onMarkComplete={markTaskCompleted}
                                    />
                                </View>
                            );
                        }}
                    />
                ) : (
                    <FlatList
                        data={completedTasks}
                        keyExtractor={(task) => task.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.contentInner}
                        ListEmptyComponent={
                          error && tasks.length === 0 ? (
                            <View style={styles.errorState}>
                              <Text style={styles.emptyText}>Unable to load tasks</Text>
                              <Text style={styles.errorText}>{error}</Text>
                              <TouchableOpacity
                                style={styles.retryButton}
                                activeOpacity={0.85}
                                onPress={hydrateAppData}
                              >
                                <Text style={styles.retryButtonText}>Retry</Text>
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <Text style={styles.emptyText}>No completed tasks</Text>
                          )
                        }
                        renderItem={({ item }) => (
                            <View style={styles.taskListItem}>
                                <TaskCard task={item} onPress={() => openTask(item.id)} />
                            </View>
                        )}
                    />
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
 errorState: {
  alignItems: 'center',
 },
 errorText: {
  color: Colors.textSecondary,
  fontSize: FontSize.md,
  textAlign: 'center',
  marginTop: Spacing.xs,
  marginBottom: Spacing.md,
 },
 retryButton: {
  borderRadius: BorderRadius.xl,
  paddingHorizontal: Spacing.lg,
  paddingVertical: Spacing.sm,
  backgroundColor: Colors.primary,
 },
 retryButtonText: {
  color: Colors.background,
  fontSize: FontSize.md,
  fontWeight: '600',
 },
 sectionHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: Spacing.sm,
  marginBottom: Spacing.md,
  marginTop: Spacing.sm,
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
 taskListItem: {
  marginBottom: Spacing.sm,
 },
});
