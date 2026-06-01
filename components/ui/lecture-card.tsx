import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Lecture } from '../../types';
import { BorderRadius, Colors, FontSize, Spacing } from '../../constants/theme';

interface Props {
  lecture: Lecture;
  onPress?: () => void;
}

export default function LectureCard({ lecture, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: lecture.color }]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.upperInfo}>
        <Text style={styles.title} numberOfLines={2}>
          {lecture.title}
        </Text>
        <View style={styles.timeCont}>
          <Text style={styles.time}>
            {lecture.startTime}-{lecture.endTime}
          </Text>
        </View>
      </View>
      <Text style={styles.notes}>{ lecture.notes}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    minHeight: 110,
  },
  upperInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '500',
    color: Colors.text,
    flex: 1,
    paddingRight: Spacing.sm,
  },
  timeCont: {
    backgroundColor: Colors.White,
    padding: Spacing.xs,
    borderRadius: BorderRadius.lg,
  }, 
  notes: {
    color: Colors.textSecondary
  },
  time: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '500',
  },
});
