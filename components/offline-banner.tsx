import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, Spacing } from '../constants/theme';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export default function OfflineBanner() {
  const { top } = useSafeAreaInsets();
  const { isOffline } = useNetworkStatus();

  if (!isOffline) return null;

  return (
    <View pointerEvents="none" style={[styles.banner, { paddingTop: top + Spacing.xs }]}>
      <Text style={styles.text}>Offline mode. Showing saved data.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingBottom: Spacing.xs,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.error,
  },
  text: {
    color: Colors.background,
    fontSize: FontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
});
