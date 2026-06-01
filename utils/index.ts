import { Lecture, LectureDbRow, Task, TaskDbRow } from '../types';

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

export function formatDueDate(value: string): string {
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    const day = `${date.getDate()}`.padStart(2, '0');
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    return `${day}.${month}`;
  }

  const parts = value.split(/[./-]/).filter(Boolean);
  if (parts.length === 3) {
    const [a, b] = parts;
    return `${a.padStart(2, '0')}.${b.padStart(2, '0')}`;
  }

  return value;
}

export function mapTaskFromDb(row: TaskDbRow): Task {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    dueDate: row.due_date,
    dueTime: row.due_time,
    color: row.color ?? undefined,
    notes: row.notes ?? undefined,
    alertMinutes: row.alert_minutes ?? undefined,
    isCompleted: row.is_completed,
    fileUrls: row.file_urls ?? undefined,
    createdAt: row.created_at,
  };
}
