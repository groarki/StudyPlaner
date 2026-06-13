import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, ChevronDown } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { mapLectureFromDb } from '../../lib/db-mappers';
import { Colors, FontSize, Spacing, BorderRadius, SCREEN_PADDING } from '../../constants/theme';
import { DAYS, ALERT_OPTIONS } from '../../constants/options';
import ColorPicker from '../ui/color-picker';
import BottomSheetModal from '../ui/bottom-sheet-modal';
import DayPickerContent from '../ui/modal-contents/day-picker-content';
import AlertOptionsContent from '../ui/modal-contents/alert-options-content';
import DateTimeConfirmContent from '../ui/modal-contents/date-time-confirm-content';
import { formatTime } from '../../utils';
import { Lecture, LectureDbRow } from '../../types';
import { useLecturesStore } from '../../store';

type ActiveModal = 'none' | 'day' | 'alert' | 'start' | 'end';

function parseTimeToDate(time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const parsed = new Date();
  parsed.setHours(hours || 0, minutes || 0, 0, 0);
  return parsed;
}

export default function AddLectureForm() {
  const params = useLocalSearchParams<{ lectureId?: string | string[] }>();
  const lectureId = Array.isArray(params.lectureId) ? params.lectureId[0] : params.lectureId;
  const isEditMode = !!lectureId;
  const { lectures, updateLecture } = useLecturesStore();

  const [title, setTitle] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [tempTime, setTempTime] = useState<Date>(new Date());
  const [color, setColor] = useState(Colors.Blue);
  const [notes, setNotes] = useState('');
  const [alertMinutes, setAlertMinutes] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrating, setIsHydrating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ActiveModal>('none');

  const applyLectureToForm = useCallback((lecture: Lecture) => {
    setTitle(lecture.title);
    setDayOfWeek(lecture.dayOfWeek);
    setStartTime(parseTimeToDate(lecture.startTime));
    setEndTime(parseTimeToDate(lecture.endTime));
    setColor(lecture.color ?? Colors.Blue);
    setNotes(lecture.notes ?? '');
    setAlertMinutes(lecture.alertMinutes ?? null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const hydrateLecture = async () => {
      if (!lectureId) {
        return;
      }

      const lectureFromStore = lectures.find((lecture) => lecture.id === lectureId);
      if (lectureFromStore) {
        applyLectureToForm(lectureFromStore);
        return;
      }

      setIsHydrating(true);
      try {
        const { data, error: lectureError } = await supabase
          .from('lectures')
          .select('*')
          .eq('id', lectureId)
          .maybeSingle();

        if (cancelled) return;
        if (lectureError || !data) {
          setError('Lecture not found');
          return;
        }

        applyLectureToForm(mapLectureFromDb(data as LectureDbRow));
      } finally {
        if (!cancelled) {
          setIsHydrating(false);
        }
      }
    };

    hydrateLecture();

    return () => {
      cancelled = true;
    };
  }, [lectureId, lectures, applyLectureToForm]);

  const handleSave = async () => {
    if (!title.trim()) { setError('Please enter a title'); return; }
    if (!startTime || !endTime) { setError('Please select start and end time'); return; }

    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not found');
        return;
      }

      const payload = {
        title: title.trim(),
        day_of_week: dayOfWeek,
        start_time: formatTime(startTime),
        end_time: formatTime(endTime),
        color,
        notes: notes.trim() || null,
        alert_minutes: alertMinutes,
      };

      if (isEditMode && lectureId) {
        const { error: updateError } = await supabase
          .from('lectures')
          .update(payload)
          .eq('id', lectureId)
          .eq('user_id', user.id);

        if (updateError) {
          setError(updateError.message);
          return;
        }

        updateLecture(lectureId, {
          title: payload.title,
          dayOfWeek: payload.day_of_week,
          startTime: payload.start_time,
          endTime: payload.end_time,
          color: payload.color,
          notes: payload.notes ?? undefined,
          alertMinutes: payload.alert_minutes ?? undefined,
        });
      } else {
        const { error: insertError } = await supabase.from('lectures').insert({
          user_id: user.id,
          ...payload,
        });

        if (insertError) {
          setError(insertError.message);
          return;
        }
      }

      router.back();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save lecture');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedDayLabel = DAYS.find((d) => d.value === dayOfWeek)?.label ?? DAYS[0].label;
  const selectedAlertLabel =
    ALERT_OPTIONS.find((o) => o.value === alertMinutes)?.label ?? ALERT_OPTIONS[0].label;
  const modeText = isEditMode
    ? { screenTitle: 'Edit lecture', saveButtonTitle: 'Save changes' }
    : { screenTitle: 'Add lecture', saveButtonTitle: 'Add to calendar' };
  const isFormValid = Boolean(title.trim() && startTime && endTime);
  const isSaveDisabled = !isFormValid || isLoading || isHydrating;
  const isTimeModalVisible = activeModal === 'start' || activeModal === 'end';
  const timeModalTitle = activeModal === 'end' ? 'End time' : 'Start time';

  const closeModal = () => setActiveModal('none');

  const openStartModal = () => {
    setTempTime(startTime ?? new Date());
    setActiveModal('start');
  };

  const openEndModal = () => {
    setTempTime(endTime ?? new Date());
    setActiveModal('end');
  };

  const handleConfirmTime = () => {
    if (activeModal === 'start') {
      setStartTime(tempTime);
    } else if (activeModal === 'end') {
      setEndTime(tempTime);
    }
    closeModal();
  };

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
          onPress={() => setActiveModal('day')}
        >
          <Text style={styles.selectText}>{selectedDayLabel}</Text>
          <ChevronDown size={18} color={Colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.timeButton, startTime && styles.timeButtonFilled]}
            onPress={openStartModal}
          >
            <Text style={styles.timeLabel}>Start time</Text>
            {startTime && (
              <Text style={styles.timeValue}>{formatTime(startTime)}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.timeButton, endTime && styles.timeButtonFilled]}
            onPress={openEndModal}
          >
            <Text style={styles.timeLabel}>End time</Text>
            {endTime && (
              <Text style={styles.timeValue}>{formatTime(endTime)}</Text>
            )}
          </TouchableOpacity>
        </View>

        <ColorPicker selectedColor={color} onSelectColor={setColor} />

        <TextInput
          style={styles.notesInput}
          placeholder="Notes"
          placeholderTextColor={Colors.textSecondary}
          value={notes}
          onChangeText={setNotes}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setActiveModal('alert')}
        >
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
        visible={activeModal === 'day'}
        title="Select day"
        onClose={closeModal}
      >
        <DayPickerContent
          options={DAYS}
          selectedValue={dayOfWeek}
          onValueChange={setDayOfWeek}
          onConfirm={closeModal}
        />
      </BottomSheetModal>

      <BottomSheetModal
        visible={activeModal === 'alert'}
        title="Alert"
        onClose={closeModal}
      >
        <AlertOptionsContent
          options={ALERT_OPTIONS}
          selectedValue={alertMinutes}
          onSelect={(value) => {
            setAlertMinutes(value);
            closeModal();
          }}
        />
      </BottomSheetModal>

      <BottomSheetModal
        visible={isTimeModalVisible}
        title={timeModalTitle}
        onClose={closeModal}
      >
        <DateTimeConfirmContent value={tempTime} mode="time" onChange={setTempTime} onConfirm={handleConfirmTime} />
      </BottomSheetModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: Spacing.xl,
  },
  backButton: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
    alignSelf: 'flex-start',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  screenTitle: {
    fontSize: FontSize.xxl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  errorBox: {
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: Colors.background,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
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
  selectText: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
  selectRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  selectValue: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  timeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
  },
  timeButtonFilled: {
    borderColor: Colors.primary,
  },
  timeLabel: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
  timeValue: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: '600',
  },
  label: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
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
  saveButtonEnabled: {
    backgroundColor: Colors.primary,
    opacity: 1,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: Colors.background,
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
});
