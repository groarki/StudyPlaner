import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, FontSize, Spacing } from '../../../constants/theme';
import type { Lecture } from '../../../types';

type LectureDetailsModalProps = {
  lecture: Lecture | null;
  visible: boolean;
  onClose: () => void;
};

export default function LectureDetailsModal({
  lecture,
  visible,
  onClose,
}: LectureDetailsModalProps) {
  const details = lecture?.notes?.trim();

  if (!lecture || !details) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        {/* second pressable stops propagation on overlay */}
        <Pressable style={styles.detailsCard} onPress={() => { }}>
          <Text style={styles.title}>{lecture.title}</Text>
          <Text style={styles.time}>
            {lecture.startTime} - {lecture.endTime}
          </Text>

          <View style={styles.detailsBlock}>
            <Text style={styles.detailsLabel}>Details:</Text>
            <Text style={styles.detailsText}>{details}</Text>
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            activeOpacity={0.85}
            onPress={onClose}
          >
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  detailsCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  time: {
    marginTop: Spacing.xs,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  detailsBlock: {
    marginTop: Spacing.sm,
  },
  detailsLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  detailsText: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
  closeButton: {
    marginTop: Spacing.lg,
    minHeight: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: Colors.background,
    fontSize: FontSize.md,
    fontWeight: '500',
  },
});
