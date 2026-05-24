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
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../../lib/supabase';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';

type RegisterField = 'name' | 'email' | 'password';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formScrollRef = useRef<ScrollView>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const fieldOffsetsRef = useRef<Record<RegisterField, number>>({
    name: 0,
    email: 0,
    password: 0,
  });

  const scrollToField = (field: RegisterField) => {
    const y = fieldOffsetsRef.current[field];
    formScrollRef.current?.scrollTo({
      y: Math.max(0, y - Spacing.lg),
      animated: true,
    });
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    setIsLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.replace('/(tabs)');
  };

  return (
    <>
      <StatusBar style="light" />
      <View style={styles.container}>
        <KeyboardAvoidingView
          style={styles.formWrapper}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={20}
        >
          <ScrollView
            ref={formScrollRef}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
            showsVerticalScrollIndicator={false}
            bounces={false}
            overScrollMode="never"
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          >
        <View style={styles.registerCont}>
          <Image source={require('../../assets/app-logo.png')} style={styles.logo} />
          <Text style={styles.heading}>Sign up</Text>
        </View>

            <View style={styles.form}>
              {error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <View
                style={styles.inputContainer}
                onLayout={({ nativeEvent }) => {
                  fieldOffsetsRef.current.name = nativeEvent.layout.y;
                }}
              >
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ex: John Doe"
                  placeholderTextColor={Colors.textSecondary}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onFocus={() => scrollToField('name')}
                  onSubmitEditing={() => emailInputRef.current?.focus()}
                />
              </View>

              <View
                style={styles.inputContainer}
                onLayout={({ nativeEvent }) => {
                  fieldOffsetsRef.current.email = nativeEvent.layout.y;
                }}
              >
                <Text style={styles.label}>Email</Text>
                <TextInput
                  ref={emailInputRef}
                  style={styles.input}
                  placeholder="mymail@gmail.com"
                  placeholderTextColor={Colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
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
                  onSubmitEditing={handleRegister}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.background} />
                ) : (
                  <Text style={styles.buttonText}>Register</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.linkText}>
                  Already have an account? <Text style={styles.link}>Login</Text>
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
  registerCont: {
    alignItems: 'center',
    marginTop: 115,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  logo: {
    width: 200,
    height: 140,
  },
  heading: {
    fontSize: FontSize.xxl,
    fontWeight: 'bold',
    color: Colors.background,
  },
  formWrapper: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 0,
  },
  form: {
    width: '100%',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  errorBox: {
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
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
