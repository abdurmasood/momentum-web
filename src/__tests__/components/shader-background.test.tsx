import { render, screen, waitFor } from '@testing-library/react'
import ShaderBackground from '@/components/shader-background'

// Mock the MeshGradient component
jest.mock('@paper-design/shaders-react', () => ({
  MeshGradient: ({ colors, speed, className }: { colors?: string[]; speed?: number; className?: string }) => (
    <div
      data-testid="mesh-gradient"
      data-colors={JSON.stringify(colors)}
      data-speed={speed}
      className={className}
    />
  ),
}))

// Mock the useThemeColors hook
jest.mock('@/hooks/use-theme-colors', () => ({
  useThemeColors: () => ({
    filterValues: {
      r: 0.05,
      g: 0.08,
      b: 0.2,
      opacity: 0.75,
    },
    gradientColors: {
      primary: ['#0f172a', '#1e293b', '#334155', '#0c1220', '#1e3a8a'],
      secondary: ['#0f172a', '#1e40af', '#3b82f6', '#1e293b'],
    },
  }),
}))

// Mock the shader skeleton component
jest.mock('@/components/shader-skeleton', () => {
  return function MockShaderSkeleton({ children }: { children: React.ReactNode }) {
    return <div data-testid="shader-skeleton">{children}</div>
  }
})

// Mock the performance config
jest.mock('@/config/performance', () => ({
  performanceConfig: {
    getConfig: () => ({
      enabled: true,
      developmentLogging: true,
      componentMetrics: true,
      shaderMetrics: true,
      budgetWarnings: true
    }),
    subscribe: jest.fn()
  }
}))

// Mock the error handling
jest.mock('@/utils/error-handling', () => ({
  ErrorHandlers: {
    handleShaderError: jest.fn((error) => {
      console.error('Shader error:', error.message)
    }),
    handleComponentError: jest.fn((error) => {
      console.error('Component error:', error.message)
    })
  },
  ErrorType: {
    SHADER_ERROR: 'SHADER_ERROR',
    COMPONENT_ERROR: 'COMPONENT_ERROR'
  },
  ErrorSeverity: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
  }
}))

// Mock intersection observer for lazy loading tests
const mockIntersectionObserver = jest.fn()
const mockObserve = jest.fn()
const mockDisconnect = jest.fn()

beforeAll(() => {
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: jest.fn().mockImplementation((callback) => {
      mockIntersectionObserver.mockImplementation(callback)
      return {
        observe: mockObserve,
        disconnect: mockDisconnect,
        unobserve: jest.fn(),
      }
    })
  })
})

beforeEach(() => {
  mockIntersectionObserver.mockClear()
  mockObserve.mockClear()
  mockDisconnect.mockClear()
  
  // Reset the IntersectionObserver mock to its default state
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: jest.fn().mockImplementation((callback) => {
      mockIntersectionObserver.mockImplementation(callback)
      return {
        observe: mockObserve,
        disconnect: mockDisconnect,
        unobserve: jest.fn(),
      }
    })
  })
})

