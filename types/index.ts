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
  notes?: string;
  alertMinutes?: number;
  isCompleted: boolean;
  fileUrls?: string[];
  createdAt: string;
}

export interface HelpfulLink {
  id: string;
  title: string;
  url: string;
}
