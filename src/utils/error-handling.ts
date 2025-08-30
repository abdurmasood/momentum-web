/**
 * Centralized Error Handling Utilities
 * 
 * Provides consistent error types, classification, and reporting
 * across the application with production-ready error management.
 */

/**
 * Application-specific error types for better error classification
 */
export enum ErrorType {
  SHADER_ERROR = 'SHADER_ERROR',
  THEME_ERROR = 'THEME_ERROR',
  PERFORMANCE_ERROR = 'PERFORMANCE_ERROR',
  COMPONENT_ERROR = 'COMPONENT_ERROR',
  INTERSECTION_OBSERVER_ERROR = 'INTERSECTION_OBSERVER_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Error severity levels for prioritizing error handling
 */
export enum ErrorSeverity {
  LOW = 'low',        // Minor issues, graceful degradation possible
  MEDIUM = 'medium',  // Moderate issues, some functionality affected
  HIGH = 'high',      // Major issues, significant functionality lost
  CRITICAL = 'critical' // Critical issues, app potentially unusable
}

/**
 * Structured error information for consistent error reporting
 */
export interface ErrorInfo {
  type: ErrorType
  severity: ErrorSeverity
  message: string
  originalError?: Error
  component?: string
  timestamp: number
  userAgent?: string
  url?: string
  additionalContext?: Record<string, unknown>
}

/**
 * Custom application error class with enhanced metadata
 */
export class AppError extends Error {
  public readonly type: ErrorType
  public readonly severity: ErrorSeverity
  public readonly timestamp: number
  public readonly component?: string
  public readonly additionalContext?: Record<string, unknown>

  constructor(
    type: ErrorType,
    severity: ErrorSeverity,
    message: string,
    component?: string,
    additionalContext?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'AppError'
    this.type = type
    this.severity = severity
    this.timestamp = Date.now()
    this.component = component
    this.additionalContext = additionalContext

    // Maintain proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }

  /**
   * Convert to structured error info
   */
  toErrorInfo(): ErrorInfo {
    return {
      type: this.type,
      severity: this.severity,
      message: this.message,
      originalError: this,
      component: this.component,
      timestamp: this.timestamp,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      additionalContext: this.additionalContext
    }
  }
}

/**
 * Error classification utility
 */
export function classifyError(error: Error): { type: ErrorType; severity: ErrorSeverity } {
  const message = error.message.toLowerCase()
  const stack = error.stack?.toLowerCase() || ''

  // Shader-related errors
  if (message.includes('webgl') || message.includes('shader') || message.includes('meshgradient')) {
    return { type: ErrorType.SHADER_ERROR, severity: ErrorSeverity.MEDIUM }
  }

  // Theme-related errors
  if (message.includes('theme') || message.includes('css variable') || message.includes('color')) {
    return { type: ErrorType.THEME_ERROR, severity: ErrorSeverity.LOW }
  }

  // Performance monitoring errors
  if (message.includes('performance') || message.includes('observer') || message.includes('metric')) {
    return { type: ErrorType.PERFORMANCE_ERROR, severity: ErrorSeverity.LOW }
  }

  // Intersection observer errors
  if (message.includes('intersection') || message.includes('observer')) {
    return { type: ErrorType.INTERSECTION_OBSERVER_ERROR, severity: ErrorSeverity.LOW }
  }

  // Component rendering errors
  if (message.includes('render') || message.includes('component') || stack.includes('react')) {
    return { type: ErrorType.COMPONENT_ERROR, severity: ErrorSeverity.HIGH }
  }

  // Network errors
  if (message.includes('network') || message.includes('fetch') || message.includes('load')) {
    return { type: ErrorType.NETWORK_ERROR, severity: ErrorSeverity.MEDIUM }
  }

  // Validation errors
  if (message.includes('validation') || message.includes('invalid') || message.includes('expected')) {
    return { type: ErrorType.VALIDATION_ERROR, severity: ErrorSeverity.MEDIUM }
  }

  return { type: ErrorType.UNKNOWN_ERROR, severity: ErrorSeverity.MEDIUM }
}

/**
 * Error reporting interface
 */
interface ErrorReporter {
  report(errorInfo: ErrorInfo): void
}

/**
 * Console error reporter for development
 */
class ConsoleErrorReporter implements ErrorReporter {
  report(errorInfo: ErrorInfo): void {
    const { type, severity, message, component, timestamp } = errorInfo

    const prefix = severity === ErrorSeverity.CRITICAL ? '🚨' : 
                  severity === ErrorSeverity.HIGH ? '❌' : 
                  severity === ErrorSeverity.MEDIUM ? '⚠️' : '💡'

    console.group(`${prefix} ${type} (${severity})`)
    console.error(`Message: ${message}`)
    if (component) console.log(`Component: ${component}`)
    console.log(`Timestamp: ${new Date(timestamp).toISOString()}`)
    if (errorInfo.additionalContext) {
      console.log('Context:', errorInfo.additionalContext)
    }
    if (errorInfo.originalError?.stack) {
      console.log('Stack:', errorInfo.originalError.stack)
    }
    console.groupEnd()
  }
}

/**
 * Analytics error reporter for production (placeholder)
 */
class AnalyticsErrorReporter implements ErrorReporter {
  report(errorInfo: ErrorInfo): void {
    // In production, this would send to analytics service
    if (process.env.NODE_ENV === 'production') {
      // Example: send to analytics service
      // analytics.track('error', errorInfo)
      console.warn('Error logged to analytics:', {
        type: errorInfo.type,
        severity: errorInfo.severity,
        component: errorInfo.component
      })
    }
  }
}

/**
 * Centralized error reporting manager
 */
class ErrorReportingManager {
  private reporters: ErrorReporter[] = []

