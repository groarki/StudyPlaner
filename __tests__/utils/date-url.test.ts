import { describe, expect, it, jest } from '@jest/globals';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import {
  formatDateForCalendar,
  formatDueDate,
  formatTime,
  getInitials,
  getValidUrl,
  mergeDatePart,
  mergeTimePart,
  openAndroidDateTimePicker,
} from '../../utils';

describe('date, time and URL helpers', () => {
  it('formats time as a zero-padded 24-hour value', () => {
    expect(formatTime(new Date(2026, 0, 3, 7, 5))).toBe('07:05');
  });

  it('formats dates for calendar keys without timezone conversion', () => {
    expect(formatDateForCalendar(new Date(2026, 5, 9))).toBe('2026-06-09');
  });

  it('keeps the current time while replacing only the date part', () => {
    const merged = mergeDatePart(
      new Date(2026, 0, 3, 14, 45, 30),
      new Date(2027, 8, 12, 2, 10)
    );

    expect(merged).toEqual(new Date(2027, 8, 12, 14, 45, 30));
  });

  it('keeps the current date while replacing only the time part', () => {
    const merged = mergeTimePart(
      new Date(2026, 0, 3, 14, 45, 30),
      new Date(2027, 8, 12, 9, 15, 20)
    );

    expect(merged).toEqual(new Date(2026, 0, 3, 9, 15, 0));
  });

  it('normalizes valid web URLs and rejects unsafe or malformed values', () => {
    expect(getValidUrl('example.com/path')).toBe('https://example.com/path');
    expect(getValidUrl('https://study.example')).toBe('https://study.example/');
    expect(getValidUrl('https://exa mple.com')).toBeNull();
    expect(getValidUrl('mailto:user@example.com')).toBeNull();
    expect(getValidUrl('example..com')).toBeNull();
  });

  it('returns fallback initials for blank names and two-letter initials for full names', () => {
    expect(getInitials('')).toBe('S');
    expect(getInitials('  ada lovelace byron  ')).toBe('AL');
  });

  it('formats task due dates and leaves unexpected formats unchanged', () => {
    expect(formatDueDate('2026-06-09')).toBe('09.06');
    expect(formatDueDate('tomorrow')).toBe('tomorrow');
  });

  it('ignores dismissed Android picker events and merges datetime picks correctly', () => {
    const onChange = jest.fn();
    const value = new Date(2026, 0, 3, 14, 45);

    openAndroidDateTimePicker({
      value,
      mode: 'datetime',
      pickerMode: 'date',
      onChange,
    });

    const openArg = jest.mocked(DateTimePickerAndroid.open).mock.calls[0][0];
    const handleChange = openArg.onChange as unknown as (
      event: { type: 'dismissed' | 'set' },
      date?: Date
    ) => void;

    handleChange({ type: 'dismissed' });
    handleChange({ type: 'set' }, new Date(2026, 5, 9, 1, 2));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 5, 9, 14, 45));
  });
});
