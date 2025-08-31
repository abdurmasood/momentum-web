/**
 * Authentication Error Boundary Component
 * 
 * Provides error boundaries specifically for auth components with
 * recovery actions and fallback UI.
 */

"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AuthError, isAuthError, getErrorRecoveryActions, classifyAuthError } from '@/utils/error-utils'
import ShaderBackground from '@/components/shader-background'

/**
 * Props for AuthErrorBoundary component
 */
interface AuthErrorBoundaryProps {
  children: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  fallback?: ReactNode
  showRetry?: boolean
}

/**
 * State for AuthErrorBoundary component
 */
interface AuthErrorBoundaryState {
  hasError: boolean
  error: AuthError | null
  retryCount: number
}

/**
 * Error boundary specifically designed for authentication components
 */
export class AuthErrorBoundary extends Component<AuthErrorBoundaryProps, AuthErrorBoundaryState> {
  private readonly maxRetries = 3

  constructor(props: AuthErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<AuthErrorBoundaryState> {
    const authError = isAuthError(error) ? error : classifyAuthError(error, 'error-boundary')
    
    return {
      hasError: true,
      error: authError
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const authError = isAuthError(error) ? error : classifyAuthError(error, 'error-boundary')
    
    // Call error handler if provided
    this.props.onError?.(error, errorInfo)
    
    // Log error details for debugging
    console.error('Auth Error Boundary caught an error:', {
      error: authError,
      errorInfo,
      context: 'AuthErrorBoundary',
      retryCount: this.state.retryCount
    })
  }

  /**
   * Handle retry attempt
   */
  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        retryCount: prevState.retryCount + 1
      }))
    }
  }

  /**
   * Handle error recovery action
   */
  handleRecoveryAction = (action: string) => {
    switch (action) {
      case 'retry':
        this.handleRetry()
        break
      case 'reload':
        window.location.reload()
        break
      case 'go-home':
        window.location.href = '/'
        break
      case 'new-magic-link':
        // Navigate to auth page for new magic link
        window.location.href = '/auth/sign-in'
        break
      case 'switch-method':
        // Navigate to auth page to try different method
        window.location.href = '/auth/sign-in'
        break
      case 'contact-support':
        // Could open support modal or navigate to support page
        window.open('mailto:support@example.com', '_blank')
        break
      default:
        this.handleRetry()
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { error } = this.state
      const recoveryActions = getErrorRecoveryActions(error)
      const canRetry = this.props.showRetry !== false && 
                      this.state.retryCount < this.maxRetries && 
                      error.shouldRetry()

      return (
        <ShaderBackground hideCircle>
          <div className="min-h-screen flex items-center justify-center relative z-10">
            <div className="w-full max-w-md p-8 text-center">
              {/* Error Icon */}
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-red-600/20 border border-red-600/30 flex items-center justify-center shadow-lg">
                  <svg 
                    className="w-8 h-8 text-red-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
                    />
                  </svg>
                </div>
              </div>

              {/* Error Title */}
              <h1 className="text-2xl font-light text-slate-100 mb-4">
                Authentication <span className="font-medium italic instrument">Error</span>
              </h1>

              {/* Error Message */}
              <p className="text-sm text-red-300 mb-6 font-light">
                {error.getUserMessage()}
              </p>

              {/* Retry Information */}
              {this.state.retryCount > 0 && (
                <p className="text-xs text-slate-400 mb-4">
                  Attempt {this.state.retryCount + 1} of {this.maxRetries + 1}
                </p>
              )}

              {/* Recovery Actions */}
              <div className="flex flex-col gap-3">
                {recoveryActions.map((action) => (
                  <button
                    key={action.action}
                    onClick={() => this.handleRecoveryAction(action.action)}
                    className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 shadow-lg ${
                      action.primary
                        ? 'bg-blue-500/80 backdrop-blur-sm border border-blue-400/30 text-white hover:bg-blue-600/90 hover:border-blue-300/40'
                        : 'bg-transparent border border-white/25 text-slate-300 font-light hover:bg-white/10 hover:text-white'
                    }`}
                    disabled={action.action === 'retry' && !canRetry}
                  >
                    {action.label}
                    {action.action === 'retry' && !canRetry && ' (Max attempts reached)'}
                  </button>
                ))}
              </div>

              {/* Additional Help */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-xs text-slate-500 mb-2">
                  Error Code: {error.type}
                </p>
                {error.context && (
                  <p className="text-xs text-slate-500 mb-2">
                    Context: {error.context}
                  </p>
                )}
                <p className="text-xs text-slate-500">
                  If this problem persists, please contact support
                </p>
              </div>
            </div>
          </div>
        </ShaderBackground>
      )
    }

    return this.props.children
  }
}

/**
 * HOC wrapper for components that need error boundary protection
 */
export function withAuthErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<AuthErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => {
    return (
      <AuthErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </AuthErrorBoundary>
    )
  }

  WrappedComponent.displayName = `withAuthErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

/**
 * Simplified error boundary for minimal error handling
 */
export function SimpleAuthErrorBoundary({ 
  children, 
  onError 
}: { 
  children: ReactNode
  onError?: (error: Error) => void 
}) {
  return (
    <AuthErrorBoundary
      onError={(error) => onError?.(error)}
      showRetry={true}
    >
      {children}
    </AuthErrorBoundary>
  )
}