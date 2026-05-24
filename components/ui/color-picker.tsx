import { View, TouchableOpacity, StyleSheet, Modal, Text } from 'react-native';
import { Check } from 'lucide-react-native';
import { Colors, BorderRadius, Spacing, FontSize, SCREEN_PADDING } from '../../constants/theme';

const PALETTE = [
  '#F5F0C8', // жовтий
  '#C8DCE8', // блакитний
  '#E8C8C8', // рожевий
  '#C8E8D4', // зелений
  '#E8D4C8', // персиковий
  '#D4C8E8', // лавандовий
];

interface Props {
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

export default function ColorPicker({ selectedColor, onSelectColor }: Props) {
  return (
    <View style={styles.palette}>
      {PALETTE.map((c) => (
        <TouchableOpacity
          key={c}
          style={[styles.dot, { backgroundColor: c }]}
          onPress={() => onSelectColor(c)}
        >
          {selectedColor === c && (
            <Check size={14} color={Colors.text} strokeWidth={3} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  palette: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});