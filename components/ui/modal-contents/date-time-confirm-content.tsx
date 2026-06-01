import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { BorderRadius, Colors, FontSize, Spacing } from '../../../constants/theme';

type Props = {
  value: Date;
  mode: 'date' | 'time' | 'datetime';
  onChange: (next: Date) => void;
  onConfirm: () => void;
};

export default function DateTimeConfirmContent({ value, mode, onChange, onConfirm }: Props) {
  const handleChange = (_: DateTimePickerEvent, date?: Date) => {
    if (date) onChange(date);
  };

  return (
    <>
      <DateTimePicker value={value} mode={mode} display="spinner" onChange={handleChange} style={styles.timePicker} />
      <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  timePicker: { alignSelf: 'stretch' },
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