  constructor() {
    // Set up default reporters based on environment
    if (process.env.NODE_ENV === 'development') {
      this.addReporter(new ConsoleErrorReporter())
    } else {
      this.addReporter(new AnalyticsErrorReporter())
    }
  }

  addReporter(reporter: ErrorReporter): void {
    this.reporters.push(reporter)
  }

  removeReporter(reporter: ErrorReporter): void {
    const index = this.reporters.indexOf(reporter)
    if (index >= 0) {
      this.reporters.splice(index, 1)
    }
  }

  reportError(error: Error | AppError, component?: string, additionalContext?: Record<string, unknown>): void {
    try {
      let errorInfo: ErrorInfo

      if (error instanceof AppError) {
        errorInfo = error.toErrorInfo()
      } else {
        const classification = classifyError(error)
        errorInfo = {
          type: classification.type,
          severity: classification.severity,
          message: error.message,
          originalError: error,
          component,
          timestamp: Date.now(),
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          url: typeof window !== 'undefined' ? window.location.href : undefined,
          additionalContext
        }
      }

      // Report to all configured reporters
      this.reporters.forEach(reporter => {
        try {
          reporter.report(errorInfo)
        } catch (reporterError) {
          console.error('Error reporter failed:', reporterError)
        }
      })
    } catch (handlingError) {
      // Fallback error handling
      console.error('Error handling failed:', handlingError, 'Original error:', error)
    }
  }
}

// Export singleton instance
export const errorReporter = new ErrorReportingManager()

/**
 * Convenience functions for common error scenarios
 */
export const ErrorHandlers = {
  /**
   * Handle shader-related errors with graceful degradation
   */
  handleShaderError: (error: Error, component?: string) => {
    const appError = new AppError(
      ErrorType.SHADER_ERROR,
      ErrorSeverity.MEDIUM,
      `Shader error: ${error.message}`,
      component,
      { canFallback: true, affectsVisuals: true }
    )
    errorReporter.reportError(appError)
    return appError
  },

  /**
   * Handle theme-related errors with fallback
   */
  handleThemeError: (error: Error, component?: string) => {
    const appError = new AppError(
      ErrorType.THEME_ERROR,
      ErrorSeverity.LOW,
      `Theme error: ${error.message}`,
      component,
      { canFallback: true, affectsVisuals: false }
    )
    errorReporter.reportError(appError)
    return appError
  },

  /**
   * Handle component errors with error boundary info
   */
  handleComponentError: (error: Error, component?: string, errorInfo?: React.ErrorInfo) => {
    const appError = new AppError(
      ErrorType.COMPONENT_ERROR,
      ErrorSeverity.HIGH,
      `Component error: ${error.message}`,
      component,
      { errorInfo: errorInfo?.componentStack }
    )
    errorReporter.reportError(appError)
    return appError
  },

  /**
   * Handle performance monitoring errors (non-critical)
   */
  handlePerformanceError: (error: Error, metric?: string) => {
    const appError = new AppError(
      ErrorType.PERFORMANCE_ERROR,
      ErrorSeverity.LOW,
      `Performance monitoring error: ${error.message}`,
      'PerformanceMonitor',
      { metric, affectsFunctionality: false }
    )
    errorReporter.reportError(appError)
    return appError
  }
}

/**
 * Error boundary hook for React components
 */
export function useErrorHandler(componentName?: string) {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    ErrorHandlers.handleComponentError(error, componentName, errorInfo)
  }
}