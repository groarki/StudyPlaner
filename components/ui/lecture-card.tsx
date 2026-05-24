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
      <Text style={styles.title} numberOfLines={2}>
        {lecture.title}
      </Text>
      <View style={styles.timeCont}>
        <Text style={styles.time}>
          {lecture.startTime}-{lecture.endTime}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    height: 110,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '500',
    color: '#3a3a3a',
    flex: 1,
    paddingRight: Spacing.sm,
  },
  timeCont: {
    backgroundColor: Colors.White,
    padding: Spacing.xs,
    borderRadius: BorderRadius.lg,
  }, 
  time: {
    fontSize: FontSize.md,
    color: '#3a3a3a',
    fontWeight: '500',
  },
});
