import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  View,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Colors, BorderRadius, Spacing, FontSize } from '../../../constants/theme';

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
  const [isMounted, setIsMounted] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(520)).current;
  const isClosing = useRef(false);

  const animateIn = useCallback(() => {
    isClosing.current = false;
    overlayOpacity.setValue(0);
    sheetTranslateY.setValue(520);

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [overlayOpacity, sheetTranslateY]);

  const animateOut = useCallback((afterClose?: () => void) => {
    if (isClosing.current) return;
    isClosing.current = true;

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 170,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 520,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsMounted(false);
      isClosing.current = false;
      afterClose?.();
    });
  }, [overlayOpacity, sheetTranslateY]);

  useEffect(() => {
    if (visible && !isMounted) {
      setIsMounted(true);
      requestAnimationFrame(animateIn);
      return;
    }

    if (!visible && isMounted) {
      animateOut();
    }
  }, [visible, isMounted, animateIn, animateOut]);

  const closeWithAnimation = useCallback(() => {
    animateOut(onClose);
  }, [animateOut, onClose]);

  return (
    <Modal
      visible={isMounted}
      transparent
      animationType="none"
      onRequestClose={closeWithAnimation}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeWithAnimation}>
          <Animated.View
            pointerEvents="none"
            style={[styles.backdrop, { opacity: overlayOpacity }]}
          />
        </Pressable>

        <View pointerEvents="box-none" style={styles.sheetHost}>
          <Animated.View style={{ transform: [{ translateY: sheetTranslateY }] }}>
            <View style={[styles.modalSheet, contentStyle]}>
              <Text style={styles.modalTitle}>{title}</Text>
              {children}
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  sheetHost: {
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
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
