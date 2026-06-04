/**
 * Environment Configuration
 * Centralized environment variable management with validation
 */

const getEnvVar = (key, defaultValue = '') => {
  const value = import.meta.env[key]
  if (value === undefined && defaultValue === '') {
    console.warn(`Environment variable ${key} is not defined`)
  }
  return value || defaultValue
}

const getBooleanEnv = (key, defaultValue = false) => {
  const value = import.meta.env[key]
  if (value === undefined) return defaultValue
  return value === 'true' || value === true
}

const getNumberEnv = (key, defaultValue = 0) => {
  const value = import.meta.env[key]
  if (value === undefined) return defaultValue
  const parsed = Number(value)
  return isNaN(parsed) ? defaultValue : parsed
}

export const ENV = {
  // App Configuration
  APP_ENV: getEnvVar('VITE_APP_ENV', 'development'),
  APP_VERSION: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  IS_DEV: getEnvVar('VITE_APP_ENV', 'development') === 'development',
  IS_STAGING: getEnvVar('VITE_APP_ENV', 'development') === 'staging',
  IS_PROD: getEnvVar('VITE_APP_ENV', 'development') === 'production',

  // Supabase
  SUPABASE_URL: getEnvVar('VITE_SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnvVar('VITE_SUPABASE_ANON_KEY'),

  // Push Notifications
  VAPID_PUBLIC_KEY: getEnvVar('VITE_VAPID_PUBLIC_KEY'),

  // Feature Flags
  ENABLE_ANALYTICS: getBooleanEnv('VITE_ENABLE_ANALYTICS', false),
  ENABLE_SENTRY: getBooleanEnv('VITE_ENABLE_SENTRY', false),
  ENABLE_DEBUG_PANEL: getBooleanEnv('VITE_ENABLE_DEBUG_PANEL', false),
  ENABLE_MOCK_DATA: getBooleanEnv('VITE_ENABLE_MOCK_DATA', false),
  ENABLE_RATE_LIMITING: getBooleanEnv('VITE_ENABLE_RATE_LIMITING', false),

  // API Configuration
  API_TIMEOUT: getNumberEnv('VITE_API_TIMEOUT', 30000),
  MAX_UPLOAD_SIZE: getNumberEnv('VITE_MAX_UPLOAD_SIZE', 10485760), // 10MB default

  // Monitoring
  SENTRY_DSN: getEnvVar('VITE_SENTRY_DSN'),
  GA_MEASUREMENT_ID: getEnvVar('VITE_GA_MEASUREMENT_ID'),
}

// Validation
if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase credentials not configured. App will run in demo mode.')
}

// Development helpers
if (ENV.IS_DEV) {
  console.log('🔧 Environment:', ENV.APP_ENV)
  console.log('📦 Version:', ENV.APP_VERSION)
  console.log('🎯 Features:', {
    analytics: ENV.ENABLE_ANALYTICS,
    sentry: ENV.ENABLE_SENTRY,
    debugPanel: ENV.ENABLE_DEBUG_PANEL,
    mockData: ENV.ENABLE_MOCK_DATA,
  })
}

export default ENV
