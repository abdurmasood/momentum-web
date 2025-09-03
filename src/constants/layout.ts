/**
 * Layout Constants for Momentum App
 * 
 * Centralized design system tokens for consistent layout patterns.
 * These constants ensure uniform spacing, container widths, and layout
 * behavior across all components and pages.
 */

/**
 * Container width tokens for consistent page layouts
 * 
 * These values are designed for optimal readability and user experience:
 * - xl: Wide layouts for dashboards with multiple columns
 * - lg: Medium-wide layouts for content with sidebars
 * - md: Medium layouts for focused content areas
 * - sm: Narrow layouts for reading-focused interfaces
 */
export const CONTAINER_WIDTHS = {
  /** Extra large container - ideal for dashboard layouts with multiple panels */
  xl: 'max-w-7xl',
  /** Large container - good for content with sidebars */
  lg: 'max-w-6xl', 
  /** Medium container - balanced for most content */
  md: 'max-w-4xl',
  /** Small container - optimal for reading and focused tasks */
  sm: 'max-w-2xl',
  
  // Semantic aliases for specific use cases
  /** Default dashboard container width */
  dashboard: 'max-w-7xl',
  /** Chat interface optimized for readability */
  chat: 'max-w-4xl',
  /** Todo list interface with good balance */
  todo: 'max-w-6xl',
  /** Default fallback width */
  default: 'max-w-7xl',
} as const

/**
 * Spacing tokens for consistent padding and margins
 */
export const SPACING = {
  /** Page-level padding for mobile and desktop */
  page: {
    mobile: 'p-6',
    desktop: 'md:p-8',
    combined: 'p-6 md:p-8',
  },
  /** Section spacing */
  section: {
    small: 'mb-4',
    medium: 'mb-6',
    large: 'mb-8',
  },
} as const

/**
 * Layout utilities for common patterns
 */
export const LAYOUT_PATTERNS = {
  /** Centered container with responsive padding */
  centeredContainer: (width: keyof typeof CONTAINER_WIDTHS = 'default') => 
    `${CONTAINER_WIDTHS[width]} mx-auto ${SPACING.page.combined}`,
  
  /** Full height page with background */
  fullPage: 'min-h-screen',
  
  /** Dashboard background gradient */
  dashboardBackground: 'bg-gradient-to-br from-slate-950 to-slate-900',
} as const

/**
 * Type definitions for layout constants
 */
export type ContainerWidth = keyof typeof CONTAINER_WIDTHS
export type SpacingToken = keyof typeof SPACING.page | keyof typeof SPACING.section