import { describe, expect, it } from '@jest/globals';
import { mapLectureFromDb, mapTaskFromDb } from '../../lib/db-mappers';

describe('database mappers', () => {
  it('maps lecture database rows to the app model and drops null optional values', () => {
    expect(
      mapLectureFromDb({
        id: 'lecture-1',
        user_id: 'user-1',
        title: 'Math',
        day_of_week: 2,
        start_time: '09:00',
        end_time: '10:30',
        color: null,
        notes: null,
        alert_minutes: null,
        created_at: '2026-06-01T10:00:00.000Z',
      })
    ).toEqual({
      id: 'lecture-1',
      userId: 'user-1',
      title: 'Math',
      dayOfWeek: 2,
      startTime: '09:00',
      endTime: '10:30',
      color: undefined,
      notes: undefined,
      alertMinutes: undefined,
      createdAt: '2026-06-01T10:00:00.000Z',
    });
  });

  it('maps task database rows to the app model with file URLs and completion state', () => {
    expect(
      mapTaskFromDb({
        id: 'task-1',
        user_id: 'user-1',
        title: 'Essay',
        due_date: '2026-06-09',
        due_time: '18:30',
        color: '#abc',
        notes: 'Draft intro',
        alert_minutes: 30,
        is_completed: true,
        file_urls: ['file-a.pdf'],
        created_at: '2026-06-01T10:00:00.000Z',
      })
    ).toEqual({
      id: 'task-1',
      userId: 'user-1',
      title: 'Essay',
      dueDate: '2026-06-09',
      dueTime: '18:30',
      color: '#abc',
      notes: 'Draft intro',
      alertMinutes: 30,
      isCompleted: true,
      fileUrls: ['file-a.pdf'],
      createdAt: '2026-06-01T10:00:00.000Z',
    });
  });
});
