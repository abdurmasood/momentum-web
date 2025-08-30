"use client"

import { useMemo } from 'react'
import {
  DEFAULT_FILTER_VALUES,
  DEFAULT_GRADIENT_COLORS,
  CSS_VARIABLES,
  type ThemeColors,
} from '@/constants/theme'

/**
 * Custom hook for reading theme colors from CSS variables
 * with performance optimization and error handling
 */
export function useThemeColors(): ThemeColors {
  return useMemo(() => {
    // SSR safety check
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return {
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
      }
    }

    try {
      const computedStyle = getComputedStyle(document.documentElement)

      // Helper function to safely parse CSS variables
      const getCSSVariable = (variable: string, fallback: string | number): string | number => {
        try {
          const value = computedStyle.getPropertyValue(variable).trim()
          if (!value) return fallback
          
          // If fallback is a number, parse as float
          if (typeof fallback === 'number') {
            const parsed = parseFloat(value)
            return isNaN(parsed) ? fallback : parsed
          }
          
          return value
        } catch (error) {
          console.warn(`Failed to read CSS variable ${variable}:`, error)
          return fallback
        }
      }

      // Read filter values with error handling
      const filterValues = {
        r: getCSSVariable(CSS_VARIABLES.FILTER.GLASS_R, DEFAULT_FILTER_VALUES.r) as number,
        g: getCSSVariable(CSS_VARIABLES.FILTER.GLASS_G, DEFAULT_FILTER_VALUES.g) as number,
        b: getCSSVariable(CSS_VARIABLES.FILTER.GLASS_B, DEFAULT_FILTER_VALUES.b) as number,
        opacity: getCSSVariable(CSS_VARIABLES.FILTER.GLASS_OPACITY, DEFAULT_FILTER_VALUES.opacity) as number,
      }

      // Read gradient colors with error handling
      const gradientColors = {
        navyDeep: getCSSVariable(CSS_VARIABLES.SHADER.NAVY_DEEP, DEFAULT_GRADIENT_COLORS.navyDeep) as string,
        navyMedium: getCSSVariable(CSS_VARIABLES.SHADER.NAVY_MEDIUM, DEFAULT_GRADIENT_COLORS.navyMedium) as string,
        grayMedium: getCSSVariable(CSS_VARIABLES.SHADER.GRAY_MEDIUM, DEFAULT_GRADIENT_COLORS.grayMedium) as string,
        navyDarker: getCSSVariable(CSS_VARIABLES.SHADER.NAVY_DARKER, DEFAULT_GRADIENT_COLORS.navyDarker) as string,
        blueDeep: getCSSVariable(CSS_VARIABLES.SHADER.BLUE_DEEP, DEFAULT_GRADIENT_COLORS.blueDeep) as string,
        blueMedium: getCSSVariable(CSS_VARIABLES.SHADER.BLUE_MEDIUM, DEFAULT_GRADIENT_COLORS.blueMedium) as string,
        blueBright: getCSSVariable(CSS_VARIABLES.SHADER.BLUE_BRIGHT, DEFAULT_GRADIENT_COLORS.blueBright) as string,
      }

      return {
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
      }
    } catch (error) {
      console.error('Failed to read theme colors:', error)
      
      // Return fallback values on error
      return {
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
      }
    }
  }, []) // Empty dependency array - only compute once on mount
}