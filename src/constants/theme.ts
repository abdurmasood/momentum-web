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

// Raw filter values (validated at runtime) - White Theme
const RAW_FILTER_VALUES = {
  r: 0.1,
  g: 0.1,
  b: 0.1,
  opacity: 0.75,
} as const

// Raw gradient colors (validated at runtime) - Black Theme
const RAW_GRADIENT_COLORS = {
  navyDeep: '#000000', // Pure black for primary gradient base
  navyMedium: '#111111', // Dark gray for gradient transitions
  grayMedium: '#222222', // Medium gray for balanced contrast
  navyDarker: '#000000', // Pure black for depth and shadows
  blueDeep: '#333333', // Dark gray for accent elements
  blueMedium: '#1a1a1a', // Very dark gray for interactive states
  blueBright: '#444444', // Medium gray for highlights and focus
} as const

// Raw selection colors (validated at runtime)
const RAW_SELECTION_COLORS = {
  lightBg: '#FFA726', // Warm amber for light mode
  lightText: '#0c1220', // Navy darker for contrast
  darkBg: '#FFB74D', // Lighter amber for dark mode  
  darkText: '#000000', // Pure black for optimal readability
} as const

// Validated and exported constants
export const DEFAULT_FILTER_VALUES = {
  r: validateAndClampFilterValue(RAW_FILTER_VALUES.r, 0.1, 'red filter'),
  g: validateAndClampFilterValue(RAW_FILTER_VALUES.g, 0.1, 'green filter'),
  b: validateAndClampFilterValue(RAW_FILTER_VALUES.b, 0.1, 'blue filter'),
  opacity: validateAndClampFilterValue(RAW_FILTER_VALUES.opacity, 0.75, 'opacity filter'),
} as const

export const DEFAULT_GRADIENT_COLORS = validateColorPalette(
  RAW_GRADIENT_COLORS,
  {
    navyDeep: '#000000',
    navyMedium: '#111111', 
    grayMedium: '#222222',
    navyDarker: '#000000',
    blueDeep: '#333333',
    blueMedium: '#1a1a1a',
    blueBright: '#444444',
  },
  'gradient colors'
)

/**
 * Default selection colors with validation and fallback values
 * 
 * Provides warm amber selection highlighting for both light and dark themes
 * with WCAG AA/AAA compliant contrast ratios for optimal readability.
 */
export const DEFAULT_SELECTION_COLORS = validateColorPalette(
  RAW_SELECTION_COLORS,
  {
    lightBg: '#FFA726',
    lightText: '#0c1220', 
    darkBg: '#FFB74D',
    darkText: '#000000',
  },
  'selection colors'
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
  SELECTION: {
    LIGHT_BG: '--selection-light-bg',
    LIGHT_TEXT: '--selection-light-text',
    DARK_BG: '--selection-dark-bg',
    DARK_TEXT: '--selection-dark-text',
  },
} as const

export type FilterValues = typeof DEFAULT_FILTER_VALUES
export type GradientColors = typeof DEFAULT_GRADIENT_COLORS

/**
 * Type definition for text selection color configuration
 * 
 * @interface SelectionColors
 * @property {string} lightBg - Background color for text selection in light mode
 * @property {string} lightText - Text color for selection in light mode
 * @property {string} darkBg - Background color for text selection in dark mode
 * @property {string} darkText - Text color for selection in dark mode
 */
export type SelectionColors = typeof DEFAULT_SELECTION_COLORS

/**
 * Complete theme colors interface containing all color categories
 * 
 * This interface defines the structure for theme colors used throughout
 * the application, including filter values, gradient colors, and selection colors.
 * 
 * @interface ThemeColors
 * @property {FilterValues} filterValues - Glass filter RGBA values for visual effects
 * @property {Object} gradientColors - Shader gradient color configurations
 * @property {string[]} gradientColors.primary - Primary gradient color array
 * @property {string[]} gradientColors.secondary - Secondary gradient color array
 * @property {SelectionColors} selectionColors - Text selection color configuration
 */
export interface ThemeColors {
  filterValues: FilterValues
  gradientColors: {
    primary: string[]
    secondary: string[]
  }
  selectionColors: SelectionColors
}
