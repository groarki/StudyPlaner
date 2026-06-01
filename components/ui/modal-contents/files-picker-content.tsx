import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors, FontSize, Spacing } from '../../../constants/theme';

type Props = {
  onPickPhoto: () => void;
  onTakePhoto: () => void;
  onPickFile: () => void;
};

export default function FilesPickerContent({ onPickPhoto, onTakePhoto, onPickFile }: Props) {
  return (
    <>
      <TouchableOpacity style={styles.option} onPress={onPickPhoto}>
        <Text style={styles.optionText}>Choose photo</Text>
      </TouchableOpacity>
      <Text style={styles.divider} />
      <TouchableOpacity style={styles.option} onPress={onTakePhoto}>
        <Text style={styles.optionText}>Take photo</Text>
      </TouchableOpacity>
      <Text style={styles.divider} />
      <TouchableOpacity style={styles.option} onPress={onPickFile}>
        <Text style={styles.optionText}>Choose file</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  option: {
    paddingVertical: Spacing.sm,
  },
  optionText: {
    fontSize: FontSize.md,
    color: Colors.text,
    textAlign: 'center',
  },
  divider: {
    height: 0.5,
    backgroundColor: '#E2E2E2',
  },
});
