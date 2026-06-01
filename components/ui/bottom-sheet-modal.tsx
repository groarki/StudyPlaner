import { type ReactNode } from 'react';
import { Modal, TouchableOpacity, View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing, FontSize } from '../../constants/theme';

type BottomSheetModalProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

export default function BottomSheetModal({
  visible,
  title,
  onClose,
  children,
  contentStyle,
}: BottomSheetModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View style={[styles.modalSheet, contentStyle]}>
            <Text style={styles.modalTitle}>{title}</Text>
            {children}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
});
