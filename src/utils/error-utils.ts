/**
 * Centralized Error Handling Utilities for Authentication
 * 
 * Provides consistent error message extraction, classification,
 * and user-friendly error handling across auth components.
 */

/**
 * Authentication error types for better classification
 */
export enum AuthErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  RATE_LIMITED = 'RATE_LIMITED',
  INVALID_MAGIC_LINK = 'INVALID_MAGIC_LINK',
  EXPIRED_SESSION = 'EXPIRED_SESSION',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  OAUTH_ERROR = 'OAUTH_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * User-friendly error messages
 */
export const ERROR_MESSAGES = {
  [AuthErrorType.NETWORK_ERROR]: "Connection issue. Please check your internet and try again.",
  [AuthErrorType.AUTHENTICATION_FAILED]: "Authentication failed. Please check your credentials.",
  [AuthErrorType.RATE_LIMITED]: "Too many attempts. Please wait before trying again.",
  [AuthErrorType.INVALID_MAGIC_LINK]: "This magic link is invalid or has expired.",
  [AuthErrorType.EXPIRED_SESSION]: "Your session has expired. Please sign in again.",
  [AuthErrorType.VALIDATION_ERROR]: "Please check your input and try again.",
  [AuthErrorType.SERVER_ERROR]: "Something went wrong on our end. Please try again later.",
  [AuthErrorType.OAUTH_ERROR]: "OAuth authentication failed. Please try again.",
  [AuthErrorType.UNKNOWN_ERROR]: "An unexpected error occurred. Please try again."
} as const

/**
 * Default fallback messages for specific auth operations
 */
export const OPERATION_FALLBACKS = {
  MAGIC_LINK_SEND: "Failed to send magic link",
  MAGIC_LINK_VERIFY: "Magic link verification failed",
  GOOGLE_AUTH: "Google authentication failed",
  SIGN_OUT: "Sign out failed",
  EMAIL_VALIDATION: "Invalid email address"
} as const

/**
 * Structured auth error class
 */
export class AuthError extends Error {
  public readonly type: AuthErrorType
  public readonly code?: string
  public readonly context?: string
  public readonly originalError?: unknown
  public readonly timestamp: number
  public readonly isRecoverable: boolean

  constructor(
    type: AuthErrorType,
    message: string,
    options: {
      code?: string
      context?: string
      originalError?: unknown
      isRecoverable?: boolean
    } = {}
  ) {
    super(message)
    this.name = 'AuthError'
    this.type = type
    this.code = options.code
    this.context = options.context
    this.originalError = options.originalError
    this.timestamp = Date.now()
    this.isRecoverable = options.isRecoverable ?? true

    // Maintain proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthError)
    }
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    return ERROR_MESSAGES[this.type] || this.message
  }

  /**
   * Check if error suggests a retry might work
   */
  shouldRetry(): boolean {
    return this.isRecoverable && (
      this.type === AuthErrorType.NETWORK_ERROR ||
      this.type === AuthErrorType.SERVER_ERROR
    )
  }
}

/**
 * Extract error message from unknown error type
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  // Handle AuthError instances
  if (error instanceof AuthError) {
    return error.getUserMessage()
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    return error.message
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error
  }

  // Handle error-like objects
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: unknown }).message
    if (typeof message === 'string') {
      return message
    }
  }

  // Handle Stack Auth specific error format
  if (error && typeof error === 'object' && 'error' in error) {
    const stackError = (error as { error: unknown }).error
    if (typeof stackError === 'string') {
      return stackError
    }
    if (stackError && typeof stackError === 'object' && 'message' in stackError) {
      const message = (stackError as { message: unknown }).message
      if (typeof message === 'string') {
        return message
      }
    }
  }

  return fallback
}

/**
 * Classify error and return appropriate AuthError
 */
export function classifyAuthError(error: unknown, context?: string, fallbackMessage?: string): AuthError {
  const message = getErrorMessage(error, fallbackMessage || 'Unknown error occurred')
  const lowerMessage = message.toLowerCase()

  // Network errors
  if (
    lowerMessage.includes('network') ||
    lowerMessage.includes('offline') ||
    lowerMessage.includes('timeout') ||
    lowerMessage.includes('fetch') ||
    lowerMessage.includes('connection')
  ) {
    return new AuthError(AuthErrorType.NETWORK_ERROR, message, {
      context,
      originalError: error,
      isRecoverable: true
    })
  }

  // Rate limiting
  if (
    lowerMessage.includes('rate limit') ||
    lowerMessage.includes('too many') ||
    lowerMessage.includes('throttle')
  ) {
    return new AuthError(AuthErrorType.RATE_LIMITED, message, {
      context,
      originalError: error,
      isRecoverable: true
    })
  }

  // Authentication failures
  if (
    lowerMessage.includes('unauthorized') ||
    lowerMessage.includes('invalid credential') ||
    lowerMessage.includes('authentication failed') ||
    lowerMessage.includes('login failed')
  ) {
    return new AuthError(AuthErrorType.AUTHENTICATION_FAILED, message, {
      context,
      originalError: error,
      isRecoverable: false
    })
  }

  // Magic link specific errors
  if (
    lowerMessage.includes('magic link') ||
    lowerMessage.includes('verification code') ||
    lowerMessage.includes('invalid code') ||
    lowerMessage.includes('expired link')
  ) {
    return new AuthError(AuthErrorType.INVALID_MAGIC_LINK, message, {
      context,
      originalError: error,
      isRecoverable: false
    })
  }

  // OAuth specific errors
  if (
    lowerMessage.includes('oauth') ||
    lowerMessage.includes('google auth') ||
    lowerMessage.includes('social login')
  ) {
    return new AuthError(AuthErrorType.OAUTH_ERROR, message, {
      context,
      originalError: error,
      isRecoverable: true
    })
  }

  // Session/token errors
  if (
    lowerMessage.includes('expired') ||
    lowerMessage.includes('session') ||
    lowerMessage.includes('token')
  ) {
    return new AuthError(AuthErrorType.EXPIRED_SESSION, message, {
      context,
      originalError: error,
      isRecoverable: false
    })
  }

  // Server errors
  if (
    lowerMessage.includes('server error') ||
    lowerMessage.includes('internal error') ||
    lowerMessage.includes('500') ||
    lowerMessage.includes('503')
  ) {
    return new AuthError(AuthErrorType.SERVER_ERROR, message, {
      context,
      originalError: error,
      isRecoverable: true
    })
  }

  // Validation errors
  if (
    lowerMessage.includes('invalid') ||
    lowerMessage.includes('required') ||
    lowerMessage.includes('format') ||
    lowerMessage.includes('validation')
  ) {
    return new AuthError(AuthErrorType.VALIDATION_ERROR, message, {
      context,
      originalError: error,
      isRecoverable: true
    })
  }

  // Default to unknown error
  return new AuthError(AuthErrorType.UNKNOWN_ERROR, message, {
    context,
    originalError: error,
    isRecoverable: true
  })
}

