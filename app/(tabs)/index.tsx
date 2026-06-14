import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { CirclePlus } from 'lucide-react-native';
import { useLecturesStore, useTasksStore } from '../../store';
import type { Lecture } from '../../types';
import ScreenWrapper from '../../components/screen-wrapper';
import LectureCard from '../../components/lectures/lecture-card';
import LectureDetailsModal from '../../components/ui/modals/lecture-details-modal';
import TaskCard from '../../components/tasks/task-card';
import { Colors, FontSize, Spacing } from '../../constants/theme';
import { formatDateForCalendar, getGreeting } from '../../utils';

export default function HomeTab() {
  const [detailsLecture, setDetailsLecture] = useState<Lecture | null>(null);
  const { lectures, isLoading: lecturesLoading } = useLecturesStore();
  const { tasks, isLoading: tasksLoading } = useTasksStore();

  const today = new Date();
  const todayKey = formatDateForCalendar(today);
  const todayDayOfWeek = today.getDay();

  const todayLectures = lectures
    .filter((lecture) => lecture.dayOfWeek === todayDayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .slice(0, 3);

  const todayTasks = tasks
    .filter((task) => !task.isCompleted && task.dueDate === todayKey)
    .sort((a, b) => a.dueTime.localeCompare(b.dueTime))
    .slice(0, 2);

  const isLoading = lecturesLoading || tasksLoading;

  return (
    <ScreenWrapper>
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.title}>Today's plan</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
        ) : (
          <>
            <View style={styles.lecturesSection}>
              {todayLectures.length === 0 ? (
                <View style={styles.emptyBlock}>
                  <Text style={styles.emptyTitle}>No lectures today :)</Text>
                  <Text style={styles.emptyText}>
                    If that looks wrong, tap here to add a lecture
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyButton}
                    activeOpacity={0.85}
                    onPress={() => router.push('/add-lecture')}
                  >
                    <CirclePlus size={22} color={Colors.background} strokeWidth={1.5} />
                    <Text style={styles.emptyButtonText}>Add lecture</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.lecturesList}>
                  <View style={styles.timelineRail} />
                  {todayLectures.map((lecture) => (
                    <View key={lecture.id} style={styles.lectureRow}>
                      <View style={styles.timelineDot} />
                      <View style={styles.lectureCardWrapper}>
                        <LectureCard
                          lecture={lecture}
                          onDetailsPress={() => setDetailsLecture(lecture)}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.tasksSection}>
              <Text style={styles.sectionTitle}>Today's tasks</Text>

              {todayTasks.length === 0 ? (
                <View style={styles.emptyBlock}>
                  <Text style={styles.emptyTitle}>No tasks due today :)</Text>
                  <Text style={styles.emptyText}>
                    If that looks wrong, tap plus to add a task.
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyButton}
                    activeOpacity={0.85}
                    onPress={() => router.push('/add-task')}
                  >
                    <CirclePlus size={22} color={Colors.background} strokeWidth={1.8} />
                    <Text style={styles.emptyButtonText}>Add task</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.tasksList}>
                  {todayTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </View>
              )}
            </View>
          </>
        )}
      <LectureDetailsModal
        visible={Boolean(detailsLecture)}
        lecture={detailsLecture}
        onClose={() => setDetailsLecture(null)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 72,
    paddingBottom: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.md,
  },
  greeting: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  title: {
    fontSize: FontSize.xxl,
    color: Colors.text,
    fontWeight: '700',
  },
  loader: {
    marginTop: 80,
  },
  lecturesSection: {
    minHeight: 380,
    paddingTop: Spacing.sm,
  },
  lecturesList: {
    flex: 1,
    position: 'relative',
    gap: Spacing.xs,
  },
  timelineRail: {
    position: 'absolute',
    left: 3.5,
    top: 2,
    bottom: 0,
    width: 1,
    backgroundColor: '#8E9595',
  },
  lectureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#687070',
    marginTop: 2,
  },
  lectureCardWrapper: {
    flex: 1,
    marginBottom: 16
  },
  tasksSection: {
    borderTopWidth: 1,
    borderTopColor: '#E4E4E4',
    paddingTop: Spacing.lg,
    minHeight: 250,
    marginTop: 'auto',
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  tasksList: {
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  emptyBlock: {
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    color: Colors.text,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  emptyButton: {
    minHeight: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  emptyButtonText: {
    fontSize: FontSize.md,
    color: Colors.background,
    fontWeight: '600',
  },
});
