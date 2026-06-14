import { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Check } from 'lucide-react-native';
import type { Task } from '../../types';
import { BorderRadius, Colors, FontSize, Spacing } from '../../constants/theme';

interface Props {
  task: Task;
  onPress?: () => void;
  swipeEnabled?: boolean;
  onMarkComplete?: (taskId: string) => void;
}

export default function TaskCard({ task, onPress, swipeEnabled = false, onMarkComplete }: Props) {
  const swipeableRef = useRef<Swipeable | null>(null);
  const cardStyle = task.isCompleted
    ? styles.completedCard
    : { backgroundColor: task.color ?? '#E8E3B5' };

  const cardContent = (
    <TouchableOpacity style={[styles.card, cardStyle]} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.topRow}>
        <Text style={styles.title} numberOfLines={2}>
          {task.title}
        </Text>
        {task.isCompleted ? (
          <View style={styles.donePill}>
            <Text style={styles.doneText}>✓</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.details} numberOfLines={2} ellipsizeMode="tail">{task.notes ? `${task.notes}` : 'No Details'}</Text>
        <View style={styles.timeCont}>
          <Text style={styles.time}>
            {task.isCompleted
              ? ``
              : `due ${task.dueTime.slice(0, 5)}`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!swipeEnabled || task.isCompleted) {
    return cardContent;
  }

  return (
    <Swipeable
      ref={swipeableRef}
      friction={1.4}
      leftThreshold={220}
      overshootLeft
      overshootFriction={8}
      renderLeftActions={(_: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
        const opacity = dragX.interpolate({
          inputRange: [0, 40, 120],
          outputRange: [0, 0.6, 1],
          extrapolate: 'clamp',
        });
        return (
          <Animated.View style={[styles.leftAction, { opacity }]}>
            <Check size={28} color="#114218" strokeWidth={2.8} />
          </Animated.View>
        );
      }}
      onSwipeableOpen={(direction: 'left' | 'right') => {
        if (direction === 'left') {
          onMarkComplete?.(task.id);
        }
        swipeableRef.current?.close();
      }}
    >
      {cardContent}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    minHeight: 82,
    gap: 8,
    width: 320,
  },
  completedCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    width: 320,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '500',
    color: Colors.text,
    flex: 1,
    maxWidth: 220
  },
  donePill: {
    backgroundColor: '#B8EAB9',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 2,
  },
  doneText: {
    color: '#1d5b20',
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  leftAction: {
    width: '100%',
    alignItems: 'flex-start',
    borderTopLeftRadius: BorderRadius.lg,
    borderBottomLeftRadius: BorderRadius.lg,
    justifyContent: 'center',
    paddingLeft: 20,
    backgroundColor: '#8ccb9053',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  details: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    maxWidth: 180
  },
  timeCont: {
    backgroundColor: Colors.White,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 4,
    borderRadius: BorderRadius.lg,
  },
  time: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '500',
  },
});
