import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';
import {
  loadCachedAppData,
  saveCachedAppData,
  saveLecturesForCurrentUser,
  saveTasksForCurrentUser,
} from '../../utils/app-data-cache';
import type { Lecture, Task } from '../../types';

type GetUserResponse = Awaited<ReturnType<typeof supabase.auth.getUser>>;

jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
  },
}));

const task: Task = {
  id: 'task-1',
  userId: 'user-1',
  title: 'Essay',
  dueDate: '2026-06-09',
  dueTime: '18:30',
  isCompleted: false,
  createdAt: '2026-06-01T10:00:00.000Z',
};

const lecture: Lecture = {
  id: 'lecture-1',
  userId: 'user-1',
  title: 'Math',
  dayOfWeek: 2,
  startTime: '09:00',
  endTime: '10:30',
  createdAt: '2026-06-01T10:00:00.000Z',
};

function getUserResponse(userId: string | null): GetUserResponse {
  return {
    data: {
      user: userId ? { id: userId } : null,
    },
    error: null,
  } as unknown as GetUserResponse;
}

describe('app data cache', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    jest.useFakeTimers().setSystemTime(new Date('2026-06-10T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('saves and loads cached app data per user', async () => {
    await saveCachedAppData('user-1', { lectures: [lecture], tasks: [task] });

    await expect(loadCachedAppData('user-1')).resolves.toEqual({
      lectures: [lecture],
      tasks: [task],
      savedAt: '2026-06-10T12:00:00.000Z',
    });
  });

  it('returns null for invalid cached JSON instead of throwing', async () => {
    await AsyncStorage.setItem('studyplaner_app_data:user-1', '{invalid json');

    await expect(loadCachedAppData('user-1')).resolves.toBeNull();
  });

  it('updates only tasks for the signed-in user while preserving cached lectures', async () => {
    jest.mocked(supabase.auth.getUser).mockResolvedValue(getUserResponse('user-1'));
    await saveCachedAppData('user-1', { lectures: [lecture], tasks: [] });

    await saveTasksForCurrentUser([task]);

    await expect(loadCachedAppData('user-1')).resolves.toMatchObject({
      lectures: [lecture],
      tasks: [task],
    });
  });

  it('does not write lecture cache when there is no signed-in user', async () => {
    jest.mocked(supabase.auth.getUser).mockResolvedValue(getUserResponse(null));

    await saveLecturesForCurrentUser([lecture]);

    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });
});
