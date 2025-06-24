/**
 * Application Constants
 * Following industry standard naming conventions
 */

// Task Priority Levels
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;

// Task Status Types
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

// Task Categories
export const TASK_CATEGORY = {
  WORK: 'work',
  PERSONAL: 'personal',
  SHOPPING: 'shopping',
  HEALTH: 'health',
  EDUCATION: 'education',
  FINANCE: 'finance'
} as const;

// Voice Recognition States
export const VOICE_STATE = {
  IDLE: 'idle',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  SPEAKING: 'speaking',
  ERROR: 'error'
} as const;

// API Endpoints (if needed for future backend integration)
export const API_ENDPOINTS = {
  TASKS: '/api/tasks',
  VOICE: '/api/voice',
  USER: '/api/user'
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  TASKS: 'ai_todo_tasks',
  USER_PREFERENCES: 'ai_todo_preferences',
  CONVERSATION_HISTORY: 'ai_todo_conversation'
} as const;

// UI Constants
export const UI_CONSTANTS = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  TOAST_DURATION: 3000,
  MODAL_CLOSE_DELAY: 2000
} as const;

// Voice Recognition Settings
export const VOICE_CONFIG = {
  RECOGNITION_TIMEOUT: 5000,
  SPEECH_RATE: 0.9,
  SPEECH_PITCH: 1.05,
  SPEECH_VOLUME: 0.8
} as const;

// Theme Configuration
export const THEME = {
  COLORS: {
    PRIMARY_CYBER: '#00D4FF',
    PRIMARY_NEON: '#00FF88',
    PRIMARY_PURPLE: '#8B5CF6',
    PRIMARY_PINK: '#FF006E',
    DARK_BG: '#0A0A0A',
    DARK_SURFACE: '#1A1A1A',
    DARK_ELEVATED: '#2A2A2A'
  },
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px'
  }
} as const;