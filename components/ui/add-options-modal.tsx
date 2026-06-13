import { useCallback, useEffect, useRef, useState } from 'react';
import { router, type Href } from 'expo-router';
import { Animated, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BookMarked, CalendarPlus } from 'lucide-react-native';
import { BorderRadius, Colors, FontSize, SCREEN_PADDING, Spacing } from '../../constants/theme';

type AddOptionsModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function AddOptionsModal({ visible, onClose }: AddOptionsModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const sheetTranslateY = useRef(new Animated.Value(520)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const isClosing = useRef(false);

  const animateIn = useCallback(() => {
    isClosing.current = false;
    sheetTranslateY.setValue(520);
    backdropOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(backdropOpacity, {
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
  }, [backdropOpacity, sheetTranslateY]);

  const animateOut = useCallback((afterClose?: () => void) => {
    if (isClosing.current) return;
    isClosing.current = true;

    Animated.parallel([
      Animated.timing(backdropOpacity, {
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
  }, [backdropOpacity, sheetTranslateY]);

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

  const closeModal = useCallback(() => {
    animateOut(onClose);
  }, [animateOut, onClose]);

  const navigateFromModal = (path: Href) => {
    animateOut(() => {
      onClose();
      router.push(path);
    });
  };

  return (
    <Modal
      visible={isMounted}
      transparent
      animationType="none"
      onRequestClose={closeModal}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeModal}>
          <Animated.View
            pointerEvents="none"
            style={[styles.backdrop, { opacity: backdropOpacity }]}
          />
        </Pressable>

        <View pointerEvents="box-none" style={styles.sheetHost}>
          <Animated.View style={{ transform: [{ translateY: sheetTranslateY }] }}>
            <Pressable onPress={() => {}} style={styles.sheet}>
              <Text style={styles.title}>What do you wanna add?</Text>

              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={[styles.optionCard, styles.lectureCard]}
                  activeOpacity={0.85}
                  onPress={() => navigateFromModal('/add-lecture')}
                >
                  <CalendarPlus size={57} color={Colors.text} strokeWidth={1} />
                  <Text style={styles.optionText}>Add lecture</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionCard, styles.taskCard]}
                  activeOpacity={0.85}
                  onPress={() => navigateFromModal('/add-task')}
                >
                  <BookMarked size={57} color={Colors.text} strokeWidth={1} />
                  <Text style={styles.optionText}>Add task</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
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
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingTop: Spacing.lg + Spacing.xs,
    paddingBottom: 80,
    paddingHorizontal: SCREEN_PADDING,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 6,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    justifyContent: 'center',
  },
  optionCard: {
    flex: 1,
    maxWidth: 170,
    minHeight: 176,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
  },
  lectureCard: {
    backgroundColor: '#d2ffdf66',
  },
  taskCard: {
    backgroundColor: '#f8f5b366',
  },
  optionText: {
    marginTop: Spacing.md,
    fontSize: FontSize.md,
    fontWeight: '500',
    color: Colors.text,
    textAlign: 'center',
  },
});
