/**
 * Color validation utilities for theme system
 * 
 * Provides validation for hex colors, RGB values, and filter values
 * to ensure theme colors are correctly formatted and within valid ranges.
 */

/**
 * Validates if a string is a valid hex color
 */
export function isValidHexColor(color: string): boolean {
  if (typeof color !== 'string') return false
  
  // Match #RRGGBB or #RGB formats
  const hexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/
  return hexRegex.test(color)
}

/**
 * Validates if a number is within the valid range for filter values (0-1)
 */
export function isValidFilterValue(value: number): boolean {
  return typeof value === 'number' && 
         !isNaN(value) && 
         value >= 0 && 
         value <= 1
}

/**
 * Validates and normalizes a hex color, returning fallback if invalid
 */
export function validateAndNormalizeColor(
  color: string, 
  fallback: string,
  context?: string
): string {
  if (!isValidHexColor(color)) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `Invalid hex color: "${color}"${context ? ` in ${context}` : ''}. Using fallback: "${fallback}"`
      )
    }
    return fallback
  }
  
  // Normalize to uppercase and ensure 6-character format
  const normalized = color.toUpperCase()
  if (normalized.length === 4) {
    // Convert #RGB to #RRGGBB
    const [, r, g, b] = normalized
    return `#${r}${r}${g}${g}${b}${b}`
  }
  
  return normalized
}

/**
 * Validates and clamps filter values to valid range (0-1)
 */
export function validateAndClampFilterValue(
  value: number, 
  fallback: number,
  name?: string
): number {
  // Check if it's a valid number first
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `Invalid filter value: ${value}${name ? ` for ${name}` : ''}. Must be a valid number. Using fallback: ${fallback}`
      )
    }
    return fallback
  }
  
  // Clamp to valid range (0-1) regardless of original value
  const clamped = Math.max(0, Math.min(1, value))
  
  // Warn if clamping occurred
  if (process.env.NODE_ENV === 'development' && clamped !== value) {
    console.warn(
      `Filter value ${value}${name ? ` for ${name}` : ''} clamped to ${clamped}`
    )
  }
  
  return clamped
}

/**
 * Converts hex color to RGB object
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!isValidHexColor(hex)) return null
  
  // Normalize to 6-character format
  const normalized = validateAndNormalizeColor(hex, hex)
  const result = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized)
  
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

/**
 * Converts RGB values to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)))
  
  const toHex = (val: number) => {
    const hex = clamp(val).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

/**
 * Calculates relative luminance for WCAG contrast calculations
 */
export function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const srgb = c / 255
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4)
  })
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Calculates contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  
  if (!rgb1 || !rgb2) return 0
  
  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b)
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b)
  
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Checks if color contrast meets WCAG AA standards
 */
export function meetsWCAGAA(color1: string, color2: string): boolean {
  return getContrastRatio(color1, color2) >= 4.5
}

/**
 * Checks if color contrast meets WCAG AAA standards
 */
export function meetsWCAGAAA(color1: string, color2: string): boolean {
  return getContrastRatio(color1, color2) >= 7.0
}

/**
 * Validates a theme color palette object
 */
export function validateColorPalette<T extends Record<string, string>>(
  palette: T,
  fallbackPalette: T,
  context?: string
): T {
  const validated = { ...palette } as T
  let hasWarnings = false
  
  for (const [key, color] of Object.entries(palette)) {
    if (!isValidHexColor(color)) {
      validated[key as keyof T] = fallbackPalette[key as keyof T]
      hasWarnings = true
      
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `Invalid color "${color}" for key "${key}"${context ? ` in ${context}` : ''}. Using fallback.`
        )
      }
    }
  }
  
  return validated
}

/**
 * Type guards for runtime validation
 */
export const ColorValidation = {
  isHexColor: (value: unknown): value is string => 
    typeof value === 'string' && isValidHexColor(value),
    
  isFilterValue: (value: unknown): value is number => 
    typeof value === 'number' && isValidFilterValue(value),
    
  isColorPalette: <T extends Record<string, string>>(
    value: unknown
  ): value is T => {
    if (typeof value !== 'object' || value === null) return false
    
    return Object.values(value).every(color => 
      typeof color === 'string' && isValidHexColor(color)
    )
  }
} as const