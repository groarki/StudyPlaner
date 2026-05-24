import { Modal, Pressable, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors, FontSize, Spacing } from '../../constants/theme';

type LectureActionsModalProps = {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
};

export default function LectureActionsModal({
  visible,
  onClose,
  onEdit,
  onDelete,
  disabled = false,
}: LectureActionsModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
          <TouchableOpacity
            style={styles.modalActionButton}
            onPress={onEdit}
            disabled={disabled}
          >
            <Text style={styles.modalActionText}>Edit lecture</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modalActionButton, styles.modalActionButtonBorder]}
            onPress={onDelete}
            disabled={disabled}
          >
            <Text style={[styles.modalActionText, styles.modalDeleteText]}>
              Delete lecture
            </Text>
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
  modalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: Colors.background,
    borderRadius: 14,
    overflow: 'hidden',
  },
  modalActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  modalActionButtonBorder: {
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  modalActionText: {
    fontSize: FontSize.lg,
    color: Colors.text,
    fontWeight: '500',
  },
  modalDeleteText: {
    color: Colors.error,
  },
});
