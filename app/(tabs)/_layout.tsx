import { useState } from 'react';
import { Tabs } from 'expo-router';
import {
  House,
  Calendar,
  CircleUser,
  CirclePlus,
  BookCheck,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticTab } from '../../components/ui/haptic-tab';
import AddOptionsModal from '../../components/ui/add-options-modal';
import { Colors } from '../../constants/theme';


export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

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
              setIsAddModalVisible(true);
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

      <AddOptionsModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
      />
    </>
  );
}
