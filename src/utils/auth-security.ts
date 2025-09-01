/**
 * Authentication Security Utilities
 * 
 * Provides additional security layers for authentication flows
 * including CSRF protection, rate limiting, and input validation.
 */

/**
 * Generate a cryptographically secure nonce for form submissions
 */
export function generateNonce(): string {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }
  
  // Client-side with crypto API
  if (window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(16)
    window.crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }
  
  // Fallback for older browsers
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

/**
 * Validate request origin against expected domains
 */
export function isValidOrigin(origin?: string): boolean {
  if (!origin || typeof window === 'undefined') {
    return false
  }
  
  const currentOrigin = window.location.origin
  const allowedOrigins = [
    currentOrigin,
    'http://localhost:3000',
    'https://localhost:3000',
    // Add your production domain here
  ]
  
  return allowedOrigins.includes(origin)
}

/**
 * Validate referer header to prevent CSRF
 */
export function isValidReferer(): boolean {
  if (typeof document === 'undefined') {
    return false
  }
  
  const referer = document.referrer
  if (!referer) {
    // Allow requests without referer (direct navigation)
    return true
  }
  
  return isValidOrigin(new URL(referer).origin)
}

/**
 * Basic input sanitization
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/[<>]/g, '') // Remove angle brackets
    .substring(0, 500) // Limit length
}

/**
 * Validate email format with additional security checks
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }
  
  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  // Additional security checks
  const sanitized = sanitizeInput(email)
  if (sanitized !== email) {
    return false // Input was modified during sanitization
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /<script/i,
    /onload=/i,
    /onerror=/i
  ]
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(email)) {
      return false
    }
  }
  
  return emailRegex.test(email) && email.length <= 254 // RFC 5321 limit
}

/**
 * Rate limiting storage interface
 */
interface RateLimitEntry {
  attempts: number
  firstAttempt: number
  lastAttempt: number
}

/**
 * Persistent storage adapter for rate limiting
 */
interface StorageAdapter {
  get(key: string): RateLimitEntry | null
  set(key: string, value: RateLimitEntry): void
  delete(key: string): void
  clear(): void
  getAllKeys(): string[]
}

/**
 * LocalStorage adapter with fallback to sessionStorage
 */
class PersistentStorageAdapter implements StorageAdapter {
  private storage: Storage
  private prefix: string
  
  constructor(prefix = 'rl_') {
    this.prefix = prefix
    // Try localStorage first, fall back to sessionStorage
    try {
      localStorage.setItem('__test__', 'test')
      localStorage.removeItem('__test__')
      this.storage = localStorage
    } catch {
      try {
        sessionStorage.setItem('__test__', 'test')
        sessionStorage.removeItem('__test__')
        this.storage = sessionStorage
      } catch {
        // If both fail, create a mock storage that doesn't persist
        this.storage = {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
          clear: () => {},
          length: 0,
          key: () => null
        }
      }
    }
    
    // Clean up expired entries on initialization
    this.cleanup()
  }
  
  get(key: string): RateLimitEntry | null {
    try {
      const item = this.storage.getItem(this.prefix + key)
      if (!item) return null
      
      const parsed = JSON.parse(item)
      // Validate the structure
      if (typeof parsed.attempts === 'number' && 
          typeof parsed.firstAttempt === 'number' && 
          typeof parsed.lastAttempt === 'number') {
        return parsed
      }
      return null
    } catch {
      // If parsing fails, remove the corrupted entry
      this.delete(key)
      return null
    }
  }
  
  set(key: string, value: RateLimitEntry): void {
    try {
      this.storage.setItem(this.prefix + key, JSON.stringify(value))
    } catch {
      // Storage quota exceeded - clean up old entries and retry
      this.cleanup()
      try {
        this.storage.setItem(this.prefix + key, JSON.stringify(value))
      } catch (retryError) {
        console.warn('Rate limiting storage failed:', retryError)
      }
    }
  }
  
