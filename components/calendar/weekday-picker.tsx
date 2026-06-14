import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { CalendarProvider, WeekCalendar, type DateData } from 'react-native-calendars';
import { Colors, FontSize, SCREEN_PADDING } from '../../constants/theme';
import { formatDateForCalendar } from '../../utils';

interface Props {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export default function WeekDayPicker({ selectedDate, onSelectDate }: Props) {
  const { width } = useWindowDimensions();
  const selectedDateString = formatDateForCalendar(selectedDate);
  const calendarWidth = Math.max(0, width - SCREEN_PADDING * 2);

  const markedDates = {
    [selectedDateString]: {
      selected: true,
      selectedColor: Colors.primary,
    },
  };

  const calendarTheme = {
    backgroundColor: 'transparent',
    calendarBackground: 'transparent',
    textSectionTitleColor: Colors.textSecondary,
    dayTextColor: Colors.text,
    todayTextColor: Colors.primary,
    selectedDayTextColor: Colors.background,
    textDayFontSize: FontSize.lg,
    textDayFontWeight: '600' as const,
    textDayHeaderFontSize: FontSize.sm,
    textDayHeaderFontWeight: '500' as const,
  };

  const handleDayPress = (day: DateData) => {
    if (day.dateString === selectedDateString) {
      return;
    }

    const [year, month, date] = day.dateString.split('-').map(Number);
    onSelectDate(new Date(year, month - 1, date));
  };

  return (
    <View style={styles.container}>
      <CalendarProvider date={selectedDateString}>
        <WeekCalendar
          current={selectedDateString}
          calendarWidth={calendarWidth}
          firstDay={1}
          onDayPress={handleDayPress}
          markedDates={markedDates}
          theme={calendarTheme}
        />
      </CalendarProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 82,
  },
});
