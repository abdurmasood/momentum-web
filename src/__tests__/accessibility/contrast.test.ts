/**
 * Accessibility Tests for Color Contrast
 * 
 * Tests WCAG AA compliance for text colors used in the focus theme
 */

import { DEFAULT_SELECTION_COLORS } from '@/constants/theme'

// Helper function to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

// Helper function to calculate relative luminance
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const srgb = c / 255
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

// Helper function to calculate contrast ratio
function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  
  if (!rgb1 || !rgb2) return 0
  
  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b)
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b)
  
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

describe('Color Contrast Accessibility', () => {
  // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
  const WCAG_AA_NORMAL = 4.5
  const WCAG_AAA_NORMAL = 7.0

  const BACKGROUND_COLORS = {
    primary: '#020617', // bg-slate-950
    secondary: '#0f172a', // shader-navy-deep
  }

  const TEXT_COLORS = {
    primary: '#f1f5f9', // text-slate-100
    secondary: '#cbd5e1', // text-slate-300
    tertiary: '#94a3b8', // text-slate-400
    accent: '#bfdbfe', // text-blue-200
  }

  describe('Primary text colors on dark backgrounds', () => {
    it('should meet WCAG AA standards for slate-100 on slate-950', () => {
      const ratio = getContrastRatio(TEXT_COLORS.primary, BACKGROUND_COLORS.primary)
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL)
    })

    it('should meet WCAG AA standards for slate-300 on slate-950', () => {
      const ratio = getContrastRatio(TEXT_COLORS.secondary, BACKGROUND_COLORS.primary)
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL)
    })

    it('should meet WCAG AA standards for blue-200 on slate-950 (hover states)', () => {
      const ratio = getContrastRatio(TEXT_COLORS.accent, BACKGROUND_COLORS.primary)
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL)
    })
  })

  describe('Secondary text colors', () => {
    it('should meet WCAG AA standards for slate-400 description text', () => {
      const ratio = getContrastRatio(TEXT_COLORS.tertiary, BACKGROUND_COLORS.primary)
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL)
    })
  })

  describe('Button contrast ratios', () => {
    const BUTTON_COLORS = {
      primary: '#1e40af', // bg-blue-700 (darker for better contrast)
      primaryHover: '#1e3a8a', // bg-blue-800
      secondary: '#f8fafc', // bg-blue-50
      text: '#0f172a', // text-slate-900 on light buttons
      textLight: '#ffffff', // text-white on dark buttons
    }

    it('should meet WCAG AA standards for blue button text', () => {
      const ratio = getContrastRatio(BUTTON_COLORS.textLight, BUTTON_COLORS.primary)
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL)
    })

    it('should meet WCAG AA standards for light button text', () => {
      const ratio = getContrastRatio(BUTTON_COLORS.text, BUTTON_COLORS.secondary)
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL)
    })

    it('should meet WCAG AA standards for hover states', () => {
      const ratio = getContrastRatio(BUTTON_COLORS.textLight, BUTTON_COLORS.primaryHover)
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL)
    })
  })

  describe('WCAG AAA compliance (enhanced)', () => {
    it('should meet WCAG AAA standards for primary headings', () => {
      const ratio = getContrastRatio(TEXT_COLORS.primary, BACKGROUND_COLORS.primary)
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AAA_NORMAL)
    })

    it('should meet WCAG AAA standards for navigation text', () => {
      const ratio = getContrastRatio(TEXT_COLORS.secondary, BACKGROUND_COLORS.primary)
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AAA_NORMAL)
    })
  })

  describe('Edge cases and gradient backgrounds', () => {
    it('should handle shader gradient colors appropriately', () => {
      const shaderColors = [
        '#0f172a', // navy-deep
        '#1e293b', // navy-medium  
        '#334155', // gray-medium
        '#0c1220', // navy-darker
        '#1e3a8a', // blue-deep
      ]

      shaderColors.forEach((bgColor) => {
        const ratio = getContrastRatio(TEXT_COLORS.primary, bgColor)
        expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL)
      })
    })
  })

  describe('Text selection color contrast', () => {
    it('should meet WCAG AA standards for light mode selection', () => {
      const ratio = getContrastRatio(DEFAULT_SELECTION_COLORS.lightText, DEFAULT_SELECTION_COLORS.lightBg)
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL)
    })

    it('should meet WCAG AA standards for dark mode selection', () => {
      const ratio = getContrastRatio(DEFAULT_SELECTION_COLORS.darkText, DEFAULT_SELECTION_COLORS.darkBg)
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL)
    })

    it('should meet WCAG AAA standards for light mode selection (enhanced)', () => {
      const ratio = getContrastRatio(DEFAULT_SELECTION_COLORS.lightText, DEFAULT_SELECTION_COLORS.lightBg)
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AAA_NORMAL)
    })

    it('should meet WCAG AAA standards for dark mode selection (enhanced)', () => {
      const ratio = getContrastRatio(DEFAULT_SELECTION_COLORS.darkText, DEFAULT_SELECTION_COLORS.darkBg)
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AAA_NORMAL)
    })

    it('should have sufficient contrast for selection on primary backgrounds', () => {
      // Test selection colors against main background colors
      const lightSelectionOnDark = getContrastRatio(DEFAULT_SELECTION_COLORS.lightBg, BACKGROUND_COLORS.primary)
      const darkSelectionOnDark = getContrastRatio(DEFAULT_SELECTION_COLORS.darkBg, BACKGROUND_COLORS.primary)
      
      expect(lightSelectionOnDark).toBeGreaterThanOrEqual(3.0) // Minimum for UI elements
      expect(darkSelectionOnDark).toBeGreaterThanOrEqual(3.0) // Minimum for UI elements
    })

    it('should provide good contrast ratios for amber selection colors', () => {
      // Verify specific amber colors meet accessibility standards using theme constants
      expect(getContrastRatio(DEFAULT_SELECTION_COLORS.lightText, DEFAULT_SELECTION_COLORS.lightBg)).toBeGreaterThanOrEqual(WCAG_AA_NORMAL) // Light mode
      expect(getContrastRatio(DEFAULT_SELECTION_COLORS.darkText, DEFAULT_SELECTION_COLORS.darkBg)).toBeGreaterThanOrEqual(WCAG_AA_NORMAL) // Dark mode
    })
  })
})
