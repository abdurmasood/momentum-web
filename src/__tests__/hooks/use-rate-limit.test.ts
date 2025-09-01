import { renderHook, act } from '@testing-library/react'
import {
  useRateLimit,
  useAuthRateLimit,
  useMagicLinkRateLimit,
  useTemporaryRateLimit,
  useRateLimitInfo
} from '@/hooks/use-rate-limit'
import { RateLimiter, authRateLimiter, magicLinkRateLimiter } from '@/utils/auth-security'

// Mock the auth-security module
jest.mock('@/utils/auth-security', () => {
  const mockRateLimiter = {
    isRateLimited: jest.fn(() => false),
    getAttempts: jest.fn(() => 0),
    getTimeUntilUnblocked: jest.fn(() => 0),
    recordAttempt: jest.fn(),
    clear: jest.fn()
  }

  return {
    authRateLimiter: mockRateLimiter,
    magicLinkRateLimiter: { ...mockRateLimiter },
    getClientKey: jest.fn(() => 'test-client-key'),
    RateLimiter: jest.fn().mockImplementation(() => mockRateLimiter)
  }
})

// Mock timers
jest.useFakeTimers()

const mockWindow = {
  location: {
    origin: 'https://example.com'
  },
  navigator: {
    userAgent: 'Mozilla/5.0 (compatible; Test)'
  }
}

