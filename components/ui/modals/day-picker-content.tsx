import { Picker } from '@react-native-picker/picker';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, FontSize, Spacing } from '../../../constants/theme';

type DayOption = {
  label: string;
  value: number;
};

type Props = {
  options: DayOption[];
  selectedValue: number;
  onValueChange: (value: number) => void;
  onConfirm: () => void;
};

export default function DayPickerContent({ options, selectedValue, onValueChange, onConfirm }: Props) {
  return (
    <>
      <View style={styles.dayPickerWrapper}>
        <Picker selectedValue={selectedValue} onValueChange={onValueChange} style={styles.picker}>
          {options.map((d) => (
            <Picker.Item key={d.value} label={d.label} value={d.value} color={Colors.text} />
          ))}
        </Picker>
      </View>
      <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  dayPickerWrapper: {
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
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