/**
 * Create auth error with context
 */
export function createAuthError(
  error: unknown,
  context: string,
  fallback?: string
): AuthError {
  // Extract message for context, then classify the error
  const message = fallback ? getErrorMessage(error, fallback) : undefined
  return classifyAuthError(error, context, message)
}

/**
 * Type guard to check if error is AuthError
 */
export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError
}

/**
 * Get error code from Stack Auth errors
 */
export function getErrorCode(error: unknown): string | null {
  // Handle Stack Auth specific error codes
  if (error && typeof error === 'object') {
    if ('code' in error && typeof (error as { code: unknown }).code === 'string') {
      return (error as { code: string }).code
    }
    if ('error_code' in error && typeof (error as { error_code: unknown }).error_code === 'string') {
      return (error as { error_code: string }).error_code
    }
    if ('status' in error && typeof (error as { status: unknown }).status === 'number') {
      return String((error as { status: number }).status)
    }
  }
  
  return null
}

/**
 * Enhanced error handling for auth operations
 */
export const AuthErrorHandlers = {
  /**
   * Handle magic link sending errors
   */
  handleMagicLinkSendError: (error: unknown): string => {
    const authError = createAuthError(error, 'magic-link-send', OPERATION_FALLBACKS.MAGIC_LINK_SEND)
    
    // Special handling for rate limiting
    if (authError.type === AuthErrorType.RATE_LIMITED) {
      return 'Too many magic link requests. Please wait a few minutes before trying again.'
    }
    
    return authError.getUserMessage()
  },

  /**
   * Handle magic link verification errors
   */
  handleMagicLinkVerifyError: (error: unknown): string => {
    const authError = createAuthError(error, 'magic-link-verify', OPERATION_FALLBACKS.MAGIC_LINK_VERIFY)
    
    // Special handling for expired links
    if (authError.type === AuthErrorType.INVALID_MAGIC_LINK) {
      return 'This magic link has expired or is invalid. Please request a new one.'
    }
    
    return authError.getUserMessage()
  },

  /**
   * Handle OAuth authentication errors
   */
  handleOAuthError: (error: unknown): string => {
    const authError = createAuthError(error, 'oauth', OPERATION_FALLBACKS.GOOGLE_AUTH)
    
    // Special handling for OAuth-specific issues
    if (authError.type === AuthErrorType.OAUTH_ERROR) {
      return 'Google sign-in was cancelled or failed. Please try again.'
    }
    
    return authError.getUserMessage()
  },

  /**
   * Handle general authentication errors
   */
  handleAuthError: (error: unknown, operation: string): string => {
    const authError = classifyAuthError(error, operation)
    return authError.getUserMessage()
  }
}

/**
 * Error recovery suggestions
 */
export function getErrorRecoveryActions(error: AuthError): Array<{
  label: string
  action: string
  primary: boolean
}> {
  const actions = []

  switch (error.type) {
    case AuthErrorType.NETWORK_ERROR:
      actions.push(
        { label: 'Try Again', action: 'retry', primary: true },
        { label: 'Check Connection', action: 'check-network', primary: false }
      )
      break

    case AuthErrorType.RATE_LIMITED:
      actions.push(
        { label: 'Wait and Retry', action: 'wait-retry', primary: true }
      )
      break

    case AuthErrorType.INVALID_MAGIC_LINK:
      actions.push(
        { label: 'Request New Link', action: 'new-magic-link', primary: true },
        { label: 'Try Different Method', action: 'switch-method', primary: false }
      )
      break

    case AuthErrorType.OAUTH_ERROR:
      actions.push(
        { label: 'Try Google Again', action: 'retry-oauth', primary: true },
        { label: 'Use Email Instead', action: 'switch-email', primary: false }
      )
      break

    case AuthErrorType.SERVER_ERROR:
      actions.push(
        { label: 'Try Again', action: 'retry', primary: true },
        { label: 'Contact Support', action: 'contact-support', primary: false }
      )
      break

    default:
      actions.push(
        { label: 'Try Again', action: 'retry', primary: true }
      )
  }

  return actions
}