/**
 * Application Constants
 * Centralized constant values used throughout the application
 */

// Chat Configuration
export const CHAT = {
  ROOM_ID: '00000000-0000-0000-0000-000000000068',
  STORAGE_KEY: '68riders:chatMessages:v1',
  MAX_MESSAGE_LENGTH: 2000,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  TYPING_INDICATOR_TIMEOUT: 1800,
  MESSAGE_LOAD_LIMIT: 120,
}

// Storage Keys
export const STORAGE_KEYS = {
  USER: '68riders:user',
  EVENTS: '68riders:events',
  ANNOUNCEMENTS: '68riders:announcements',
  GALLERY: '68riders:gallery',
  MESSAGES: '68riders:messages',
  FEEDBACK_REPORTS: '68riders:feedbackReports',
  MODERATION_ACTIONS: '68riders:moderationActions',
  MEMBERS: '68riders:members',
  AUTH_TOKEN: '68riders:authToken',
  THEME: '68riders:theme',
}

// User Roles
export const ROLES = {
  FOUNDER: 'founder',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  MEMBER: 'member',
}

export const ROLE_LABELS = {
  [ROLES.FOUNDER]: 'Kurucu Üye',
  [ROLES.ADMIN]: 'Yönetim',
  [ROLES.MODERATOR]: 'Moderatör',
  [ROLES.MEMBER]: 'Üye',
}

// User Status
export const STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  BANNED: 'banned',
  REMOVED: 'removed',
  REJECTED: 'rejected',
}

export const STATUS_LABELS = {
  [STATUS.ACTIVE]: 'Aktif',
  [STATUS.PENDING]: 'Onay Bekliyor',
  [STATUS.BANNED]: 'Banlı',
  [STATUS.REMOVED]: 'Atıldı',
  [STATUS.REJECTED]: 'Reddedildi',
}

// Message Types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  DOCUMENT: 'document',
  EVENT: 'event',
  POLL: 'poll',
}

// Media Types
export const MEDIA_TYPES = {
  PHOTO: 'photo',
  VIDEO: 'video',
}

// Severity Levels
export const SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
}

export const SEVERITY_LABELS = {
  [SEVERITY.LOW]: 'Küçük',
  [SEVERITY.MEDIUM]: 'Normal',
  [SEVERITY.HIGH]: 'Önemli',
  [SEVERITY.CRITICAL]: 'Kritik',
}

// Supabase Buckets
export const BUCKETS = {
  AVATARS: 'avatars',
  GALLERY: 'gallery',
  EVENT_IMAGES: 'event-images',
  CHAT_MEDIA: 'chat-media',
  CHAT_VOICE: 'chat-voice',
  CHAT_DOCUMENTS: 'chat-documents',
}

// File Size Limits (bytes)
export const FILE_LIMITS = {
  AVATAR: 2 * 1024 * 1024, // 2MB
  GALLERY: 10 * 1024 * 1024, // 10MB
  EVENT_IMAGE: 5 * 1024 * 1024, // 5MB
  CHAT_MEDIA: 20 * 1024 * 1024, // 20MB
  CHAT_DOCUMENT: 10 * 1024 * 1024, // 10MB
  CHAT_VOICE: 5 * 1024 * 1024, // 5MB
}

// Accepted File Types
export const ACCEPTED_FILE_TYPES = {
  IMAGE: 'image/jpeg,image/png,image/webp,image/gif',
  VIDEO: 'video/mp4,video/webm,video/quicktime',
  AUDIO: 'audio/webm,audio/mpeg,audio/mp3',
  DOCUMENT: 'application/pdf,.doc,.docx,.txt',
}

// UI Configuration
export const UI = {
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 1000,
  ANIMATION_DURATION: 200,
}

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
}

// Moderation
export const MODERATION = {
  MAX_WARNINGS: 3,
  WARNING_THRESHOLD_FOR_BAN: 3,
}

// Image Presets (for demo mode)
export const IMAGE_PRESETS = {
  RIDE: 'ride',
  NIGHT: 'night',
  MOUNTAIN: 'mountain',
  GARAGE: 'garage',
}

// Quick Emojis
export const QUICK_EMOJIS = ['👍', '❤️', '🔥', '👏', '🏍️', '😂', '😎', '🙌', '🙏', '✅', '⚠️']

// Reaction Emojis
export const REACTIONS = ['👍', '❤️', '🔥', '👏', '🏍️']

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  EVENTS: '/events',
  EVENT_DETAIL: '/events/:eventId',
  QR: '/qr',
  ANNOUNCEMENTS: '/announcements',
  GALLERY: '/gallery',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  ADMIN: '/admin',
  CHAT: '/chat',
  FEEDBACK: '/feedback',
}

// API Error Codes
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
}

export default {
  CHAT,
  STORAGE_KEYS,
  ROLES,
  ROLE_LABELS,
  STATUS,
  STATUS_LABELS,
  MESSAGE_TYPES,
  MEDIA_TYPES,
  SEVERITY,
  SEVERITY_LABELS,
  BUCKETS,
  FILE_LIMITS,
  ACCEPTED_FILE_TYPES,
  UI,
  PAGINATION,
  MODERATION,
  IMAGE_PRESETS,
  QUICK_EMOJIS,
  REACTIONS,
  ROUTES,
  ERROR_CODES,
}
