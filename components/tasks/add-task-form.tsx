import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronDown, ChevronLeft } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '../../lib/supabase';
import { mapTaskFromDb } from '../../lib/db-mappers';
import { useTasksStore } from '../../store';
import { Task, TaskDbRow } from '../../types';
import { ALERT_OPTIONS } from '../../constants/options';
import { BorderRadius, Colors, FontSize, SCREEN_PADDING, Spacing } from '../../constants/theme';
import ColorPicker from '../ui/color-picker';
import BottomSheetModal from '../ui/modals/bottom-sheet-modal';
import AlertOptionsContent from '../ui/modals/alert-options-content';
import FilesPickerContent from '../ui/modals/files-picker-content';
import DateTimeConfirmContent from '../ui/modals/date-time-confirm-content';
import { formatDate, formatDateForCalendar, formatTime } from '../../utils';
import { offlineError } from '../../utils/network';
import { saveFileToAppStorage } from '../../utils/save-task-file';

type ActiveModal = 'none' | 'dueTime' | 'alert' | 'files';
type TaskAttachment = {
  uri: string;
  name: string;
  isImage: boolean;
};

function parseDueDateTime(dueDate: string, dueTime: string): Date {
  const [year, month, day] = dueDate.split('-').map(Number);
  const [hours, minutes] = dueTime.split(':').map(Number);
  const date = new Date();
  date.setFullYear(year || date.getFullYear(), (month || 1) - 1, day || 1);
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date;
}

