"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { debounce } from '@/utils/debounce'
import { 
  validateAndNormalizeColor, 
  validateAndClampFilterValue 
} from '@/utils/color-validation'
import {
  DEFAULT_FILTER_VALUES,
  DEFAULT_GRADIENT_COLORS,
  DEFAULT_SELECTION_COLORS,
  CSS_VARIABLES,
  type ThemeColors,
} from '@/constants/theme'

/**
 * Configuration options for the theme observer hook
 */
interface UseThemeColorsObserverOptions {
  /** Debounce delay in milliseconds for theme updates */
  debounceMs?: number
  /** Enable MutationObserver for dynamic theme changes */
  observeChanges?: boolean
  /** Enable performance logging in development */
  enablePerformanceLogging?: boolean
}

/**
 * Enhanced theme colors hook with dynamic observation and debouncing
 * 
 * This hook extends the basic useThemeColors functionality by:
 * - Observing CSS variable changes with MutationObserver
 * - Debouncing updates to prevent excessive re-renders
 * - Providing performance metrics in development
 * - Graceful fallback to static behavior when needed
 */
export function useThemeColorsWithObserver(
  options: UseThemeColorsObserverOptions = {}
): ThemeColors & { isObserving: boolean; updateCount: number } {
  const {
    debounceMs = 100,
    observeChanges = true,
    enablePerformanceLogging = process.env.NODE_ENV === 'development'
  } = options

  // State for theme colors and observer status
  const [colors, setColors] = useState<ThemeColors>(() => readThemeColors())
  const [isObserving, setIsObserving] = useState(false)
  const updateCountRef = useRef(0)

  // Performance tracking
  const performanceRef = useRef({
    lastReadTime: 0,
    totalReads: 0,
    averageReadTime: 0
  })

  /**
   * Returns default theme colors for fallback scenarios
   */
  const getDefaultThemeColors = useCallback((): ThemeColors => ({
    filterValues: DEFAULT_FILTER_VALUES,
    gradientColors: {
      primary: [
        DEFAULT_GRADIENT_COLORS.navyDeep,
        DEFAULT_GRADIENT_COLORS.navyMedium,
        DEFAULT_GRADIENT_COLORS.grayMedium,
        DEFAULT_GRADIENT_COLORS.navyDarker,
        DEFAULT_GRADIENT_COLORS.blueDeep,
      ],
      secondary: [
        DEFAULT_GRADIENT_COLORS.navyDeep,
        DEFAULT_GRADIENT_COLORS.blueMedium,
        DEFAULT_GRADIENT_COLORS.blueBright,
        DEFAULT_GRADIENT_COLORS.navyMedium,
      ],
    },
    selectionColors: DEFAULT_SELECTION_COLORS,
  }), [])

  /**
   * Reads theme colors from CSS variables with validation and performance tracking
   */
  const readThemeColors = useCallback((): ThemeColors => {
    const startTime = enablePerformanceLogging ? performance.now() : 0

    // SSR safety check
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return getDefaultThemeColors()
    }

    try {
      const computedStyle = getComputedStyle(document.documentElement)

      // Helper function to safely parse CSS variables with validation
      const getCSSVariable = (variable: string, fallback: string | number): string | number => {
        try {
          const value = computedStyle.getPropertyValue(variable).trim()
          if (!value) return fallback
          
          // Validate and process based on type
          if (typeof fallback === 'number') {
            const parsed = parseFloat(value)
            return validateAndClampFilterValue(
              parsed, 
              fallback as number, 
              variable.replace('--', '')
            )
          } else {
            return validateAndNormalizeColor(
              value, 
              fallback as string, 
              variable.replace('--', '')
            )
          }
        } catch (error) {
          console.warn(`Failed to read CSS variable ${variable}:`, error)
          return fallback
        }
      }

      // Read filter values with validation
      const filterValues = {
        r: getCSSVariable(CSS_VARIABLES.FILTER.GLASS_R, DEFAULT_FILTER_VALUES.r) as number,
        g: getCSSVariable(CSS_VARIABLES.FILTER.GLASS_G, DEFAULT_FILTER_VALUES.g) as number,
        b: getCSSVariable(CSS_VARIABLES.FILTER.GLASS_B, DEFAULT_FILTER_VALUES.b) as number,
        opacity: getCSSVariable(CSS_VARIABLES.FILTER.GLASS_OPACITY, DEFAULT_FILTER_VALUES.opacity) as number,
      }

      // Read gradient colors with validation
      const gradientColors = {
        navyDeep: getCSSVariable(CSS_VARIABLES.SHADER.NAVY_DEEP, DEFAULT_GRADIENT_COLORS.navyDeep) as string,
        navyMedium: getCSSVariable(CSS_VARIABLES.SHADER.NAVY_MEDIUM, DEFAULT_GRADIENT_COLORS.navyMedium) as string,
        grayMedium: getCSSVariable(CSS_VARIABLES.SHADER.GRAY_MEDIUM, DEFAULT_GRADIENT_COLORS.grayMedium) as string,
        navyDarker: getCSSVariable(CSS_VARIABLES.SHADER.NAVY_DARKER, DEFAULT_GRADIENT_COLORS.navyDarker) as string,
        blueDeep: getCSSVariable(CSS_VARIABLES.SHADER.BLUE_DEEP, DEFAULT_GRADIENT_COLORS.blueDeep) as string,
        blueMedium: getCSSVariable(CSS_VARIABLES.SHADER.BLUE_MEDIUM, DEFAULT_GRADIENT_COLORS.blueMedium) as string,
        blueBright: getCSSVariable(CSS_VARIABLES.SHADER.BLUE_BRIGHT, DEFAULT_GRADIENT_COLORS.blueBright) as string,
      }

      // Read selection colors with validation
      const selectionColors = {
        lightBg: getCSSVariable(CSS_VARIABLES.SELECTION.BG, DEFAULT_SELECTION_COLORS.lightBg) as string,
        lightText: getCSSVariable(CSS_VARIABLES.SELECTION.TEXT, DEFAULT_SELECTION_COLORS.lightText) as string,
        darkBg: getCSSVariable(CSS_VARIABLES.SELECTION.BG, DEFAULT_SELECTION_COLORS.darkBg) as string,
        darkText: getCSSVariable(CSS_VARIABLES.SELECTION.TEXT, DEFAULT_SELECTION_COLORS.darkText) as string,
      }

      const result = {
        filterValues,
        gradientColors: {
          primary: [
            gradientColors.navyDeep,
            gradientColors.navyMedium,
            gradientColors.grayMedium,
            gradientColors.navyDarker,
            gradientColors.blueDeep,
          ],
          secondary: [
            gradientColors.navyDeep,
            gradientColors.blueMedium,
            gradientColors.blueBright,
            gradientColors.navyMedium,
          ],
        },
        selectionColors,
      }

      // Performance tracking
      if (enablePerformanceLogging) {
        const endTime = performance.now()
        const readTime = endTime - startTime
        
        performanceRef.current.totalReads++
        performanceRef.current.lastReadTime = readTime
        performanceRef.current.averageReadTime = 
          (performanceRef.current.averageReadTime * (performanceRef.current.totalReads - 1) + readTime) / 
          performanceRef.current.totalReads

        if (readTime > 5) { // Log slow reads
          console.warn(`Slow theme color read: ${readTime.toFixed(2)}ms`)
        }
      }

      return result
    } catch (error) {
      console.error('Failed to read theme colors:', error)
      return getDefaultThemeColors()
    }
  }, [enablePerformanceLogging, getDefaultThemeColors])

  /**
   * Debounced function to update theme colors
   */
  const updateColors = useCallback(() => {
    const newColors = readThemeColors()
    setColors(newColors)
    updateCountRef.current++
    
    if (enablePerformanceLogging) {
      console.log('Theme colors updated', {
        updateCount: updateCountRef.current,
        performance: performanceRef.current
      })
    }
  }, [readThemeColors, enablePerformanceLogging])

  const debouncedUpdateColors = useMemo(
    () => debounce(updateColors, debounceMs),
    [updateColors, debounceMs]
  )

  /**
   * Set up MutationObserver for dynamic theme changes
   */
  useEffect(() => {
    if (!observeChanges || typeof window === 'undefined') return

    let observer: MutationObserver | null = null

    try {
      observer = new MutationObserver((mutations) => {
        let shouldUpdate = false

        // Check if any relevant changes occurred
        for (const mutation of mutations) {
          if (mutation.type === 'attributes') {
            if (mutation.attributeName === 'style' || 
                mutation.attributeName === 'class' ||
                mutation.attributeName === 'data-theme') {
              shouldUpdate = true
              break
            }
          }
        }

        if (shouldUpdate) {
          debouncedUpdateColors()
        }
      })

      // Observe changes to document element and body
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['style', 'class', 'data-theme'],
        subtree: false
      })

      if (document.body) {
        observer.observe(document.body, {
          attributes: true,
          attributeFilter: ['style', 'class', 'data-theme'],
          subtree: false
        })
      }

      setIsObserving(true)

      if (enablePerformanceLogging) {
        console.log('Theme observer started', { debounceMs, observeChanges })
      }
    } catch (error) {
      console.warn('Failed to set up theme observer:', error)
      setIsObserving(false)
    }

    // Cleanup function
    return () => {
      if (observer) {
        observer.disconnect()
        setIsObserving(false)
        
        if (enablePerformanceLogging) {
          console.log('Theme observer stopped')
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [observeChanges, debouncedUpdateColors, enablePerformanceLogging])

  /**
   * Listen for system theme changes (prefers-color-scheme)
   */
  useEffect(() => {
    if (!observeChanges || typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleSystemThemeChange = () => {
      if (enablePerformanceLogging) {
        console.log('System theme changed:', mediaQuery.matches ? 'dark' : 'light')
      }
      debouncedUpdateColors()
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [observeChanges, debouncedUpdateColors, enablePerformanceLogging])

  return {
    ...colors,
    isObserving,
    updateCount: updateCountRef.current
  }
}