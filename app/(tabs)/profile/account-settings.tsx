import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Camera, ChevronLeft } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';
import { useAuthStore, useProfileStore } from '../../../store';
import ScreenWrapper from '../../../components/screen-wrapper';
import { BorderRadius, Colors, FontSize, Spacing } from '../../../constants/theme';
import { getInitials } from '../../../utils';
import {
  deleteAvatarFromStorageUrl,
  getAvatarUploadErrorMessage,
  isLocalFileUri,
  uploadAvatarToStorage,
} from '../../../utils/upload-avatar';

export default function AccountSettingsScreen() {
  const { user, setUser } = useAuthStore();
  const { name, avatarUrl, setName, setAvatarUrl } = useProfileStore();
  const [email, setEmail] = useState(user?.email ?? '');
  const [draftName, setDraftName] = useState(name);
  const [draftAvatarUrl, setDraftAvatarUrl] = useState<string | null>(avatarUrl);
  const [isSaving, setIsSaving] = useState(false);

  const initials = getInitials(draftName);

  useEffect(() => {
    let isMounted = true;

    const hydrateAccount = async () => {
      const { data } = await supabase.auth.getUser();
      const authUser = data.user;

      if (!isMounted || !authUser) return;

      const metadataName = authUser.user_metadata?.name;
      const metadataAvatarUrl = authUser.user_metadata?.avatarUrl;
      const nextName = typeof metadataName === 'string' && metadataName.trim()
        ? metadataName.trim()
        : '';
      const nextAvatarUrl = typeof metadataAvatarUrl === 'string' && metadataAvatarUrl.trim()
        ? metadataAvatarUrl.trim()
        : null;

      setEmail(authUser.email ?? '');
      if (nextName) {
        setDraftName(nextName);
        setName(nextName);
      }

      if (nextAvatarUrl) {
        setDraftAvatarUrl(nextAvatarUrl);
        setAvatarUrl(nextAvatarUrl);
      }

      setUser({
        id: authUser.id,
        email: authUser.email ?? '',
        name: nextName,
        avatarUrl: nextAvatarUrl ?? undefined,
      });
    };

    hydrateAccount();

    return () => {
      isMounted = false;
    };
  }, [setAvatarUrl, setName, setUser]);

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo access to choose an avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      mediaTypes: ['images'],
    });

    if (result.canceled) return;

    const nextUri = result.assets[0]?.uri;
    if (nextUri) {
      setDraftAvatarUrl(nextUri);
    }
  };

  const saveAccount = async () => {
    const nextName = draftName.trim();

    if (!nextName) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }

    setIsSaving(true);

    try {
      const {
        data: { user: authUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !authUser) {
        Alert.alert('Unable to save account', userError?.message ?? 'User not found.');
        return;
      }

      const nextAvatarUrl = isLocalFileUri(draftAvatarUrl)
        ? await uploadAvatarToStorage(authUser.id, draftAvatarUrl)
        : draftAvatarUrl;

      const { data, error } = await supabase.auth.updateUser({
        data: {
          name: nextName,
          avatarUrl: nextAvatarUrl,
        },
      });

      if (error) {
        Alert.alert('Unable to save account', error.message);
        return;
      }

      setName(nextName);
      setAvatarUrl(nextAvatarUrl);
      setDraftAvatarUrl(nextAvatarUrl);
      setUser({
        id: data.user.id,
        email: data.user.email ?? email,
        name: nextName,
        avatarUrl: nextAvatarUrl ?? undefined,
      });

      if (avatarUrl && avatarUrl !== nextAvatarUrl && !isLocalFileUri(avatarUrl)) {
        await deleteAvatarFromStorageUrl(avatarUrl);
      }

      router.back();
    } catch (saveError) {
      Alert.alert(
        'Unable to save account',
        getAvatarUploadErrorMessage(saveError)
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardHost}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <TouchableOpacity style={styles.avatarButton} activeOpacity={0.85} onPress={pickAvatar}>
            {draftAvatarUrl ? (
              <Image source={{ uri: draftAvatarUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.initials}>{initials}</Text>
            )}
            <View style={styles.cameraBadge}>
              <Camera size={16} color={Colors.background} />
            </View>
          </TouchableOpacity>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={draftName}
                onChangeText={setDraftName}
                placeholder="Your name"
                placeholderTextColor={Colors.textSecondary}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={email}
                editable={false}
                placeholder="Email"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            activeOpacity={0.85}
            onPress={saveAccount}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color={Colors.background} />
            ) : (
              <Text style={styles.saveButtonText}>Save changes</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Spacing.md,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    color: Colors.text,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  keyboardHost: {
    flex: 1,
  },
  content: {
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  avatarButton: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#D9D9D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.lg,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 56,
  },
  initials: {
    fontSize: FontSize.xxl,
    color: Colors.text,
    fontWeight: '700',
  },
  cameraBadge: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  form: {
    width: '100%',
    gap: Spacing.md,
  },
  inputGroup: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '600',
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    color: Colors.text,
    fontSize: FontSize.md,
    backgroundColor: Colors.background,
  },
  disabledInput: {
    color: Colors.textSecondary,
    backgroundColor: '#F5F5F5',
  },
  saveButton: {
    width: '100%',
    minHeight: 46,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: Colors.background,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
});
