import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

export type DateTimePickerMode = 'date' | 'time' | 'datetime';
export type AndroidDateTimePickerMode = 'date' | 'time';

export function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`;
}
//formatting for task due time display in btn before opening
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
}

export function formatDateForCalendar(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// picking new date and displaing it by changing month/day/year
export function mergeDatePart(current: Date, picked: Date): Date {
  const next = new Date(current);
  next.setFullYear(picked.getFullYear(), picked.getMonth(), picked.getDate());
  return next;
}

//new date by changing time from curr date 
export function mergeTimePart(current: Date, picked: Date): Date {
  const next = new Date(current);
  next.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
  return next;
}

type OpenAndroidDateTimePickerParams = {
  value: Date;
  mode: DateTimePickerMode;
  pickerMode: AndroidDateTimePickerMode;
  onChange: (next: Date) => void;
};

export function openAndroidDateTimePicker({
  value,
  mode,
  pickerMode,
  onChange,
}: OpenAndroidDateTimePickerParams): void {
  DateTimePickerAndroid.open({
    value,
    mode: pickerMode,
    display: pickerMode === 'date' ? 'calendar' : 'clock',
    is24Hour: true,
    onChange: (event, date) => {
      if (event.type === 'dismissed' || !date) {
        return;
      }

      if (mode === 'datetime' && pickerMode === 'date') {
        onChange(mergeDatePart(value, date));
        return;
      }

      if (mode === 'datetime' && pickerMode === 'time') {
        onChange(mergeTimePart(value, date));
        return;
      }

      onChange(date);
    },
  });
}
//date for tasks due date
export function formatDueDate(value: string): string {
  const [year, month, day] = value.split('-');

  if (year && month && day) {
    return `${day.padStart(2, '0')}.${month.padStart(2, '0')}`;
  }

  return value;
}
