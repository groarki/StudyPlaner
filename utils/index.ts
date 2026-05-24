import { Lecture, LectureDbRow } from '../types';

export function mapLectureFromDb(row: LectureDbRow): Lecture {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    dayOfWeek: row.day_of_week,
    startTime: row.start_time,
    endTime: row.end_time,
    color: row.color ?? undefined,
    notes: row.notes ?? undefined,
    alertMinutes: row.alert_minutes ?? undefined,
    createdAt: row.created_at,
  };
}

export function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`;
}

export function formatDateForCalendar(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}