export default function AddTaskForm() {
  const params = useLocalSearchParams<{ taskId?: string | string[] }>();
  const taskId = Array.isArray(params.taskId) ? params.taskId[0] : params.taskId;
  const isEditMode = !!taskId;
  const { tasks, addTask, updateTask } = useTasksStore();

  const [title, setTitle] = useState('');
  const [dueAt, setDueAt] = useState(new Date());
  const [tempDueAt, setTempDueAt] = useState(new Date());
  const [color, setColor] = useState(Colors.Yellow);
  const [notes, setNotes] = useState('');
  const [alertMinutes, setAlertMinutes] = useState<number | null>(null);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrating, setIsHydrating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ActiveModal>('none');

  const applyTaskToForm = useCallback((task: Task) => {
    setTitle(task.title);
    setDueAt(parseDueDateTime(task.dueDate, task.dueTime));
    setColor(task.color ?? Colors.Yellow);
    setNotes(task.notes ?? '');
    setAlertMinutes(task.alertMinutes ?? null);
    const mapped = (task.fileUrls ?? []).map((uri, index) => {
      const name = uri.split('/').pop() || `File ${index + 1}`;
      return {
        uri,
        name,
        isImage: /\.(jpg|jpeg|png|webp|heic|gif)$/i.test(name.toLowerCase()),
      };
    });
    setAttachments(mapped);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const hydrateTask = async () => {
      if (!taskId) return;

      const taskFromStore = tasks.find((item) => item.id === taskId);
      if (taskFromStore) {
        applyTaskToForm(taskFromStore);
        return;
      }

      setIsHydrating(true);
      try {
        const { data, error: taskError } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', taskId)
          .maybeSingle();

        if (cancelled) return;
        if (taskError || !data) {
          setError('Task not found');
          return;
        }

        applyTaskToForm(mapTaskFromDb(data as TaskDbRow));
      } finally {
        if (!cancelled) setIsHydrating(false);
      }
    };

    hydrateTask();
    return () => {
      cancelled = true;
    };
  }, [taskId, tasks, applyTaskToForm]);

  const selectedAlertLabel =
    ALERT_OPTIONS.find((o) => o.value === alertMinutes)?.label ?? ALERT_OPTIONS[0].label;

  const modeText = isEditMode
    ? { screenTitle: 'Edit task', saveButtonTitle: 'Save changes' }
    : { screenTitle: 'Add task', saveButtonTitle: 'Add to calendar' };

  const dueLabel = formatDate(dueAt);

  const closeModal = () => setActiveModal('none');

  const pickFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Brak uprawnien', 'Potrzebujemy dostepu do galerii');
        setError('Access to photos was denied. Please allow permission in settings.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) return;
      const saved = await Promise.all(
        result.assets
          .filter((asset) => Boolean(asset.uri))
          .map(async (asset, index) => {
            const savedUri = await saveFileToAppStorage(asset.uri);
            const filename = savedUri.split('/').pop() || `Photo ${index + 1}`;
            return { uri: savedUri, name: filename, isImage: true };
          }),
      );
      setAttachments((prev) => [...prev, ...saved]);
      closeModal();
    } catch {
      Alert.alert('Blad', 'Nie udalo sie otworzyc galerii');
      setError('Could not open photo library. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Brak uprawnien', 'Potrzebujemy dostepu do kamery');
        setError('Access to camera was denied. Please allow permission in settings.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]?.uri) return;
      const savedUri = await saveFileToAppStorage(result.assets[0].uri);
      const filename = savedUri.split('/').pop() || `Photo ${Date.now()}`;
      setAttachments((prev) => [...prev, { uri: savedUri, name: filename, isImage: true }]);
      closeModal();
    } catch {
      Alert.alert('Blad', 'Nie udalo sie otworzyc aparatu');
      setError('Could not open camera. Please try again.');
    }
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (result.canceled || !result.assets?.length) return;
      const saved = await Promise.all(
        result.assets
          .filter((asset) => Boolean(asset.uri))
          .map(async (asset, index) => {
            const savedUri = await saveFileToAppStorage(asset.uri);
            const filename = asset.name || savedUri.split('/').pop() || `File ${index + 1}`;
            return {
              uri: savedUri,
              name: filename,
              isImage: /\.(jpg|jpeg|png|webp|heic|gif)$/i.test(filename.toLowerCase()),
            };
          }),
      );
      setAttachments((prev) => [...prev, ...saved]);
      closeModal();
    } catch {
      Alert.alert('Blad', 'Nie udalo sie otworzyc wyboru pliku');
      setError('Could not open file picker. Please try again.');
    }
  };

  const removeFile = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (!(await offlineError(setError))) return;

    setIsLoading(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError('User not found');
        return;
      }

      const payload = {
        title: title.trim(),
        due_date: formatDateForCalendar(dueAt),
        due_time: formatTime(dueAt),
        color,
        notes: notes.trim() || null,
        alert_minutes: alertMinutes,
        file_urls: attachments.length ? attachments.map((item) => item.uri) : null,
      };

      if (isEditMode && taskId) {
        const { error: updateError } = await supabase
          .from('tasks')
          .update(payload)
          .eq('id', taskId)
          .eq('user_id', user.id);

        if (updateError) {
          setError(updateError.message);
          return;
        }

        updateTask(taskId, {
          title: payload.title,
          dueDate: payload.due_date,
          dueTime: payload.due_time,
          color: payload.color,
          notes: payload.notes ?? undefined,
          alertMinutes: payload.alert_minutes ?? undefined,
          fileUrls: payload.file_urls ?? undefined,
        });
      } else {
        const { data, error: insertError } = await supabase
          .from('tasks')
          .insert({
            user_id: user.id,
            is_completed: false,
            ...payload,
          })
          .select('*')
          .single();

        if (insertError) {
          setError(insertError.message);
          return;
        }

        addTask(mapTaskFromDb(data as TaskDbRow));
      }

      router.back();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save task');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = Boolean(title.trim());
  const isSaveDisabled = !isFormValid || isLoading || isHydrating;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.titleRow}>
          <Text style={styles.screenTitle}>{modeText.screenTitle}</Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder="Title"
          placeholderTextColor={Colors.textSecondary}
          value={title}
          onChangeText={setTitle}
        />

        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => {
            setTempDueAt(dueAt);
            setActiveModal('dueTime');
          }}
        >
          <Text style={styles.label}>Due time</Text>
          <View style={styles.selectRight}>
            <Text style={styles.selectValue}>{dueLabel}</Text>
            <Text style={styles.timeBadge}>{formatTime(dueAt)}</Text>
          </View>
        </TouchableOpacity>

        <ColorPicker selectedColor={color} onSelectColor={setColor} />

        <TouchableOpacity style={styles.selectButton} onPress={() => setActiveModal('files')}>
          <Text style={styles.selectText}>Add files...</Text>
        </TouchableOpacity>

        {attachments.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.attachmentsWrap}
            contentContainerStyle={styles.attachmentsRow}
          >
            {attachments.map((item, index) => (
              <View key={`${item.uri}-${index}`} style={styles.attachmentCard}>
                {item.isImage ? (
                  <Image source={{ uri: item.uri }} style={styles.previewImage} />
                ) : (
                  <View style={styles.filePreview}>
                    <Text style={styles.fileBadge}>FILE</Text>
                  </View>
                )}
                <Text numberOfLines={1} style={styles.fileName}>
                  {item.name}
                </Text>
                <TouchableOpacity onPress={() => removeFile(index)}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        <TextInput
          style={styles.notesInput}
          placeholder="Notes"
          placeholderTextColor={Colors.textSecondary}
          value={notes}
          onChangeText={setNotes}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.selectButton} onPress={() => setActiveModal('alert')}>
          <Text style={styles.label}>Alert</Text>
          <View style={styles.selectRight}>
            <Text style={styles.selectValue}>{selectedAlertLabel}</Text>
            <ChevronDown size={18} color={Colors.textSecondary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.saveButton,
            isFormValid ? styles.saveButtonEnabled : styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={isSaveDisabled}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.background} />
          ) : (
            <Text style={styles.saveButtonText}>{modeText.saveButtonTitle}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <BottomSheetModal
        visible={activeModal === 'files'}
        title="Add files"
        onClose={closeModal}
        contentStyle={styles.filesModalSheet}
      >
        <FilesPickerContent onPickPhoto={pickFromGallery} onTakePhoto={takePhoto} onPickFile={pickFile} />
      </BottomSheetModal>

      <BottomSheetModal visible={activeModal === 'alert'} title="Alert" onClose={closeModal}>
        <AlertOptionsContent
          options={ALERT_OPTIONS}
          selectedValue={alertMinutes}
          onSelect={(value) => {
            setAlertMinutes(value);
            closeModal();
          }}
        />
      </BottomSheetModal>

      <BottomSheetModal visible={activeModal === 'dueTime'} title="Due time" onClose={closeModal}>
        <DateTimeConfirmContent
          value={tempDueAt}
          mode="datetime"
          onChange={setTempDueAt}
          onConfirm={() => {
            setDueAt(tempDueAt);
            closeModal();
          }}
        />
      </BottomSheetModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: SCREEN_PADDING, paddingBottom: Spacing.xl },
  backButton: { paddingTop: Spacing.sm, paddingBottom: Spacing.lg, alignSelf: 'flex-start' },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  screenTitle: { fontSize: FontSize.xxl, fontWeight: 'bold', color: Colors.text },
  errorBox: {
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorText: { color: Colors.background, fontSize: FontSize.sm, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: FontSize.md,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    marginBottom: Spacing.md,
  },
  selectText: { fontSize: FontSize.md, color: Colors.text },
  selectRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  selectValue: { fontSize: FontSize.md, color: Colors.textSecondary },
  timeBadge: {
    backgroundColor: '#F1F1F1',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    color: Colors.text,
    fontSize: FontSize.sm,
  },
  attachmentsWrap: {
    marginBottom: Spacing.md,
  },
  attachmentsRow: {
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  attachmentCard: {
    width: 126,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
    backgroundColor: Colors.background,
  },
  previewImage: {
    width: '100%',
    height: 80,
    borderRadius: BorderRadius.sm,
    marginBottom: 6,
  },
  filePreview: {
    width: '100%',
    height: 80,
    borderRadius: BorderRadius.sm,
    marginBottom: 6,
    backgroundColor: '#ECECEC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileBadge: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  fileName: {
    color: Colors.text,
    fontSize: FontSize.sm,
    marginBottom: 2,
  },
  removeText: {
    color: Colors.error,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  label: { fontSize: FontSize.md, color: Colors.text },
  notesInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    height: 100,
    marginBottom: Spacing.md,
  },
  saveButton: {
    backgroundColor: Colors.textSecondary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  saveButtonEnabled: { backgroundColor: Colors.primary, opacity: 1 },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { color: Colors.background, fontSize: FontSize.lg, fontWeight: '600' },
  filesModalSheet: {
    paddingBottom: 40,
  },
});
