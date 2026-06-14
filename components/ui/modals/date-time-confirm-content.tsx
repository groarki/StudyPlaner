import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { BorderRadius, Colors, FontSize, Spacing } from '../../../constants/theme';
import {
  formatDate,
  formatTime,
  openAndroidDateTimePicker,
  type AndroidDateTimePickerMode,
  type DateTimePickerMode,
} from '../../../utils';

type Props = {
  value: Date;
  mode: DateTimePickerMode;
  onChange: (next: Date) => void;
  onConfirm: () => void;
};

export default function DateTimeConfirmContent({ value, mode, onChange, onConfirm }: Props) {
  const handleChange = (_: DateTimePickerEvent, date?: Date) => {
    if (date) onChange(date);
  };

  const openAndroidPicker = (pickerMode: AndroidDateTimePickerMode) => {
    openAndroidDateTimePicker({
      value,
      mode,
      pickerMode,
      onChange,
    });
  };

  if (Platform.OS === 'android') {
    return (
      <>
        {(mode === 'date' || mode === 'datetime') && (
          <TouchableOpacity style={styles.valueButton} onPress={() => openAndroidPicker('date')}>
            <Text style={styles.valueLabel}>Date</Text>
            <Text style={styles.valueText}>{formatDate(value)}</Text>
          </TouchableOpacity>
        )}

        {(mode === 'time' || mode === 'datetime') && (
          <TouchableOpacity style={styles.valueButton} onPress={() => openAndroidPicker('time')}>
            <Text style={styles.valueLabel}>Time</Text>
            <Text style={styles.valueText}>{formatTime(value)}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
      </>
    );
  }

  return (
    <>
      <DateTimePicker
        value={value}
        mode={mode}
        display="spinner"
        onChange={handleChange}
        textColor={Colors.text}
        accentColor={Colors.primary}
        themeVariant="light"
        style={styles.timePicker}
      />
      <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  timePicker: {
    alignSelf: 'stretch',
    height: 216,
  },
  valueButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueLabel: {
    color: Colors.text,
    fontSize: FontSize.md,
  },
  valueText: {
    color: Colors.primary,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  confirmButton: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: Colors.background,
    fontWeight: '600',
    fontSize: FontSize.md,
  },
});
