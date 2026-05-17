import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Colors } from '../constants/theme';

export default function GreetingScreen() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/(tabs)');
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
          <Image source={require('../assets/app-logo.png')} style={styles.logo} />
          <Text style={styles.welcomeText}>StudyPlaner</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.buttonText}>I don't have an account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.buttonText}>I have an account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    gap: 16,
    marginTop: 100,
  },
  logo: {
    width: 200,
    height: 140,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.White,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
