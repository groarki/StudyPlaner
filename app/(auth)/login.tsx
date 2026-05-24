import { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { StatusBar } from 'expo-status-bar';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formScrollRef = useRef<ScrollView>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const fieldOffsetsRef = useRef({ email: 0, password: 0 });

  const scrollToField = (field: 'email' | 'password') => {
    const y = fieldOffsetsRef.current[field];
    formScrollRef.current?.scrollTo({
      y: Math.max(0, y - Spacing.lg),
      animated: true,
    });
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <>
      <StatusBar style="light" />
      <View style={styles.container}>
        <KeyboardAvoidingView
          style={styles.formHost}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            ref={formScrollRef}
            keyboardShouldPersistTaps='handled'
            keyboardDismissMode='none'
            showsVerticalScrollIndicator={false}
            bounces={false}
            overScrollMode='never'
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/app-logo.png')} style={styles.logo} />
          <Text style={styles.title}>Sign in</Text>
        </View>

            {/* Form */}
            <View style={styles.form}>
              {error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
              <View
                style={styles.inputContainer}
                onLayout={({ nativeEvent }) => {
                  fieldOffsetsRef.current.email = nativeEvent.layout.y;
                }}
              >
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="mymail@gmail.com"
                  placeholderTextColor={Colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onFocus={() => scrollToField('email')}
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                />
              </View>
              <View
                style={styles.inputContainer}
                onLayout={({ nativeEvent }) => {
                  fieldOffsetsRef.current.password = nativeEvent.layout.y;
                }}
              >
                <Text style={styles.label}>Password</Text>
                <TextInput
                  ref={passwordInputRef}
                  style={styles.input}
                  placeholder="••••••••••"
                  placeholderTextColor={Colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  returnKeyType="done"
                  onFocus={() => scrollToField('password')}
                  onSubmitEditing={handleLogin}
                />
              </View>
              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.background} />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.linkText}>
                  Don't have an account?{' '}
                  <Text style={styles.link}>Register</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 115,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
   logo: {
    width: 200,
    height: 140,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: 'bold',
    color: Colors.background,
  },
  form: {
    width: '100%',
    gap: Spacing.md,
  },
  formHost: {
    width: '100%',
  },
  errorBox: {
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.sm,
    padding: Spacing.xs,
  },
  errorText: {
    color: Colors.background,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  inputContainer: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: FontSize.md,
    color: Colors.background,
    fontWeight: '500',
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  button: {
    backgroundColor: '#C17B7B',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.background,
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  linkText: {
    textAlign: 'center',
    color: Colors.background,
    fontSize: FontSize.md,
  },
  link: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});
