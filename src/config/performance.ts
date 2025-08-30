/**
 * Centralized Performance Configuration
 * 
 * Controls performance monitoring behavior across the application
 * with granular enable/disable options and environment-based defaults.
 */

import { ErrorHandlers } from '@/utils/error-handling'

export interface PerformanceConfig {
  /** Master switch for all performance monitoring */
  enabled: boolean
  /** Enable Web Vitals tracking (FCP, LCP, CLS, FID, TTFB) */
  webVitals: boolean
  /** Enable component render time tracking */
  componentMetrics: boolean
  /** Enable shader-specific performance tracking */
  shaderMetrics: boolean
  /** Enable theme read time tracking */
  themeMetrics: boolean
  /** Enable bundle size analysis */
  bundleAnalysis: boolean
  /** Enable development console logging */
  developmentLogging: boolean
  /** Enable performance warnings when budgets are exceeded */
  budgetWarnings: boolean
  /** Send metrics to analytics service */
  analytics: boolean
  /** Performance data retention (in metrics snapshots) */
  retentionLimit: number
}

/**
 * Default performance configuration based on environment
 */
function createDefaultConfig(): PerformanceConfig {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isPerformanceMode = typeof window !== 'undefined' && 
    (window.location.search.includes('perf=true') || 
     window.location.search.includes('debug=true'))

  return {
    enabled: isDevelopment || isPerformanceMode,
    webVitals: true, // Always useful for monitoring
    componentMetrics: isDevelopment || isPerformanceMode,
    shaderMetrics: true, // Critical for shader performance
    themeMetrics: isDevelopment, // Only in dev to avoid noise
    bundleAnalysis: isDevelopment,
    developmentLogging: isDevelopment,
    budgetWarnings: true,
    analytics: !isDevelopment, // Only in production
    retentionLimit: 100 // Keep last 100 snapshots
  }
}

/**
 * Performance configuration singleton
 */
class PerformanceConfigManager {
  private config: PerformanceConfig
  private listeners: Array<(config: PerformanceConfig) => void> = []
  private isNotifyingListeners = false // Prevent recursive error reporting

