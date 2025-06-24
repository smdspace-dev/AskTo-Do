/**
 * Type definitions for the AI Todo Application
 * Following TypeScript best practices
 */

import { TASK_PRIORITY, TASK_STATUS, TASK_CATEGORY, VOICE_STATE } from '../constants';

// Base Types
export type TaskPriority = typeof TASK_PRIORITY[keyof typeof TASK_PRIORITY];
export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];
export type TaskCategory = typeof TASK_CATEGORY[keyof typeof TASK_CATEGORY];
export type VoiceState = typeof VOICE_STATE[keyof typeof VOICE_STATE];

// Task Interface
export interface ITask {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: 'voice' | 'manual' | 'import';
  tags?: string[];
  estimatedDuration?: number; // in minutes
  dependencies?: string[]; // task IDs
}

// Conversation Interface
export interface IConversationMessage {
  id: string;
  sender: 'user' | 'assistant';
  message: string;
  timestamp: Date;
  metadata?: {
    confidence?: number;
    intent?: string;
    entities?: Record<string, any>;
  };
}

// Voice Recognition Interface
export interface IVoiceRecognitionConfig {
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  lang: string;
}

// Voice Recognition Response
export interface IVoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives?: Array<{
    transcript: string;
    confidence: number;
  }>;
}

// Speech Synthesis Configuration
export interface ISpeechConfig {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice;
  delay?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

// Task Parser Result
export interface ITaskParseResult {
  success: boolean;
  tasks?: Partial<ITask>[];
  message: string;
  confidence?: number;
  intent?: string;
  entities?: {
    title?: string;
    priority?: TaskPriority;
    category?: TaskCategory;
    dueDate?: Date;
    tags?: string[];
  };
}

// Conversation Manager Response
export interface IConversationResponse {
  message: string;
  type: 'taskCreated' | 'taskCompleted' | 'taskList' | 'error' | 'general';
  success: boolean;
  showTaskPreview?: boolean;
  taskDraft?: Partial<ITask>;
  tasksToSave?: Partial<ITask>[];
  multipleTasks?: Partial<ITask>[];
  clearDraft?: boolean;
  requestedTasks?: ITask[];
  period?: string;
  summary?: string;
  isQuery?: boolean;
}

// UI Component Props Interfaces
export interface IBaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface IIconProps extends IBaseComponentProps {
  size?: number;
  color?: string;
}

export interface IButtonProps extends IBaseComponentProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface IModalProps extends IBaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Voice Modal Props
export interface IVoiceModalProps extends IModalProps {
  isListening: boolean;
  isAISpeaking: boolean;
  isProcessing: boolean;
  onTextInput: (text: string) => void;
  conversationHistory: IConversationMessage[];
  transcript?: string;
  error?: string;
  lastResponse?: string;
}

// Task List Props
export interface ITaskListProps extends IBaseComponentProps {
  tasks: ITask[];
  onTaskAction: (taskId: string, action: string, data?: any) => void;
  loading?: boolean;
  emptyMessage?: string;
}

// Sidebar Props
export interface ISidebarProps extends IBaseComponentProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onVoiceStart: () => void;
  taskCounts: Record<string, number>;
}

// Application State Interface
export interface IAppState {
  tasks: ITask[];
  conversationHistory: IConversationMessage[];
  currentView: string;
  selectedCategory?: TaskCategory;
  searchQuery: string;
  voiceState: VoiceState;
  isLoading: boolean;
  error?: string;
}

// User Preferences
export interface IUserPreferences {
  theme: 'light' | 'dark' | 'auto';
  voiceEnabled: boolean;
  defaultPriority: TaskPriority;
  defaultCategory: TaskCategory;
  language: string;
  notifications: {
    dueTasks: boolean;
    completedTasks: boolean;
    voiceConfirmation: boolean;
  };
}

// Error Types
export interface IAppError {
  code: string;
  message: string;
  timestamp: Date;
  stack?: string;
  context?: Record<string, any>;
}

// Service Response Type
export interface IServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: IAppError;
  message?: string;
}