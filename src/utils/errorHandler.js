/**
 * Centralized Error Handling
 * Provides consistent error handling across the application
 */

import { ERROR_CODES } from '../config/constants'
import ENV from '../config/env'

class AppError extends Error {
  constructor(message, code = ERROR_CODES.UNKNOWN_ERROR, details = null) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.details = details
    this.timestamp = new Date().toISOString()
  }
}

export { AppError }

/**
 * Handle Supabase errors
 */
export function handleSupabaseError(error) {
  if (!error) return null

  const { message, code, details, hint } = error

  // Network errors
  if (message?.includes('fetch')) {
    return new AppError(
      'Bağlantı hatası. İnternet bağlantınızı kontrol edin.',
      ERROR_CODES.NETWORK_ERROR,
      { originalError: error }
    )
  }

  // Auth errors
  if (code === 'PGRST301' || message?.includes('JWT')) {
    return new AppError(
      'Oturum süreniz doldu. Lütfen tekrar giriş yapın.',
      ERROR_CODES.AUTH_ERROR,
      { originalError: error }
    )
  }

  // Permission errors
  if (code === '42501' || message?.includes('permission')) {
    return new AppError(
      'Bu işlem için yetkiniz yok.',
      ERROR_CODES.PERMISSION_DENIED,
      { originalError: error }
    )
  }

  // Not found errors
  if (code === 'PGRST116') {
    return new AppError(
      'Aradığınız kayıt bulunamadı.',
      ERROR_CODES.NOT_FOUND,
      { originalError: error }
    )
  }

  // Validation errors
  if (code === '23505') {
    return new AppError(
      'Bu kayıt zaten mevcut.',
      ERROR_CODES.VALIDATION_ERROR,
      { originalError: error, hint }
    )
  }

  if (code === '23503') {
    return new AppError(
      'İlişkili kayıt bulunamadı.',
      ERROR_CODES.VALIDATION_ERROR,
      { originalError: error, hint }
    )
  }

  // Generic server error
  return new AppError(
    message || 'Bir hata oluştu. Lütfen tekrar deneyin.',
    ERROR_CODES.SERVER_ERROR,
    { originalError: error, code, details, hint }
  )
}

/**
 * Handle file upload errors
 */
export function handleFileError(error, file) {
  if (error?.message?.includes('size')) {
    return new AppError(
      `Dosya çok büyük. Maksimum boyut: ${formatBytes(error.maxSize || 10485760)}`,
      ERROR_CODES.VALIDATION_ERROR,
      { file: file?.name, size: file?.size }
    )
  }

  if (error?.message?.includes('type')) {
    return new AppError(
      'Desteklenmeyen dosya türü.',
      ERROR_CODES.VALIDATION_ERROR,
      { file: file?.name, type: file?.type }
    )
  }

  return new AppError(
    'Dosya yüklenirken hata oluştu.',
    ERROR_CODES.SERVER_ERROR,
    { originalError: error, file: file?.name }
  )
}

/**
 * Log error to console and monitoring service
 */
export function logError(error, context = {}) {
  const errorInfo = {
    message: error.message,
    code: error.code,
    details: error.details,
    timestamp: error.timestamp || new Date().toISOString(),
    context,
    stack: error.stack,
  }

  // Console logging
  if (ENV.IS_DEV) {
    console.error('❌ Error:', errorInfo)
  }

  // Send to Sentry in production
  if (ENV.ENABLE_SENTRY && window.Sentry) {
    window.Sentry.captureException(error, {
      extra: errorInfo,
    })
  }

  // Send to custom analytics
  if (ENV.ENABLE_ANALYTICS && window.gtag) {
    window.gtag('event', 'exception', {
      description: error.message,
      fatal: false,
      ...context,
    })
  }

  return errorInfo
}

/**
 * Get user-friendly error message
 */
export function getUserMessage(error) {
  if (error instanceof AppError) {
    return error.message
  }

  if (error?.message) {
    return error.message
  }

  return 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.'
}

/**
 * Retry logic for failed operations
 */
export async function retryOperation(operation, maxRetries = 3, delay = 1000) {
  let lastError = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
      }
    }
  }

  throw lastError
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Handle async operations with error catching
 */
export async function safeAsync(fn, errorHandler = null) {
  try {
    return await fn()
  } catch (error) {
    const appError = handleSupabaseError(error)
    logError(appError)
    
    if (errorHandler) {
      errorHandler(appError)
    }
    
    return null
  }
}

export default {
  AppError,
  handleSupabaseError,
  handleFileError,
  logError,
  getUserMessage,
  retryOperation,
  safeAsync,
}