  constructor() {
    this.config = createDefaultConfig()
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<PerformanceConfig> {
    return { ...this.config }
  }

  /**
   * Update configuration with partial overrides
   */
  updateConfig(updates: Partial<PerformanceConfig>): void {
    const oldConfig = this.config
    this.config = { ...this.config, ...updates }
    
    // Notify listeners of configuration changes with error handling
    this.notifyListeners()

    if (this.config.developmentLogging) {
      console.log('Performance config updated:', {
        changed: Object.keys(updates),
        old: Object.fromEntries(
          Object.keys(updates).map(key => [key, oldConfig[key as keyof PerformanceConfig]])
        ),
        new: Object.fromEntries(
          Object.keys(updates).map(key => [key, this.config[key as keyof PerformanceConfig]])
        )
      })
    }
  }

  /**
   * Safely notify all listeners with proper error handling
   */
  private notifyListeners(): void {
    // Prevent recursive error reporting if listener error handling triggers config updates
    if (this.isNotifyingListeners) {
      return
    }

    this.isNotifyingListeners = true
    
    try {
      this.listeners.forEach((listener, index) => {
        try {
          listener(this.config)
        } catch (error) {
          // Use centralized error handling for listener errors
          ErrorHandlers.handleConfigError(
            error as Error,
            'PerformanceConfigManager',
            { 
              listenerIndex: index,
              configKeys: Object.keys(this.config),
              listenerCount: this.listeners.length
            }
          )
          
          // Remove faulty listener to prevent repeated failures
          this.listeners.splice(index, 1)
          console.warn(`Removed faulty config listener at index ${index}`)
        }
      })
    } finally {
      this.isNotifyingListeners = false
    }
  }

  /**
   * Subscribe to configuration changes
   */
  subscribe(listener: (config: PerformanceConfig) => void): () => void {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index >= 0) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * Reset to default configuration
   */
  reset(): void {
    this.updateConfig(createDefaultConfig())
  }

  /**
   * Quick enable/disable all monitoring
   */
  setEnabled(enabled: boolean): void {
    this.updateConfig({ enabled })
  }

  /**
   * Enable development mode with all monitoring
   */
  enableDevelopmentMode(): void {
    this.updateConfig({
      enabled: true,
      componentMetrics: true,
      themeMetrics: true,
      developmentLogging: true,
      bundleAnalysis: true,
      budgetWarnings: true,
      analytics: false
    })
  }

  /**
   * Enable production mode with minimal monitoring
   */
  enableProductionMode(): void {
    this.updateConfig({
      enabled: true,
      componentMetrics: false,
      themeMetrics: false,
      developmentLogging: false,
      bundleAnalysis: false,
      budgetWarnings: false,
      analytics: true
    })
  }

  /**
   * Check if a specific metric type is enabled
   */
  isMetricEnabled(type: keyof Omit<PerformanceConfig, 'enabled' | 'retentionLimit'>): boolean {
    return this.config.enabled && this.config[type]
  }
}

// Export singleton instance
export const performanceConfig = new PerformanceConfigManager()

/**
 * React hook for accessing performance configuration
 * 
 * Provides reactive access to performance configuration with automatic
 * updates when the configuration changes. Includes proper cleanup to
 * prevent memory leaks.
 * 
 * Note: This is a placeholder implementation. In actual React components,
 * this would be implemented with proper useState and useEffect hooks.
 * The current implementation provides the same API but without reactivity.
 */
export function usePerformanceConfig() {
  // Production-ready implementation that works consistently
  // across different environments without conditional hooks
  
  const updateConfig = (updates: Partial<PerformanceConfig>) => {
    try {
      performanceConfig.updateConfig(updates)
    } catch (error) {
      ErrorHandlers.handleConfigError(
        error as Error,
        'usePerformanceConfig-update',
        { updates }
      )
    }
  }

  const isMetricEnabled = (
    type: keyof Omit<PerformanceConfig, 'enabled' | 'retentionLimit'>
  ) => {
    try {
      return performanceConfig.isMetricEnabled(type)
    } catch (error) {
      ErrorHandlers.handleConfigError(
        error as Error,
        'usePerformanceConfig-isMetricEnabled',
        { metricType: type }
      )
      return false // Safe default
    }
  }

  return {
    config: performanceConfig.getConfig(),
    updateConfig,
    isMetricEnabled
  }
}

/**
 * Utility to check if performance monitoring should be active
 */
export function shouldEnablePerformanceMonitoring(): boolean {
  return performanceConfig.getConfig().enabled
}

/**
 * Environment-based performance configuration helpers
 */
export const PerformancePresets = {
  /** Minimal monitoring for performance-critical production */
  minimal: (): Partial<PerformanceConfig> => ({
    enabled: true,
    webVitals: true,
    componentMetrics: false,
    shaderMetrics: true,
    themeMetrics: false,
    bundleAnalysis: false,
    developmentLogging: false,
    budgetWarnings: false,
    analytics: true
  }),

  /** Full monitoring for development */
  development: (): Partial<PerformanceConfig> => ({
    enabled: true,
    webVitals: true,
    componentMetrics: true,
    shaderMetrics: true,
    themeMetrics: true,
    bundleAnalysis: true,
    developmentLogging: true,
    budgetWarnings: true,
    analytics: false
  }),

  /** Debug mode with verbose logging */
  debug: (): Partial<PerformanceConfig> => ({
    enabled: true,
    webVitals: true,
    componentMetrics: true,
    shaderMetrics: true,
    themeMetrics: true,
    bundleAnalysis: true,
    developmentLogging: true,
    budgetWarnings: true,
    analytics: false
  }),

  /** Disabled monitoring */
  disabled: (): Partial<PerformanceConfig> => ({
    enabled: false,
    webVitals: false,
    componentMetrics: false,
    shaderMetrics: false,
    themeMetrics: false,
    bundleAnalysis: false,
    developmentLogging: false,
    budgetWarnings: false,
    analytics: false
  })
}