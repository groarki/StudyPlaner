import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { BorderRadius, Colors, FontSize, Spacing } from '../../../constants/theme';

type AddLinkModalProps = {
  visible: boolean;
  title: string;
  url: string;
  onChangeTitle: (value: string) => void;
  onChangeUrl: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
};

export default function AddLinkModal({
  visible,
  title,
  url,
  onChangeTitle,
  onChangeUrl,
  onClose,
  onSave,
}: AddLinkModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardHost}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Add link</Text>
            <TextInput
              style={styles.input}
              placeholder="Title"
              placeholderTextColor={Colors.textSecondary}
              value={title}
              onChangeText={onChangeTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Paste link"
              placeholderTextColor={Colors.textSecondary}
              value={url}
              onChangeText={onChangeUrl}
              autoCapitalize="none"
              keyboardType="url"
            />
            <TouchableOpacity
              style={styles.saveButton}
              activeOpacity={0.85}
              onPress={onSave}
            >
              <Text style={styles.saveButtonText}>Save link</Text>
            </TouchableOpacity>
          </Pressable>
        </KeyboardAvoidingView>
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
  keyboardHost: {
    width: '100%',
    alignItems: 'center',
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  input: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    color: Colors.text,
    fontSize: FontSize.md,
  },
  saveButton: {
    minHeight: 42,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  saveButtonText: {
    color: Colors.background,
    fontSize: FontSize.md,
    fontWeight: '500',
  },
});
