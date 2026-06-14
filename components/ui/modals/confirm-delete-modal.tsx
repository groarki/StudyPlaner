import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, FontSize, Spacing } from '../../../constants/theme';

type ConfirmDeleteModalProps = {
  visible: boolean;
  isDeleting?: boolean;
  title?: string;
  message?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmDeleteModal({
  visible,
  isDeleting = false,
  title = 'Delete lecture?',
  message = 'This action cannot be undone.',
  onCancel,
  onConfirm,
}: ConfirmDeleteModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onCancel}
    >
      <Pressable style={styles.modalBackdrop} onPress={onCancel}>
        <Pressable style={styles.confirmCard} onPress={() => {}}>
          <Text style={styles.confirmTitle}>{title}</Text>
          <Text style={styles.confirmText}>{message}</Text>

          <View style={styles.confirmActionsRow}>
            <TouchableOpacity
              style={[styles.confirmButton, styles.confirmCancelButton]}
              onPress={onCancel}
              disabled={isDeleting}
            >
              <Text style={styles.confirmCancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmButton, styles.confirmDeleteButton]}
              onPress={onConfirm}
              disabled={isDeleting}
            >
              <Text style={styles.confirmDeleteText}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Text>
            </TouchableOpacity>
          </View>
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
  confirmCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  confirmTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  confirmText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  confirmActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCancelButton: {
    backgroundColor: '#F2F2F2',
  },
  confirmDeleteButton: {
    backgroundColor: '#FFF3F3',
  },
  confirmCancelText: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '500',
  },
  confirmDeleteText: {
    color: Colors.error,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
});
