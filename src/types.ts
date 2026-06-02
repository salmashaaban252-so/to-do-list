export type Priority = 'high' | 'medium' | 'low';
export type Mood = 'happy' | 'neutral' | 'tired' | 'stressed' | 'motivated';
export type Theme = 'light' | 'dark';

export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  notes: string;
  priority: Priority;
  category: string;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
  subTasks: SubTask[];
  mood: Mood | null;
  points: number;
}

export interface DayStats {
  date: string;
  completed: number;
  total: number;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  unlocked: boolean;
  icon: string;
  themeColor?: string;
}

export interface AppState {
  tasks: Task[];
  categories: string[];
  streak: number;
  lastCompletedDate: string | null;
  totalPoints: number;
  unlockedRewards: string[];
  weekStats: DayStats[];
  currentMood: Mood | null;
  theme: Theme;
  focusMode: {
    active: boolean;
    duration: number; // minutes
    timeLeft: number; // seconds
    taskId: string | null;
    blockedSites: string[];
  };
}
