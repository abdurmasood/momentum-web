import '@testing-library/jest-dom'

// Mock getComputedStyle for tests
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: (prop) => {
      // Mock CSS variable values for testing
      const mockValues = {
        '--filter-glass-r': '0.05',
        '--filter-glass-g': '0.08',
        '--filter-glass-b': '0.2',
        '--filter-glass-opacity': '0.75',
        '--shader-navy-deep': '#0f172a',
        '--shader-navy-medium': '#1e293b',
        '--shader-gray-medium': '#334155',
        '--shader-navy-darker': '#0c1220',
        '--shader-blue-deep': '#1e3a8a',
        '--shader-blue-medium': '#1e40af',
        '--shader-blue-bright': '#3b82f6',
      }
      return mockValues[prop] || ''
    },
  }),
})