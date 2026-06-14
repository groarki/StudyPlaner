export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  helpfulLinks?: HelpfulLink[];
}

export interface Lecture {
  id: string;
  userId: string;
  title: string;
  dayOfWeek: number; 
  startTime: string; 
  endTime: string;   
  color?: string;
  notes?: string;
  alertMinutes?: number; 
  createdAt: string;
}

export interface LectureDbRow {
  id: string;
  user_id: string;
  title: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  color?: string | null;
  notes?: string | null;
  alert_minutes?: number | null;
  created_at: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  dueDate: string; 
  dueTime: string;
  color?: string;
  notes?: string;
  alertMinutes?: number;
  isCompleted: boolean;
  fileUrls?: string[];
  createdAt: string;
}

export interface TaskDbRow {
  id: string;
  user_id: string;
  title: string;
  due_date: string;
  due_time: string;
  color?: string | null;
  notes?: string | null;
  alert_minutes?: number | null;
  is_completed: boolean;
  file_urls?: string[] | null;
  created_at: string;
}

export interface HelpfulLink {
  id: string;
  title: string;
  url: string;
}

export interface NotificationSettings {
  remindersEnabled: boolean;
  lectureRemindersEnabled: boolean;
  taskRemindersEnabled: boolean;
}
