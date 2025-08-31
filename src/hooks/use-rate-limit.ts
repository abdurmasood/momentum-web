/**
 * Rate Limiting Hook for Authentication Actions
 * 
 * Provides React hook interface for rate limiting with automatic
 * state management and error handling.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { authRateLimiter, magicLinkRateLimiter, getClientKey, RateLimiter } from '@/utils/auth-security'

/**
 * Rate limit hook options
 */
interface UseRateLimitOptions {
  /** Rate limiter instance to use */
  limiter?: RateLimiter
  /** Key to use for rate limiting (defaults to client key) */
  key?: string
  /** Auto-reset when component unmounts */
  autoReset?: boolean
}

/**
 * Rate limit hook return value
 */
interface UseRateLimitReturn {
  /** Whether the action is currently rate limited */
  isRateLimited: boolean
  /** Number of attempts made */
  attempts: number
  /** Time remaining until unblocked (in seconds) */
  timeRemaining: number
  /** Formatted time remaining string */
  timeRemainingFormatted: string
  /** Check if action is allowed */
  canAttempt: () => boolean
  /** Record an attempt */
  recordAttempt: () => void
  /** Reset rate limit for this key */
  reset: () => void
}

/**
 * Custom hook for rate limiting with automatic state updates
 */
export function useRateLimit(options: UseRateLimitOptions = {}): UseRateLimitReturn {
  const {
    limiter = authRateLimiter,
    key = getClientKey(),
    autoReset = true
  } = options

  const [isRateLimited, setIsRateLimited] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  /**
   * Update state from rate limiter
   */
  const updateState = useCallback(() => {
    if (!mountedRef.current) return
    
    const rateLimited = limiter.isRateLimited(key)
    const attemptCount = limiter.getAttempts(key)
    const remaining = Math.ceil(limiter.getTimeUntilUnblocked(key) / 1000)
    
    setIsRateLimited(rateLimited)
    setAttempts(attemptCount)
    setTimeRemaining(remaining)
  }, [limiter, key])

  /**
   * Start countdown timer
   */
  const startTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    intervalRef.current = setInterval(() => {
      updateState()
      
      // Stop timer when no longer rate limited
      if (!limiter.isRateLimited(key)) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
    }, 1000)
  }, [updateState, limiter, key])

  /**
   * Check if action can be attempted
   */
  const canAttempt = useCallback((): boolean => {
    return !limiter.isRateLimited(key)
  }, [limiter, key])

  /**
   * Record an attempt and update state
   */
  const recordAttempt = useCallback(() => {
    limiter.recordAttempt(key)
    updateState()
    
    // Start timer if now rate limited
    if (limiter.isRateLimited(key)) {
      startTimer()
    }
  }, [limiter, key, updateState, startTimer])

  /**
   * Reset rate limit for this key
   */
  const reset = useCallback(() => {
    limiter.clear(key)
    updateState()
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [limiter, key, updateState])

  /**
   * Format time remaining as human-readable string
   */
  const timeRemainingFormatted = (() => {
    if (timeRemaining <= 0) return ''
    
    const minutes = Math.floor(timeRemaining / 60)
    const seconds = timeRemaining % 60
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
  })()

  // Initialize state on mount
  useEffect(() => {
    mountedRef.current = true
    updateState()
    
    // Start timer if already rate limited
    if (limiter.isRateLimited(key)) {
      startTimer()
    }
    
    return () => {
      mountedRef.current = false
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      
      // Auto-reset on unmount if enabled
      if (autoReset) {
        limiter.clear(key)
      }
    }
  }, [limiter, key, updateState, startTimer, autoReset])

  return {
    isRateLimited,
    attempts,
    timeRemaining,
    timeRemainingFormatted,
    canAttempt,
    recordAttempt,
    reset
  }
}

/**
 * Specialized hook for authentication rate limiting
 */
export function useAuthRateLimit(key?: string) {
  return useRateLimit({
    limiter: authRateLimiter,
    key: key || getClientKey(),
    autoReset: false // Don't auto-reset auth limits
  })
}

/**
 * Specialized hook for magic link rate limiting
 */
export function useMagicLinkRateLimit(email?: string) {
  // Use email as key if provided, otherwise use client key
  const key = email ? `magic-link-${email}` : `magic-link-${getClientKey()}`
  
  return useRateLimit({
    limiter: magicLinkRateLimiter,
    key,
    autoReset: false // Don't auto-reset magic link limits
  })
}

/**
 * Hook for temporary rate limiting with auto-reset
 */
export function useTemporaryRateLimit(
  maxAttempts = 5,
  windowMs = 30000,
  blockDurationMs = 60000
) {
  // Create a temporary rate limiter
  const [tempLimiter] = useState(() => 
    new (class extends RateLimiter {
      constructor() {
        super(maxAttempts, windowMs, blockDurationMs)
      }
    })()
  )
  
  return useRateLimit({
    limiter: tempLimiter,
    autoReset: true
  })
}

/**
 * Hook that provides rate limit information without state updates
 */
export function useRateLimitInfo(limiter: RateLimiter, key?: string) {
  const rateLimitKey = key || getClientKey()
  
  return {
    isRateLimited: limiter.isRateLimited(rateLimitKey),
    attempts: limiter.getAttempts(rateLimitKey),
    timeRemaining: Math.ceil(limiter.getTimeUntilUnblocked(rateLimitKey) / 1000),
    canAttempt: () => !limiter.isRateLimited(rateLimitKey)
  }
}