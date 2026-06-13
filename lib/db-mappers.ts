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
