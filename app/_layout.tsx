import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ErrorBoundary from '../components/error-boundary';
import OfflineBanner from '../components/offline-banner';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <PaperProvider>
          <StatusBar style='auto'/>
          <OfflineBanner />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="add-lecture" />
            <Stack.Screen name="add-task" />
          </Stack>
        </PaperProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
