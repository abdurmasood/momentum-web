/**
 * Stack Auth error codes constants
 * Provides type-safe error code handling for authentication middleware
 */
export const STACK_AUTH_ERROR_CODES = {
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  TIMEOUT: 'TIMEOUT'
} as const

export type StackAuthErrorCode = typeof STACK_AUTH_ERROR_CODES[keyof typeof STACK_AUTH_ERROR_CODES]

/**
 * Helper function to check if an error code is a redirect-worthy auth error
 */
export function isAuthRedirectError(code: string): boolean {
  return code === STACK_AUTH_ERROR_CODES.UNAUTHENTICATED || 
         code === STACK_AUTH_ERROR_CODES.UNAUTHORIZED
}

/**
 * Helper function to check if an error code indicates service unavailability
 */
export function isServiceUnavailableError(code: string): boolean {
  return code === STACK_AUTH_ERROR_CODES.SERVICE_UNAVAILABLE || 
         code === STACK_AUTH_ERROR_CODES.TIMEOUT
}