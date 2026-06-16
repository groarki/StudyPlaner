import { beforeEach, describe, expect, it } from '@jest/globals';
import { useAuthStore } from '../../store/useAuthStore';
import { useProfileStore } from '../../store/useProfileStore';

describe('auth store', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isLoading: true,
      isAuthenticated: false,
    });
  });

  it('marks the session as authenticated only when a user is present', () => {
    useAuthStore.getState().setUser({
      id: 'user-1',
      email: 'student@example.com',
      name: 'Student',
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});

describe('profile store', () => {
  beforeEach(() => {
    useProfileStore.setState({
      name: '',
      avatarUrl: null,
      helpfulLinks: [],
      notificationSettings: {
        remindersEnabled: true,
        lectureRemindersEnabled: true,
        taskRemindersEnabled: true,
      },
    });
  });

  it('adds and removes helpful links by id', () => {
    const firstLink = { id: 'link-1', title: 'Docs', url: 'https://docs.example' };
    const secondLink = { id: 'link-2', title: 'Calendar', url: 'https://calendar.example' };

    useProfileStore.getState().addHelpfulLink(firstLink);
    useProfileStore.getState().addHelpfulLink(secondLink);
    useProfileStore.getState().removeHelpfulLink('link-1');

    expect(useProfileStore.getState().helpfulLinks).toEqual([secondLink]);
  });

  it('merges notification settings without resetting untouched preferences', () => {
    useProfileStore.getState().updateNotificationSettings({
      taskRemindersEnabled: false,
    });

    expect(useProfileStore.getState().notificationSettings).toEqual({
      remindersEnabled: true,
      lectureRemindersEnabled: true,
      taskRemindersEnabled: false,
    });
  });

  it('resets user-specific profile data on logout', () => {
    useProfileStore.setState({
      name: 'First User',
      avatarUrl: 'https://example.com/avatar.jpg',
      helpfulLinks: [{ id: 'link-1', title: 'Docs', url: 'https://docs.example' }],
      notificationSettings: {
        remindersEnabled: false,
        lectureRemindersEnabled: false,
        taskRemindersEnabled: false,
      },
    });

    useProfileStore.getState().resetProfile();

    expect(useProfileStore.getState()).toMatchObject({
      name: '',
      avatarUrl: null,
      helpfulLinks: [],
      notificationSettings: {
        remindersEnabled: true,
        lectureRemindersEnabled: true,
        taskRemindersEnabled: true,
      },
    });
  });
});
