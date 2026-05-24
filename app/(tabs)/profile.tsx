import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {useAuthStore} from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';

export default function ProfileTab() {
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    router.replace('/(auth)/login');
  }
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profile</Text>
      <TouchableOpacity onPress={handleLogout}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 22,
    fontWeight: '600',
  },
});
