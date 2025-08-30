/**
 * Theme Constants for Momentum App
 * 
 * Centralized theme values for consistent styling and easy maintenance.
 * These serve as fallback values when CSS variables are not available.
 * All values are validated at compile time and runtime for consistency.
 */

import { 
  validateColorPalette, 
  validateAndClampFilterValue
} from '@/utils/color-validation'

// Raw filter values (validated at runtime)
const RAW_FILTER_VALUES = {
  r: 0.05,
  g: 0.08,
  b: 0.2,
  opacity: 0.75,
} as const

// Raw gradient colors (validated at runtime) 
const RAW_GRADIENT_COLORS = {
  navyDeep: '#0f172a',
  navyMedium: '#1e293b',
  grayMedium: '#334155',
  navyDarker: '#0c1220',
  blueDeep: '#1e3a8a',
  blueMedium: '#1e40af',
  blueBright: '#3b82f6',
} as const

// Validated and exported constants
export const DEFAULT_FILTER_VALUES = {
  r: validateAndClampFilterValue(RAW_FILTER_VALUES.r, 0.05, 'red filter'),
  g: validateAndClampFilterValue(RAW_FILTER_VALUES.g, 0.08, 'green filter'),
  b: validateAndClampFilterValue(RAW_FILTER_VALUES.b, 0.2, 'blue filter'),
  opacity: validateAndClampFilterValue(RAW_FILTER_VALUES.opacity, 0.75, 'opacity filter'),
} as const

export const DEFAULT_GRADIENT_COLORS = validateColorPalette(
  RAW_GRADIENT_COLORS,
  {
    navyDeep: '#0f172a',
    navyMedium: '#1e293b', 
    grayMedium: '#334155',
    navyDarker: '#0c1220',
    blueDeep: '#1e3a8a',
    blueMedium: '#1e40af',
    blueBright: '#3b82f6',
  },
  'gradient colors'
)

export const CSS_VARIABLES = {
  FILTER: {
    GLASS_R: '--filter-glass-r',
    GLASS_G: '--filter-glass-g',
    GLASS_B: '--filter-glass-b',
    GLASS_OPACITY: '--filter-glass-opacity',
  },
  SHADER: {
    NAVY_DEEP: '--shader-navy-deep',
    NAVY_MEDIUM: '--shader-navy-medium',
    GRAY_MEDIUM: '--shader-gray-medium',
    NAVY_DARKER: '--shader-navy-darker',
    BLUE_DEEP: '--shader-blue-deep',
    BLUE_MEDIUM: '--shader-blue-medium',
    BLUE_BRIGHT: '--shader-blue-bright',
  },
} as const

export type FilterValues = typeof DEFAULT_FILTER_VALUES
export type GradientColors = typeof DEFAULT_GRADIENT_COLORS

export interface ThemeColors {
  filterValues: FilterValues
  gradientColors: {
    primary: string[]
    secondary: string[]
  }
}