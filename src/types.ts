import type { Language } from './i18n/types';
export type { Language };

export interface AIConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

export interface Task {
  id: string;
  title: string;
  timeSpent: number;
  completed: boolean;
  status?: 'pending' | 'in_progress' | 'paused' | 'completed';
  pomodoros?: number;
  plan?: string;
  completedAt?: string;
}

export interface Session {
  date: string;
  duration: number; // minutes
}

export interface AppConfig {
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  language: Language;
  aiConfig?: AIConfig;
}
