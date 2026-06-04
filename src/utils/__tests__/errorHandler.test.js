/**
 * Error Handler Tests
 */

import { describe, it, expect } from 'vitest'
import { 
  AppError, 
  handleSupabaseError, 
  getUserMessage,
  retryOperation 
} from '../errorHandler'
import { ERROR_CODES } from '../../config/constants'

describe('Error Handler', () => {
  describe('AppError', () => {
    it('should create AppError with message and code', () => {
      const error = new AppError('Test error', ERROR_CODES.VALIDATION_ERROR)
      
      expect(error.message).toBe('Test error')
      expect(error.code).toBe(ERROR_CODES.VALIDATION_ERROR)
      expect(error.timestamp).toBeDefined()
    })
  })

  describe('handleSupabaseError', () => {
    it('should handle network errors', () => {
      const error = { message: 'fetch failed' }
      const appError = handleSupabaseError(error)
      
      expect(appError.code).toBe(ERROR_CODES.NETWORK_ERROR)
      expect(appError.message).toContain('Bağlantı hatası')
    })

    it('should handle auth errors', () => {
      const error = { code: 'PGRST301', message: 'JWT expired' }
      const appError = handleSupabaseError(error)
      
      expect(appError.code).toBe(ERROR_CODES.AUTH_ERROR)
      expect(appError.message).toContain('Oturum')
    })

    it('should handle permission errors', () => {
      const error = { code: '42501', message: 'permission denied' }
      const appError = handleSupabaseError(error)
      
      expect(appError.code).toBe(ERROR_CODES.PERMISSION_DENIED)
      expect(appError.message).toContain('yetki')
    })

    it('should handle duplicate key errors', () => {
      const error = { code: '23505', message: 'duplicate key' }
      const appError = handleSupabaseError(error)
      
      expect(appError.code).toBe(ERROR_CODES.VALIDATION_ERROR)
      expect(appError.message).toContain('mevcut')
    })
  })

  describe('getUserMessage', () => {
    it('should return AppError message', () => {
      const error = new AppError('Custom message')
      expect(getUserMessage(error)).toBe('Custom message')
    })

    it('should return generic message for unknown errors', () => {
      const error = {}
      const message = getUserMessage(error)
      expect(message).toContain('Beklenmeyen')
    })
  })

  describe('retryOperation', () => {
    it('should succeed on first try', async () => {
      const operation = () => Promise.resolve('success')
      const result = await retryOperation(operation)
      
      expect(result).toBe('success')
    })

    it('should retry on failure', async () => {
      let attempts = 0
      const operation = () => {
        attempts++
        if (attempts < 3) {
          return Promise.reject(new Error('fail'))
        }
        return Promise.resolve('success')
      }
      
      const result = await retryOperation(operation, 3, 10)
      
      expect(result).toBe('success')
      expect(attempts).toBe(3)
    })

    it('should throw after max retries', async () => {
      const operation = () => Promise.reject(new Error('always fail'))
      
      await expect(retryOperation(operation, 2, 10)).rejects.toThrow('always fail')
    })
  })
})
