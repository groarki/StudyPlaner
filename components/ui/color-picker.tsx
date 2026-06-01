import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Check } from 'lucide-react-native';
import { BorderRadius, Colors, FontSize, Spacing } from '../../constants/theme';

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
  withContainer?: boolean;
  label?: string;
}

function Palette({ selectedColor, onSelectColor }: Pick<Props, 'selectedColor' | 'onSelectColor'>) {
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

export default function ColorPicker({
  selectedColor,
  onSelectColor,
  withContainer = true,
  label = 'Color',
}: Props) {
  if (!withContainer) {
    return <Palette selectedColor={selectedColor} onSelectColor={onSelectColor} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Palette selectedColor={selectedColor} onSelectColor={onSelectColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  label: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
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
