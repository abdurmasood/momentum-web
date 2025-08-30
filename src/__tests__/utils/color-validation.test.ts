import {
  isValidHexColor,
  isValidFilterValue,
  validateAndNormalizeColor,
  validateAndClampFilterValue,
  hexToRgb,
  rgbToHex,
  getRelativeLuminance,
  getContrastRatio,
  meetsWCAGAA,
  meetsWCAGAAA,
  validateColorPalette,
  ColorValidation
} from '@/utils/color-validation'
import { DEFAULT_SELECTION_COLORS } from '@/constants/theme'

describe('Color Validation Utilities', () => {
  describe('isValidHexColor', () => {
    it('should validate valid hex colors', () => {
      expect(isValidHexColor('#FFFFFF')).toBe(true)
      expect(isValidHexColor('#000000')).toBe(true)
      expect(isValidHexColor('#FFF')).toBe(true)
      expect(isValidHexColor('#000')).toBe(true)
      expect(isValidHexColor('#AbCdEf')).toBe(true)
    })

    it('should reject invalid hex colors', () => {
      expect(isValidHexColor('FFFFFF')).toBe(false) // Missing #
      expect(isValidHexColor('#GGGGGG')).toBe(false) // Invalid characters
      expect(isValidHexColor('#FF')).toBe(false) // Too short
      expect(isValidHexColor('#FFFFFFF')).toBe(false) // Too long
      expect(isValidHexColor('')).toBe(false) // Empty
      expect(isValidHexColor('#')).toBe(false) // Just hash
    })

    it('should handle non-string inputs', () => {
      expect(isValidHexColor(null as unknown as string)).toBe(false)
      expect(isValidHexColor(undefined as unknown as string)).toBe(false)
      expect(isValidHexColor(123 as unknown as string)).toBe(false)
      expect(isValidHexColor({} as unknown as string)).toBe(false)
    })
  })

  describe('isValidFilterValue', () => {
    it('should validate filter values in range 0-1', () => {
      expect(isValidFilterValue(0)).toBe(true)
      expect(isValidFilterValue(1)).toBe(true)
      expect(isValidFilterValue(0.5)).toBe(true)
      expect(isValidFilterValue(0.001)).toBe(true)
      expect(isValidFilterValue(0.999)).toBe(true)
    })

    it('should reject filter values outside range', () => {
      expect(isValidFilterValue(-0.1)).toBe(false)
      expect(isValidFilterValue(1.1)).toBe(false)
      expect(isValidFilterValue(-1)).toBe(false)
      expect(isValidFilterValue(2)).toBe(false)
    })

    it('should reject invalid number inputs', () => {
      expect(isValidFilterValue(NaN)).toBe(false)
      expect(isValidFilterValue(Infinity)).toBe(false)
      expect(isValidFilterValue(-Infinity)).toBe(false)
      expect(isValidFilterValue('0.5' as unknown as number)).toBe(false)
      expect(isValidFilterValue(null as unknown as number)).toBe(false)
    })
  })

  describe('validateAndNormalizeColor', () => {
    // Mock console.warn for testing
    const originalWarn = console.warn
    beforeEach(() => {
      console.warn = jest.fn()
    })
    afterEach(() => {
      console.warn = originalWarn
    })

    it('should normalize valid hex colors', () => {
      expect(validateAndNormalizeColor('#abc', '#000000')).toBe('#AABBCC')
      expect(validateAndNormalizeColor('#ABCDEF', '#000000')).toBe('#ABCDEF')
      expect(validateAndNormalizeColor('#ffffff', '#000000')).toBe('#FFFFFF')
    })

    it('should return fallback for invalid colors', () => {
      expect(validateAndNormalizeColor('invalid', '#FALLBACK')).toBe('#FALLBACK')
      expect(validateAndNormalizeColor('', '#DEFAULT')).toBe('#DEFAULT')
      expect(validateAndNormalizeColor('#GGG', '#000000')).toBe('#000000')
    })

    it('should warn in development mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      validateAndNormalizeColor('invalid', '#fallback', 'test context')

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Invalid hex color: "invalid"'),
      )

      process.env.NODE_ENV = originalEnv
    })
  })

  describe('validateAndClampFilterValue', () => {
    const originalWarn = console.warn
    beforeEach(() => {
      console.warn = jest.fn()
    })
    afterEach(() => {
      console.warn = originalWarn
    })

    it('should clamp values to 0-1 range', () => {
      expect(validateAndClampFilterValue(1.5, 0.5)).toBe(1)
      expect(validateAndClampFilterValue(-0.5, 0.5)).toBe(0)
      expect(validateAndClampFilterValue(0.5, 0.5)).toBe(0.5)
    })

    it('should use fallback for invalid values', () => {
      expect(validateAndClampFilterValue(NaN, 0.5)).toBe(0.5)
      expect(validateAndClampFilterValue(Infinity, 0.3)).toBe(0.3)
    })
  })

  describe('hexToRgb', () => {
    it('should convert valid hex to RGB', () => {
      expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 })
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 })
      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 })
      expect(hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 })
      expect(hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 })
    })

    it('should handle 3-character hex colors', () => {
      expect(hexToRgb('#FFF')).toEqual({ r: 255, g: 255, b: 255 })
      expect(hexToRgb('#F00')).toEqual({ r: 255, g: 0, b: 0 })
    })

    it('should return null for invalid colors', () => {
      expect(hexToRgb('invalid')).toBeNull()
      expect(hexToRgb('#GGG')).toBeNull()
      expect(hexToRgb('')).toBeNull()
    })
  })

  describe('rgbToHex', () => {
    it('should convert RGB to hex', () => {
      expect(rgbToHex(255, 255, 255)).toBe('#FFFFFF')
      expect(rgbToHex(0, 0, 0)).toBe('#000000')
      expect(rgbToHex(255, 0, 0)).toBe('#FF0000')
      expect(rgbToHex(0, 255, 0)).toBe('#00FF00')
      expect(rgbToHex(0, 0, 255)).toBe('#0000FF')
    })

    it('should clamp values to valid range', () => {
      expect(rgbToHex(-10, 300, 128)).toBe('#00FF80')
      expect(rgbToHex(255.9, 127.4, 0.1)).toBe('#FF7F00')
    })

    it('should handle decimal values', () => {
      expect(rgbToHex(255.5, 127.8, 63.2)).toBe('#FF803F') // Rounded values (256->FF, 128->80, 63->3F)
    })
  })

  describe('Contrast calculations', () => {
    describe('getRelativeLuminance', () => {
      it('should calculate luminance correctly', () => {
        expect(getRelativeLuminance(255, 255, 255)).toBeCloseTo(1, 2) // White
        expect(getRelativeLuminance(0, 0, 0)).toBeCloseTo(0, 2) // Black
      })
    })

    describe('getContrastRatio', () => {
      it('should calculate contrast ratio correctly', () => {
        const ratio = getContrastRatio('#FFFFFF', '#000000')
        expect(ratio).toBeCloseTo(21, 0) // Maximum contrast ratio
      })

      it('should return 0 for invalid colors', () => {
        expect(getContrastRatio('invalid', '#FFFFFF')).toBe(0)
        expect(getContrastRatio('#FFFFFF', 'invalid')).toBe(0)
      })
    })

    describe('WCAG compliance', () => {
      it('should correctly identify WCAG AA compliance', () => {
        expect(meetsWCAGAA('#FFFFFF', '#000000')).toBe(true) // High contrast
        expect(meetsWCAGAA('#FFFFFF', '#FFFFFF')).toBe(false) // Same color
      })

      it('should correctly identify WCAG AAA compliance', () => {
        expect(meetsWCAGAAA('#FFFFFF', '#000000')).toBe(true) // High contrast
        expect(meetsWCAGAAA('#888888', '#FFFFFF')).toBe(false) // Lower contrast
      })
    })
  })

  describe('validateColorPalette', () => {
    const originalWarn = console.warn
    beforeEach(() => {
      console.warn = jest.fn()
    })
    afterEach(() => {
      console.warn = originalWarn
    })

    it('should validate correct color palette', () => {
      const palette = {
        primary: '#FF0000',
        secondary: '#00FF00',
        tertiary: '#0000FF'
      }
      
      const result = validateColorPalette(palette, palette)
      expect(result).toEqual(palette)
    })

    it('should use fallback for invalid colors', () => {
      const palette = {
        primary: 'invalid',
        secondary: '#00FF00'
      }
      
      const fallback = {
        primary: '#FF0000',
        secondary: '#000000'
      }
      
      const result = validateColorPalette(palette, fallback)
      expect(result.primary).toBe('#FF0000') // Fallback used
      expect(result.secondary).toBe('#00FF00') // Original kept
    })
  })

  describe('ColorValidation type guards', () => {
    it('should validate hex colors', () => {
      expect(ColorValidation.isHexColor('#FFFFFF')).toBe(true)
      expect(ColorValidation.isHexColor('invalid')).toBe(false)
      expect(ColorValidation.isHexColor(123)).toBe(false)
    })

    it('should validate filter values', () => {
      expect(ColorValidation.isFilterValue(0.5)).toBe(true)
      expect(ColorValidation.isFilterValue(1.5)).toBe(false)
      expect(ColorValidation.isFilterValue('0.5')).toBe(false)
    })

    it('should validate color palettes', () => {
      const validPalette = {
        primary: '#FF0000',
        secondary: '#00FF00'
      }
      
      const invalidPalette = {
        primary: 'invalid',
        secondary: '#00FF00'
      }
      
      expect(ColorValidation.isColorPalette(validPalette)).toBe(true)
      expect(ColorValidation.isColorPalette(invalidPalette)).toBe(false)
      expect(ColorValidation.isColorPalette(null)).toBe(false)
      expect(ColorValidation.isColorPalette('not an object')).toBe(false)
    })
  })

  describe('Selection color validation', () => {
    const originalWarn = console.warn
    beforeEach(() => {
      console.warn = jest.fn()
    })
    afterEach(() => {
      console.warn = originalWarn
    })

    it('should validate selection color palette structure', () => {
      expect(ColorValidation.isColorPalette(DEFAULT_SELECTION_COLORS)).toBe(true)
    })

    it('should have valid hex colors for all selection states', () => {
      expect(isValidHexColor(DEFAULT_SELECTION_COLORS.lightBg)).toBe(true)
      expect(isValidHexColor(DEFAULT_SELECTION_COLORS.lightText)).toBe(true)
      expect(isValidHexColor(DEFAULT_SELECTION_COLORS.darkBg)).toBe(true)
      expect(isValidHexColor(DEFAULT_SELECTION_COLORS.darkText)).toBe(true)
    })

    it('should preserve valid selection colors as-is', () => {
      const testPalette = {
        lightBg: '#ffa726',  // lowercase but valid
        lightText: '#0c1220', // lowercase but valid
        darkBg: '#ffb74d',   // lowercase but valid
        darkText: '#000'     // short form but valid
      }

      const result = validateColorPalette(testPalette, DEFAULT_SELECTION_COLORS)
      expect(result.lightBg).toBe('#ffa726')  // Preserved as-is
      expect(result.lightText).toBe('#0c1220') // Preserved as-is
      expect(result.darkBg).toBe('#ffb74d')   // Preserved as-is
      expect(result.darkText).toBe('#000')    // Preserved as-is
    })

    it('should normalize individual selection colors when needed', () => {
      // Test individual color normalization
      expect(validateAndNormalizeColor('#ffa726', DEFAULT_SELECTION_COLORS.lightBg)).toBe('#FFA726')
      expect(validateAndNormalizeColor('#000', DEFAULT_SELECTION_COLORS.darkText)).toBe('#000000')
      expect(validateAndNormalizeColor('#abc', DEFAULT_SELECTION_COLORS.lightBg)).toBe('#AABBCC')
    })

    it('should use fallback for invalid selection colors', () => {
      const invalidPalette = {
        lightBg: 'invalid',
        lightText: '#0C1220',
        darkBg: '#FFB74D',
        darkText: 'also-invalid'
      }

      const result = validateColorPalette(invalidPalette, DEFAULT_SELECTION_COLORS)
      expect(result.lightBg).toBe(DEFAULT_SELECTION_COLORS.lightBg)
      expect(result.lightText).toBe('#0C1220') // Valid one preserved
      expect(result.darkBg).toBe('#FFB74D') // Valid one preserved
      expect(result.darkText).toBe(DEFAULT_SELECTION_COLORS.darkText)
    })
  })
})