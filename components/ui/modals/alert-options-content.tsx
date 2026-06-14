import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { BorderRadius, Colors, FontSize, Spacing } from '../../../constants/theme';

type AlertOption = {
  label: string;
  value: number | null;
};

type Props = {
  options: AlertOption[];
  selectedValue: number | null;
  onSelect: (value: number | null) => void;
};

export default function AlertOptionsContent({ options, selectedValue, onSelect }: Props) {
  return (
    <>
      {options.map((opt) => (
        <TouchableOpacity
          key={String(opt.value)}
          style={[styles.option, selectedValue === opt.value && styles.optionSelected]}
          onPress={() => onSelect(opt.value)}
        >
          <Text style={[styles.optionText, selectedValue === opt.value && styles.optionTextSelected]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  option: {
    paddingVertical: Spacing.sm + 2,
  },
  optionSelected: {
    backgroundColor: '#EEF4F3',
    borderRadius: BorderRadius.sm,
  },
  optionText: {
    fontSize: FontSize.md,
    color: Colors.text,
    textAlign: 'center',
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
