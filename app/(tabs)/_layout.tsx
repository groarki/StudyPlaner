import { useRef, useState } from 'react';
import { router, Tabs } from 'expo-router';
import type { Href } from 'expo-router';
import {
  House,
  Calendar,
  CircleUser,
  CirclePlus,
  BookCheck,
  CalendarPlus,
  BookMarked,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { HapticTab } from '../../components/ui/haptic-tab';
import { BorderRadius, Colors, FontSize, SCREEN_PADDING, Spacing } from '../../constants/theme';


export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const [isAddModalMounted, setIsAddModalMounted] = useState(false);
  const sheetTranslateY = useRef(new Animated.Value(520)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const animateIn = () => {
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
  };

  const animateOut = (afterClose?: () => void) => {
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
      setIsAddModalMounted(false);
      afterClose?.();
    });
  };

  const openAddModal = () => {
    if (isAddModalMounted) return;
    sheetTranslateY.setValue(520);
    backdropOpacity.setValue(0);
    setIsAddModalMounted(true);
    requestAnimationFrame(animateIn);
  };

  const closeAddModal = (afterClose?: () => void) => {
    if (isAddModalMounted) {
      animateOut(afterClose);
      return;
    }
    afterClose?.();
  };

  const navigateFromAddModal = (path: Href) =>
    closeAddModal(() => router.push(path));

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.text,
          tabBarStyle: {
            backgroundColor: Colors.background,
            shadowColor: '#000',
            shadowOffset: { width: 4, height: 0 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 4,
            height: 56 + insets.bottom,
            paddingTop: 10,
            paddingBottom: insets.bottom,
          },
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name='index'
          options={{
            tabBarIcon: ({ color, size }) => (
              <House size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name='calendar'
          options={{
            tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name='add'
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              openAddModal();
            },
          }}
          options={{
            tabBarIcon: ({ color }) => (
              <CirclePlus size={32} color={color} strokeWidth={1.5} />
            ),
          }}
        />
        <Tabs.Screen
          name='tasks'
          options={{
            tabBarIcon: ({ color, size }) => (
              <BookCheck size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name='profile'
          options={{
            tabBarIcon: ({ color, size }) => (
              <CircleUser size={size} color={color} />
            ),
          }}
        />
      </Tabs>

      <Modal
        visible={isAddModalMounted}
        transparent
        animationType='none'
        onRequestClose={() => closeAddModal()}
        statusBarTranslucent
      >
        <View style={styles.modalRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => closeAddModal()}>
            <Animated.View
              pointerEvents='none'
              style={[
                styles.backdrop,
                {
                  opacity: backdropOpacity,
                },
              ]}
            />
          </Pressable>

          <View pointerEvents='box-none' style={styles.sheetHost}>
            <Animated.View style={{ transform: [{ translateY: sheetTranslateY }] }}>
              <Pressable onPress={() => {}} style={styles.sheet}>
                <Text style={styles.title}>What do you wanna add?</Text>

                <View style={styles.optionsRow}>
                  <TouchableOpacity
                    style={[styles.optionCard, styles.lectureCard]}
                    activeOpacity={0.85}
                    onPress={() => navigateFromAddModal('/add-lecture')}
                  >
                    <CalendarPlus size={57} color={Colors.text} strokeWidth={1} />
                    <Text style={styles.optionText}>Add lecture</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.optionCard, styles.taskCard]}
                    activeOpacity={0.85}
                    onPress={() => navigateFromAddModal('/(tabs)/tasks')}
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
    </>
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