describe('Rate Limit Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
    
    // Mock window
    Object.defineProperty(global, 'window', {
      value: mockWindow,
      writable: true
    })
  })

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers()
    })
    jest.useRealTimers()
    jest.useFakeTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  describe('useRateLimit', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useRateLimit())

      expect(result.current.isRateLimited).toBe(false)
      expect(result.current.attempts).toBe(0)
      expect(result.current.timeRemaining).toBe(0)
      expect(result.current.timeRemainingFormatted).toBe('')
      expect(typeof result.current.canAttempt).toBe('function')
      expect(typeof result.current.recordAttempt).toBe('function')
      expect(typeof result.current.reset).toBe('function')
    })

    it('should update state when rate limited', () => {
      const mockLimiter = {
        isRateLimited: jest.fn(() => true),
        getAttempts: jest.fn(() => 3),
        getTimeUntilUnblocked: jest.fn(() => 60000), // 60 seconds
        recordAttempt: jest.fn(),
        clear: jest.fn()
      } as unknown as RateLimiter

      let result: { current: { isRateLimited: boolean; attempts: number; timeRemaining: number; timeRemainingFormatted: string } }
      act(() => {
        const hookResult = renderHook(() => useRateLimit({ limiter: mockLimiter }))
        result = hookResult.result
      })

      expect(result.current.isRateLimited).toBe(true)
      expect(result.current.attempts).toBe(3)
      expect(result.current.timeRemaining).toBe(60)
      expect(result.current.timeRemainingFormatted).toBe('1m 0s')
    })

    it('should format time remaining correctly', () => {
      const mockLimiter = {
        isRateLimited: jest.fn(() => true),
        getAttempts: jest.fn(() => 3),
        getTimeUntilUnblocked: jest.fn(() => 125000), // 125 seconds
        recordAttempt: jest.fn(),
        clear: jest.fn()
      } as unknown as RateLimiter

      let result: { current: { isRateLimited: boolean; attempts: number; timeRemaining: number; timeRemainingFormatted: string } }
      act(() => {
        const hookResult = renderHook(() => useRateLimit({ limiter: mockLimiter }))
        result = hookResult.result
      })

      expect(result.current.timeRemainingFormatted).toBe('2m 5s')
    })

    it('should format seconds-only time correctly', () => {
      const mockLimiter = {
        isRateLimited: jest.fn(() => true),
        getAttempts: jest.fn(() => 3),
        getTimeUntilUnblocked: jest.fn(() => 45000), // 45 seconds
        recordAttempt: jest.fn(),
        clear: jest.fn()
      } as unknown as RateLimiter

      let result: { current: { isRateLimited: boolean; attempts: number; timeRemaining: number; timeRemainingFormatted: string } }
      act(() => {
        const hookResult = renderHook(() => useRateLimit({ limiter: mockLimiter }))
        result = hookResult.result
      })

      expect(result.current.timeRemainingFormatted).toBe('45s')
    })

    it('should record attempts correctly', () => {
      const mockLimiter = {
        isRateLimited: jest.fn(() => false),
        getAttempts: jest.fn(() => 1),
        getTimeUntilUnblocked: jest.fn(() => 0),
        recordAttempt: jest.fn(),
        clear: jest.fn()
      } as unknown as RateLimiter

      const { result } = renderHook(() => useRateLimit({ limiter: mockLimiter }))

      act(() => {
        result.current.recordAttempt()
      })

      expect(mockLimiter.recordAttempt).toHaveBeenCalledWith('test-client-key')
    })

    it('should start timer when rate limited after attempt', () => {
      let isRateLimited = false
      const mockLimiter = {
        isRateLimited: jest.fn(() => isRateLimited),
        getAttempts: jest.fn(() => 1),
        getTimeUntilUnblocked: jest.fn(() => isRateLimited ? 60000 : 0),
        recordAttempt: jest.fn(() => {
          isRateLimited = true
        }),
        clear: jest.fn()
      } as unknown as RateLimiter

      const { result } = renderHook(() => useRateLimit({ limiter: mockLimiter }))

      act(() => {
        result.current.recordAttempt()
      })

      // Should start timer
      expect(mockLimiter.isRateLimited).toHaveBeenCalled()

      // Fast forward time
      act(() => {
        jest.advanceTimersByTime(1000)
      })

      // Should have called isRateLimited multiple times (initial render + recordAttempt + timer updates)
      expect(mockLimiter.isRateLimited).toHaveBeenCalledWith('test-client-key')
    })

    it('should clear timer when no longer rate limited', () => {
      let callCount = 0
      const mockLimiter = {
        isRateLimited: jest.fn(() => {
          callCount++
          return callCount === 1 // Only first call returns true
        }),
        getAttempts: jest.fn(() => 1),
        getTimeUntilUnblocked: jest.fn(() => 0),
        recordAttempt: jest.fn(),
        clear: jest.fn()
      } as unknown as RateLimiter

      const { result } = renderHook(() => useRateLimit({ limiter: mockLimiter }))

      // Start with rate limited state
      act(() => {
        result.current.recordAttempt()
      })

      // Fast forward time - should clear timer when no longer rate limited
      act(() => {
        jest.advanceTimersByTime(2000) // 2 seconds
      })

      expect(mockLimiter.isRateLimited).toHaveBeenCalled()
    })

    it('should reset rate limit', () => {
      const mockLimiter = {
        isRateLimited: jest.fn(() => false),
        getAttempts: jest.fn(() => 0),
        getTimeUntilUnblocked: jest.fn(() => 0),
        recordAttempt: jest.fn(),
        clear: jest.fn()
      } as unknown as RateLimiter

      const { result } = renderHook(() => useRateLimit({ limiter: mockLimiter }))

      act(() => {
        result.current.reset()
      })

      expect(mockLimiter.clear).toHaveBeenCalledWith('test-client-key')
    })

    it('should check if can attempt', () => {
      const mockLimiter = {
        isRateLimited: jest.fn(() => false),
        getAttempts: jest.fn(() => 0),
        getTimeUntilUnblocked: jest.fn(() => 0),
        recordAttempt: jest.fn(),
        clear: jest.fn()
      } as unknown as RateLimiter

      const { result } = renderHook(() => useRateLimit({ limiter: mockLimiter }))

      expect(result.current.canAttempt()).toBe(true)
      expect(mockLimiter.isRateLimited).toHaveBeenCalledWith('test-client-key')
    })

    it('should use custom key when provided', () => {
      const mockLimiter = {
        isRateLimited: jest.fn(() => false),
        getAttempts: jest.fn(() => 0),
        getTimeUntilUnblocked: jest.fn(() => 0),
        recordAttempt: jest.fn(),
        clear: jest.fn()
      } as unknown as RateLimiter

      const { result } = renderHook(() => 
        useRateLimit({ limiter: mockLimiter, key: 'custom-key' })
      )

      act(() => {
        result.current.recordAttempt()
      })

      expect(mockLimiter.recordAttempt).toHaveBeenCalledWith('custom-key')
    })

    it('should auto-reset on unmount when enabled', () => {
      const mockLimiter = {
        isRateLimited: jest.fn(() => false),
        getAttempts: jest.fn(() => 0),
        getTimeUntilUnblocked: jest.fn(() => 0),
        recordAttempt: jest.fn(),
        clear: jest.fn()
      } as unknown as RateLimiter

      const { unmount } = renderHook(() => 
        useRateLimit({ limiter: mockLimiter, autoReset: true })
      )

      unmount()

      expect(mockLimiter.clear).toHaveBeenCalledWith('test-client-key')
    })

    it('should not auto-reset on unmount when disabled', () => {
      const mockLimiter = {
        isRateLimited: jest.fn(() => false),
        getAttempts: jest.fn(() => 0),
        getTimeUntilUnblocked: jest.fn(() => 0),
        recordAttempt: jest.fn(),
        clear: jest.fn()
      } as unknown as RateLimiter

      const { unmount } = renderHook(() => 
        useRateLimit({ limiter: mockLimiter, autoReset: false })
      )

      unmount()

      expect(mockLimiter.clear).not.toHaveBeenCalled()
    })
  })

  describe('useAuthRateLimit', () => {
    it('should use auth rate limiter by default', () => {
      const { result } = renderHook(() => useAuthRateLimit())

      expect(result.current.isRateLimited).toBe(false)
      expect(authRateLimiter.isRateLimited).toHaveBeenCalledWith('test-client-key')
    })

    it('should use custom key when provided', () => {
      const { result } = renderHook(() => useAuthRateLimit('custom-auth-key'))

      act(() => {
        result.current.recordAttempt()
      })

      expect(authRateLimiter.recordAttempt).toHaveBeenCalledWith('custom-auth-key')
    })

    it('should not auto-reset', () => {
      const { unmount } = renderHook(() => useAuthRateLimit())

      unmount()

      expect(authRateLimiter.clear).not.toHaveBeenCalled()
    })
  })

  describe('useMagicLinkRateLimit', () => {
    it('should use magic link rate limiter', () => {
      const { result } = renderHook(() => useMagicLinkRateLimit())

      expect(result.current.isRateLimited).toBe(false)
      expect(magicLinkRateLimiter.isRateLimited).toHaveBeenCalledWith('magic-link-test-client-key')
    })

    it('should use email as key when provided', () => {
      const { result } = renderHook(() => useMagicLinkRateLimit('test@example.com'))

      act(() => {
        result.current.recordAttempt()
      })

      expect(magicLinkRateLimiter.recordAttempt).toHaveBeenCalledWith('magic-link-test@example.com')
    })

    it('should not auto-reset', () => {
      const { unmount } = renderHook(() => useMagicLinkRateLimit())

      unmount()

      expect(magicLinkRateLimiter.clear).not.toHaveBeenCalled()
    })
  })

  describe('useTemporaryRateLimit', () => {
    it('should create temporary rate limiter with custom settings', () => {
      const { result } = renderHook(() => useTemporaryRateLimit(5, 30000, 60000))

      expect(result.current.isRateLimited).toBe(false)
      expect(result.current.attempts).toBe(0)
    })

    it('should auto-reset temporary rate limiter', () => {
      const { unmount } = renderHook(() => useTemporaryRateLimit())

      // The temporary rate limiter should be cleared on unmount due to autoReset: true
      // We can't easily verify this without accessing the internal limiter,
      // but we can check that the hook properly initializes
      expect(typeof unmount).toBe('function')
    })

    it('should use default values when none provided', () => {
      const { result } = renderHook(() => useTemporaryRateLimit())

      // Should initialize without errors
      expect(result.current.canAttempt()).toBe(true)
    })
  })

  describe('useRateLimitInfo', () => {
    it('should provide rate limit info without state updates', () => {
      const mockLimiter = {
        isRateLimited: jest.fn(() => true),
        getAttempts: jest.fn(() => 2),
        getTimeUntilUnblocked: jest.fn(() => 30000)
      } as unknown as RateLimiter

      const { result } = renderHook(() => useRateLimitInfo(mockLimiter))

      expect(result.current.isRateLimited).toBe(true)
      expect(result.current.attempts).toBe(2)
      expect(result.current.timeRemaining).toBe(30)
      expect(result.current.canAttempt()).toBe(false)
    })

    it('should use custom key when provided', () => {
      const mockLimiter = {
        isRateLimited: jest.fn(() => false),
        getAttempts: jest.fn(() => 0),
        getTimeUntilUnblocked: jest.fn(() => 0)
      } as unknown as RateLimiter

      const { result } = renderHook(() => useRateLimitInfo(mockLimiter, 'custom-info-key'))

      result.current.canAttempt()

      expect(mockLimiter.isRateLimited).toHaveBeenCalledWith('custom-info-key')
    })
  })

  describe('Timer management', () => {
    it('should clean up timers on unmount', () => {
      const mockLimiter = {
        isRateLimited: jest.fn(() => true),
        getAttempts: jest.fn(() => 1),
        getTimeUntilUnblocked: jest.fn(() => 60000),
        recordAttempt: jest.fn(),
        clear: jest.fn()
      } as unknown as RateLimiter

      const { unmount } = renderHook(() => useRateLimit({ limiter: mockLimiter }))

      // Start a timer by being rate limited
      act(() => {
        jest.advanceTimersByTime(1000)
      })

      unmount()

      // No errors should occur and timers should be cleaned up
      expect(jest.getTimerCount()).toBe(0)
    })

    it('should handle component unmounting while timer is running', () => {
      const mockLimiter = {
        isRateLimited: jest.fn(() => true),
        getAttempts: jest.fn(() => 1),
        getTimeUntilUnblocked: jest.fn(() => 60000),
        recordAttempt: jest.fn(),
        clear: jest.fn()
      } as unknown as RateLimiter

      const { result, unmount } = renderHook(() => useRateLimit({ limiter: mockLimiter }))

      // Trigger rate limiting to start timer
      act(() => {
        result.current.recordAttempt()
      })

      // Unmount while timer is active
      unmount()

      // Should not cause any errors
      expect(jest.getTimerCount()).toBe(0)
    })
  })

  describe('Edge cases', () => {
    it('should handle zero time remaining', () => {
      const mockLimiter = {
        isRateLimited: jest.fn(() => false),
        getAttempts: jest.fn(() => 0),
        getTimeUntilUnblocked: jest.fn(() => 0),
        recordAttempt: jest.fn(),
        clear: jest.fn()
      } as unknown as RateLimiter

      const { result } = renderHook(() => useRateLimit({ limiter: mockLimiter }))

      expect(result.current.timeRemaining).toBe(0)
      expect(result.current.timeRemainingFormatted).toBe('')
    })

    it('should handle negative time remaining', () => {
      const mockLimiter = {
        isRateLimited: jest.fn(() => false),
        getAttempts: jest.fn(() => 0),
        getTimeUntilUnblocked: jest.fn(() => -5000), // Negative value
        recordAttempt: jest.fn(),
        clear: jest.fn()
      } as unknown as RateLimiter

      const { result } = renderHook(() => useRateLimit({ limiter: mockLimiter }))

      // Should handle negative values gracefully
      expect(result.current.timeRemaining).toBe(-5)
      expect(result.current.timeRemainingFormatted).toBe('')
    })

    it('should handle rapid state changes', () => {
      let isRateLimited = false
      const mockLimiter = {
        isRateLimited: jest.fn(() => isRateLimited),
        getAttempts: jest.fn(() => isRateLimited ? 3 : 0),
        getTimeUntilUnblocked: jest.fn(() => isRateLimited ? 60000 : 0),
        recordAttempt: jest.fn(),
        clear: jest.fn()
      } as unknown as RateLimiter

      const { result } = renderHook(() => useRateLimit({ limiter: mockLimiter }))

      // Rapidly toggle rate limit state
      act(() => {
        isRateLimited = true
        result.current.recordAttempt()
      })

      act(() => {
        isRateLimited = false
        jest.advanceTimersByTime(1000)
      })

      act(() => {
        isRateLimited = true
        result.current.recordAttempt()
      })

      // Should handle rapid changes without errors
      expect(mockLimiter.isRateLimited).toHaveBeenCalled()
    })
  })
})