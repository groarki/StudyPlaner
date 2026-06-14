import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Camera, ChevronRight } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';
import { useAuthStore, useLecturesStore, useProfileStore, useTasksStore } from '../../../store';
import { BorderRadius, Colors, FontSize, Spacing } from '../../../constants/theme';
import ScreenWrapper from '../../../components/screen-wrapper';

const ALERT_OPTIONS = [5, 10, 15, 30, 60];

export default function ProfileScreen() {
  const { logout } = useAuthStore();
  const { setTasks } = useTasksStore();
  const { setLectures } = useLecturesStore();
  const {
    name,
    avatarUrl,
    notificationSettings,
    setName,
    setAvatarUrl,
    updateNotificationSettings,
  } = useProfileStore();

  const [isNotificationSettingsVisible, setIsNotificationSettingsVisible] = useState(false);
  const displayName = useMemo(() => name.trim() || 'Student', [name]);

  useEffect(() => {
    let isMounted = true;

    const hydrateProfile = async () => {
      const { data } = await supabase.auth.getUser();
      const userName = data.user?.user_metadata?.name;
      const userAvatarUrl = data.user?.user_metadata?.avatarUrl;

      if (!isMounted) return;

      if (typeof userName === 'string' && userName.trim()) {
        setName(userName.trim());
      }

      if (typeof userAvatarUrl === 'string' && userAvatarUrl.trim()) {
        setAvatarUrl(userAvatarUrl.trim());
      }
    };

    hydrateProfile();

    return () => {
      isMounted = false;
    };
  }, [setAvatarUrl, setName]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setTasks([]);
    setLectures([]);
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <ScreenWrapper>
      <View style={styles.profileHeader}>
        <TouchableOpacity
          style={styles.avatarButton}
          activeOpacity={0.85}
          onPress={() => router.push('/(tabs)/profile/account-settings')}
        >
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Camera size={18} color={Colors.text} strokeWidth={1.7} />
          )}
        </TouchableOpacity>
        <Text style={styles.name}>{displayName}</Text>
      </View>

        <View style={styles.section}>
          <View style={styles.settingsList}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => router.push('/(tabs)/profile/helpful-links')}
            >
              <Text style={styles.settingText}>Helpful links</Text>
              <ChevronRight size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.sectionLine} />
          <View style={styles.settingsList}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => router.push('/(tabs)/profile/account-settings')}
            >
              <Text style={styles.settingText}>Account settings</Text>
              <ChevronRight size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setIsNotificationSettingsVisible(true)}
            >
              <Text style={styles.settingText}>Notifications</Text>
              <ChevronRight size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingRow} onPress={handleLogout}>
              <Text style={styles.settingText}>Log out</Text>
              <ChevronRight size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.deleteText}>Delete account</Text>
              <ChevronRight size={18} color={Colors.error} />
            </TouchableOpacity>
          </View>
        </View>

      <Modal
        visible={isNotificationSettingsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsNotificationSettingsVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setIsNotificationSettingsVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Notifications</Text>
            <Text style={styles.modalHint}>
              test modal does not save
            </Text>

            <View style={styles.toggleRow}>
              <Text style={styles.toggleText}>Enable reminders</Text>
              <Switch
                value={notificationSettings.remindersEnabled}
                onValueChange={(value) => updateNotificationSettings({ remindersEnabled: value })}
                trackColor={{ false: '#D6D6D6', true: Colors.primary }}
                thumbColor={Colors.background}
              />
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.toggleText}>Lecture reminders</Text>
              <Switch
                value={notificationSettings.lectureRemindersEnabled}
                onValueChange={(value) => updateNotificationSettings({ lectureRemindersEnabled: value })}
                trackColor={{ false: '#D6D6D6', true: Colors.primary }}
                thumbColor={Colors.background}
              />
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.toggleText}>Task reminders</Text>
              <Switch
                value={notificationSettings.taskRemindersEnabled}
                onValueChange={(value) => updateNotificationSettings({ taskRemindersEnabled: value })}
                trackColor={{ false: '#D6D6D6', true: Colors.primary }}
                thumbColor={Colors.background}
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              activeOpacity={0.85}
              onPress={() => setIsNotificationSettingsVisible(false)}
            >
              <Text style={styles.saveButtonText}>Done</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
    marginTop: 20,
  },
  avatarButton: {
    width: 78,
    height: 78,
    borderRadius: 50,
    backgroundColor: '#D9D9D9',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  name: {
    flex: 1,
    fontSize: FontSize.xl,
    color: Colors.text,
    fontWeight: '600',
  },
  content: {
    paddingBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  sectionLine: {
    height: 1,
    backgroundColor: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  settingsList: {
    gap: Spacing.sm,
  },
  settingRow: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 11,
    borderColor: Colors.textSecondary,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  settingText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  deleteText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.error,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  modalHint: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  saveButton: {
    minHeight: 42,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  saveButtonText: {
    color: Colors.background,
    fontSize: FontSize.md,
    fontWeight: '500',
  },
  toggleRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  toggleText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  optionLabel: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '500',
    marginTop: Spacing.xs,
  },
  alertOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  alertOption: {
    minHeight: 36,
    minWidth: 48,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  alertOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  alertOptionText: {
    fontSize: FontSize.sm,
    color: Colors.text,
    fontWeight: '500',
  },
  alertOptionTextSelected: {
    color: Colors.background,
  },
});