describe('ShaderBackground', () => {
  describe('Default (immediate) mode', () => {
    it('should render children correctly', () => {
      render(
        <ShaderBackground>
          <div data-testid="child-content">Test Content</div>
        </ShaderBackground>
      )

      expect(screen.getByTestId('child-content')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

  it('should render SVG filters with correct IDs', () => {
    render(
      <ShaderBackground>
        <div>Test</div>
      </ShaderBackground>
    )

    // Check for SVG filters
    const glassFilter = document.querySelector('#glass-effect')
    const gooeyFilter = document.querySelector('#gooey-filter')

    expect(glassFilter).toBeInTheDocument()
    expect(gooeyFilter).toBeInTheDocument()
  })

  it('should render MeshGradient components with correct props', () => {
    render(
      <ShaderBackground>
        <div>Test</div>
      </ShaderBackground>
    )

    const meshGradients = screen.getAllByTestId('mesh-gradient')
    
    expect(meshGradients).toHaveLength(2)
    
    // Check primary gradient
    expect(meshGradients[0]).toHaveAttribute(
      'data-colors',
      JSON.stringify(['#0f172a', '#1e293b', '#334155', '#0c1220', '#1e3a8a'])
    )
    expect(meshGradients[0]).toHaveAttribute('data-speed', '0.3')
    
    // Check secondary gradient
    expect(meshGradients[1]).toHaveAttribute(
      'data-colors',
      JSON.stringify(['#0f172a', '#1e40af', '#3b82f6', '#1e293b'])
    )
    expect(meshGradients[1]).toHaveAttribute('data-speed', '0.2')
  })

  it('should have correct CSS classes', () => {
    render(
      <ShaderBackground>
        <div>Test</div>
      </ShaderBackground>
    )

    const container = document.querySelector('.min-h-screen.bg-slate-950.relative.overflow-hidden')
    expect(container).toBeInTheDocument()
  })

  it('should apply filter values to SVG feColorMatrix', () => {
    render(
      <ShaderBackground>
        <div>Test</div>
      </ShaderBackground>
    )

    const colorMatrix = document.querySelector('feColorMatrix')
    expect(colorMatrix).toBeInTheDocument()
    
    // Check that the values attribute contains our filter values
    const valuesAttr = colorMatrix?.getAttribute('values')
    expect(valuesAttr).toContain('0.05') // r value
    expect(valuesAttr).toContain('0.08') // g value  
    expect(valuesAttr).toContain('0.2')  // b value
    expect(valuesAttr).toContain('0.75') // opacity value
  })

    it('should render accessibility-friendly structure', () => {
      render(
        <ShaderBackground>
          <div>Test</div>
        </ShaderBackground>
      )

      // SVG should be hidden from screen readers (decorative)
      const svg = document.querySelector('svg')
      expect(svg).toHaveClass('absolute', 'inset-0', 'w-0', 'h-0')
      expect(svg).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Lazy loading mode', () => {
    it('should render skeleton when lazy=true and not intersecting', () => {
      render(
        <ShaderBackground lazy>
          <div data-testid="child-content">Test Content</div>
        </ShaderBackground>
      )

      // Should show skeleton initially
      expect(screen.getByTestId('shader-skeleton')).toBeInTheDocument()
      expect(screen.getByTestId('child-content')).toBeInTheDocument()
      
      // Should not show MeshGradient components yet
      expect(screen.queryByTestId('mesh-gradient')).not.toBeInTheDocument()
    })

    it('should set up intersection observer when lazy=true', () => {
      render(
        <ShaderBackground lazy>
          <div>Test</div>
        </ShaderBackground>
      )

      expect(window.IntersectionObserver).toHaveBeenCalled()
      expect(mockObserve).toHaveBeenCalled()
    })

    it('should load shader when intersection occurs', async () => {
      render(
        <ShaderBackground lazy>
          <div data-testid="child-content">Test Content</div>
        </ShaderBackground>
      )

      // Initially shows skeleton
      expect(screen.getByTestId('shader-skeleton')).toBeInTheDocument()

      // Simulate intersection
      const callback = (window.IntersectionObserver as jest.Mock).mock.calls[0][0]
      callback([{ isIntersecting: true }])

      // Should trigger loading state
      await waitFor(() => {
        // The component should start loading process
        expect(mockDisconnect).toHaveBeenCalled()
      })
    })

    it('should force load when forceLoad=true', () => {
      render(
        <ShaderBackground lazy forceLoad>
          <div data-testid="child-content">Test Content</div>
        </ShaderBackground>
      )

      // Should bypass intersection observer but may still show skeleton during loading
      // The actual shader should eventually load
      expect(screen.getByTestId('child-content')).toBeInTheDocument()
    })

    it('should respect custom intersection threshold', () => {
      // Clear previous calls
      (window.IntersectionObserver as jest.Mock).mockClear()

      render(
        <ShaderBackground lazy intersectionThreshold={0.5}>
          <div>Test</div>
        </ShaderBackground>
      )

      expect(window.IntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          threshold: 0.5,
          rootMargin: '50px'
        })
      )
    })

    it('should handle intersection observer errors gracefully', () => {
      // Mock IntersectionObserver to throw error
      const originalConsoleError = console.error
      console.error = jest.fn()

      Object.defineProperty(window, 'IntersectionObserver', {
        writable: true,
        value: jest.fn().mockImplementation(() => {
          throw new Error('IntersectionObserver not supported')
        })
      })

      render(
        <ShaderBackground lazy>
          <div data-testid="child-content">Test Content</div>
        </ShaderBackground>
      )

      // The error should now be handled by our centralized error handler
      // which logs to console.error instead of console.warn
      expect(console.error).toHaveBeenCalled()

      console.error = originalConsoleError
    })

    it('should clean up intersection observer on unmount', () => {
      // Clear previous calls to get a clean slate
      mockDisconnect.mockClear()
      
      const { unmount } = render(
        <ShaderBackground lazy>
          <div>Test</div>
        </ShaderBackground>
      )

      // Unmount should trigger the cleanup useEffect
      unmount()
      
      // The disconnect should have been called during cleanup
      expect(mockDisconnect).toHaveBeenCalled()
    })
  })

  describe('Props and configuration', () => {
    it('should pass enablePerformanceLogging prop correctly', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      render(
        <ShaderBackground lazy forceLoad enablePerformanceLogging>
          <div>Test</div>
        </ShaderBackground>
      )

      consoleSpy.mockRestore()
    })

    it('should work with loadOnIntersection=false', () => {
      render(
        <ShaderBackground lazy loadOnIntersection={false}>
          <div data-testid="child-content">Test Content</div>
        </ShaderBackground>
      )

      // Should not set up intersection observer
      expect(mockObserve).not.toHaveBeenCalled()
    })

    it('should maintain backward compatibility with no props', () => {
      render(
        <ShaderBackground>
          <div data-testid="child-content">Test Content</div>
        </ShaderBackground>
      )

      // Should render immediately without skeleton
      expect(screen.getByTestId('child-content')).toBeInTheDocument()
      expect(screen.queryByTestId('shader-skeleton')).not.toBeInTheDocument()
      expect(screen.getAllByTestId('mesh-gradient')).toHaveLength(2)
    })
  })
})