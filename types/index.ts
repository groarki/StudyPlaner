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
  color: string;
  notes?: string;
  alertMinutes?: number; 
  createdAt: string;
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