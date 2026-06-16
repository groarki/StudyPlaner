import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { useTasksStore } from '../../store/useTasksStore';
import type { Task } from '../../types';
import { saveTasksForCurrentUser } from '../../utils/app-data-cache';

jest.mock('../../utils/app-data-cache', () => ({
  saveTasksForCurrentUser: jest.fn(() => Promise.resolve()),
}));

const baseTask: Task = {
  id: 'task-1',
  userId: 'user-1',
  title: 'Prepare presentation',
  dueDate: '2026-06-09',
  dueTime: '12:00',
  isCompleted: false,
  createdAt: '2026-06-01T10:00:00.000Z',
};

describe('tasks store', () => {
  beforeEach(() => {
    useTasksStore.setState({
      tasks: [],
      isLoading: false,
      hasHydrated: false,
      error: null,
    });
    jest.clearAllMocks();
  });

  it('adds tasks and persists the new list for offline access', () => {
    useTasksStore.getState().addTask(baseTask);

    expect(useTasksStore.getState().tasks).toEqual([baseTask]);
    expect(useTasksStore.getState().hasHydrated).toBe(true);
    expect(saveTasksForCurrentUser).toHaveBeenCalledWith([baseTask]);
  });

  it('updates only the selected task', () => {
    const untouchedTask = { ...baseTask, id: 'task-2', title: 'Read chapter' };
    useTasksStore.setState({ tasks: [baseTask, untouchedTask] });

    useTasksStore.getState().updateTask('task-1', { title: 'Prepare slides' });

    expect(useTasksStore.getState().tasks).toEqual([
      { ...baseTask, title: 'Prepare slides' },
      untouchedTask,
    ]);
  });

  it('toggles completion without changing unrelated tasks', () => {
    const untouchedTask = { ...baseTask, id: 'task-2', title: 'Read chapter' };
    useTasksStore.setState({ tasks: [baseTask, untouchedTask] });

    useTasksStore.getState().toggleComplete('task-1');

    expect(useTasksStore.getState().tasks).toEqual([
      { ...baseTask, isCompleted: true },
      untouchedTask,
    ]);
  });

  it('deletes the selected task and persists the remaining list', () => {
    const remainingTask = { ...baseTask, id: 'task-2', title: 'Read chapter' };
    useTasksStore.setState({ tasks: [baseTask, remainingTask] });

    useTasksStore.getState().deleteTask('task-1');

    expect(useTasksStore.getState().tasks).toEqual([remainingTask]);
    expect(saveTasksForCurrentUser).toHaveBeenLastCalledWith([remainingTask]);
  });
});