  delete(key: string): void {
    try {
      this.storage.removeItem(this.prefix + key)
    } catch {
      // Ignore errors when deleting
    }
  }
  
  clear(): void {
    try {
      const keys = this.getAllKeys()
      keys.forEach(key => this.delete(key.replace(this.prefix, '')))
    } catch {
      // Fallback - clear entire storage if selective clear fails
      try {
        this.storage.clear()
      } catch {
        // Ignore errors
      }
    }
  }
  
  getAllKeys(): string[] {
    const keys: string[] = []
    try {
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i)
        if (key && key.startsWith(this.prefix)) {
          keys.push(key)
        }
      }
    } catch {
      // Return empty array if enumeration fails
    }
    return keys
  }
  
  /**
   * Clean up expired entries to free storage space
   */
  private cleanup(): void {
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours
    
    try {
      const keys = this.getAllKeys()
      keys.forEach(fullKey => {
        const key = fullKey.replace(this.prefix, '')
        const entry = this.get(key)
        if (entry && (now - entry.lastAttempt > maxAge)) {
          this.delete(key)
        }
      })
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Enhanced rate limiting implementation with persistent storage
 */
export class RateLimiter {
  private cache: Map<string, RateLimitEntry> = new Map()
  private persistentStorage: StorageAdapter
  private maxAttempts: number
  private windowMs: number
  private blockDurationMs: number
  
  constructor(maxAttempts = 3, windowMs = 60000, blockDurationMs = 300000, storagePrefix?: string) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
    this.blockDurationMs = blockDurationMs
    
    // Initialize persistent storage with unique prefix
    if (typeof window !== 'undefined') {
      const prefix = storagePrefix || `rl_${Math.random().toString(36).substring(2, 8)}_`
      this.persistentStorage = new PersistentStorageAdapter(prefix)
    } else {
      // Server-side fallback - use in-memory only
      this.persistentStorage = {
        get: () => null,
        set: () => {},
        delete: () => {},
        clear: () => {},
        getAllKeys: () => []
      }
    }
  }
  
  /**
   * Get entry from cache or persistent storage
   */
  private getEntry(key: string): RateLimitEntry | null {
    // Check cache first for performance
    let entry = this.cache.get(key)
    if (!entry) {
      // Load from persistent storage
      entry = this.persistentStorage.get(key)
      if (entry) {
        // Cache it for future access
        this.cache.set(key, entry)
      }
    }
    return entry
  }
  
  /**
   * Save entry to both cache and persistent storage
   */
  private setEntry(key: string, entry: RateLimitEntry): void {
    this.cache.set(key, entry)
    this.persistentStorage.set(key, entry)
  }
  
  /**
   * Delete entry from both cache and persistent storage
   */
  private deleteEntry(key: string): void {
    this.cache.delete(key)
    this.persistentStorage.delete(key)
  }
  
  /**
   * Check if an action is rate limited
   */
  isRateLimited(key: string): boolean {
    const now = Date.now()
    const entry = this.getEntry(key)
    
    if (!entry) {
      return false
    }
    
    // Clean up old entries
    if (now - entry.lastAttempt > this.blockDurationMs) {
      this.deleteEntry(key)
      return false
    }
    
    // Check if within rate limit window
    if (now - entry.firstAttempt > this.windowMs) {
      // Reset window
      this.setEntry(key, {
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now
      })
      return false
    }
    
    return entry.attempts >= this.maxAttempts
  }
  
  /**
   * Record an attempt
   */
  recordAttempt(key: string): void {
    const now = Date.now()
    const entry = this.getEntry(key)
    
    if (!entry || now - entry.firstAttempt > this.windowMs) {
      // New window
      this.setEntry(key, {
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now
      })
    } else {
      // Within window
      this.setEntry(key, {
        attempts: entry.attempts + 1,
        firstAttempt: entry.firstAttempt,
        lastAttempt: now
      })
    }
  }
  
  /**
   * Get remaining time until unblocked (in ms)
   */
  getTimeUntilUnblocked(key: string): number {
    const entry = this.getEntry(key)
    if (!entry || entry.attempts < this.maxAttempts) {
      return 0
    }
    
    const timeRemaining = this.blockDurationMs - (Date.now() - entry.lastAttempt)
    return Math.max(0, timeRemaining)
  }
  
  /**
   * Get attempts count for key
   */
  getAttempts(key: string): number {
    const entry = this.getEntry(key)
    return entry?.attempts || 0
  }
  
  /**
   * Clear rate limit for key
   */
  clear(key: string): void {
    this.deleteEntry(key)
  }
  
  /**
   * Clear all rate limits
   */
  clearAll(): void {
    this.cache.clear()
    this.persistentStorage.clear()
  }
}

/**
 * Global rate limiter instances
 */
export const authRateLimiter = new RateLimiter(3, 60000, 300000, 'rl_auth_') // 3 attempts per minute, 5 min block
export const magicLinkRateLimiter = new RateLimiter(2, 300000, 600000, 'rl_magic_') // 2 magic links per 5 min, 10 min block

/**
 * Validation for form submissions
 */
export interface FormValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Comprehensive form validation
 */
export function validateFormSubmission(email: string, honeypot?: string): FormValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Check honeypot (should be empty)
  if (honeypot && honeypot.trim() !== '') {
    errors.push('Bot detection failed')
  }
  
  // Validate email
  if (!email || !isValidEmail(email)) {
    errors.push('Please enter a valid email address')
  }
  
  // Check referer
  if (!isValidReferer()) {
    warnings.push('Request origin validation failed')
  }
  
  // Rate limiting check
  const clientKey = getClientKey()
  if (authRateLimiter.isRateLimited(clientKey)) {
    const timeRemaining = Math.ceil(authRateLimiter.getTimeUntilUnblocked(clientKey) / 1000 / 60)
    errors.push(`Too many attempts. Please try again in ${timeRemaining} minute(s)`)
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Get a client identifier for rate limiting
 * Balances security with privacy by using non-invasive browser properties
 */
export function getClientKey(): string {
  if (typeof window === 'undefined') {
    return 'server'
  }
  
  // Combine multiple factors for client identification
  const factors = [
    window.navigator.userAgent.substring(0, 50),
    window.location.origin,
    `${window.screen.width}x${window.screen.height}`,
    new Date().getTimezoneOffset().toString(),
    navigator.language || 'en',
    window.screen.colorDepth?.toString() || '24'
  ]
  
  // Create a hash for consistent length and better distribution
  const combined = factors.join('|')
  let hash = 0
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  // Convert to positive hex string and ensure consistent length
  const hashStr = Math.abs(hash).toString(16).padStart(8, '0')
  return `client_${hashStr}`
}

/**
 * Security headers validation (client-side checks)
 */
export function validateSecurityHeaders(): boolean {
  if (typeof window === 'undefined') {
    return true
  }
  
  // Check if running over HTTPS in production
  if (process.env.NODE_ENV === 'production' && window.location.protocol !== 'https:') {
    console.warn('Security warning: Not running over HTTPS in production')
    return false
  }
  
  return true
}

/**
 * Generate form security context
 */
export interface FormSecurityContext {
  nonce: string
  timestamp: number
  clientKey: string
}

export function generateFormSecurityContext(): FormSecurityContext {
  return {
    nonce: generateNonce(),
    timestamp: Date.now(),
    clientKey: getClientKey()
  }
}

/**
 * Validate form security context
 */
export function validateFormSecurityContext(context: FormSecurityContext, maxAge = 600000): boolean {
  const now = Date.now()
  
  // Check timestamp (max 10 minutes old by default)
  if (now - context.timestamp > maxAge) {
    return false
  }
  
  // Validate nonce format
  if (!context.nonce || context.nonce.length < 8) {
    return false
  }
  
  // Validate client key
  if (context.clientKey !== getClientKey()) {
    return false
  }
  
  return true
}