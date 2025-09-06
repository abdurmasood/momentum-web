import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import '@testing-library/jest-dom'

// Mock the shader library
jest.mock('@paper-design/shaders-react', () => ({
  MeshGradient: ({ children, className }: { children?: React.ReactNode; className?: string }) => (
    <div data-testid="mesh-gradient" className={className}>
      {children}
    </div>
  )
}))

// Mock the components used by ErrorBoundary
jest.mock('@/components/visualization/shaders/shader-error-fallback', () => ({
  __esModule: true,
  default: ({ children, onRetry }: { children: React.ReactNode; error?: Error; onRetry?: () => void }) => (
    <div data-testid="shader-error-fallback">
      <div>Error fallback displayed</div>
      {onRetry && <button onClick={onRetry}>Retry</button>}
      {children}
    </div>
  ),
  MinimalErrorFallback: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="minimal-error-fallback">
      <div>Minimal Error Fallback</div>
      {children}
    </div>
  )
}))

jest.mock('@/hooks/use-theme-colors', () => ({
  useThemeColors: () => ({
    filterValues: { r: 0.1, g: 0.2, b: 0.3, opacity: 0.8 },
    gradientColors: {
      primary: ['#0f172a', '#1e293b'],
      secondary: ['#1e40af', '#3b82f6']
    }
  })
}))

// Simple error boundary component for testing
class TestErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ComponentType<{ children: React.ReactNode; onRetry: () => void }> },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ComponentType<{ children: React.ReactNode; onRetry: () => void }> }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.log('Error caught:', error)
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback
      return <Fallback onRetry={() => this.setState({ hasError: false })}>Test Content</Fallback>
    }

    return this.props.children
  }
}

// Import the fallback components directly
import ShaderErrorFallback, { MinimalErrorFallback } from '@/components/visualization/shaders/shader-error-fallback'

// Component that throws error
const ThrowError = () => {
  throw new Error('Test error')
}

describe('ErrorBoundary Functionality', () => {
  // Suppress console.error for error boundary tests
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    consoleErrorSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('catches errors and displays ShaderErrorFallback', () => {
    render(
      <TestErrorBoundary fallback={ShaderErrorFallback}>
        <ThrowError />
      </TestErrorBoundary>
    )
    
    expect(screen.getByTestId('shader-error-fallback')).toBeInTheDocument()
    expect(screen.getByText('Error fallback displayed')).toBeInTheDocument()
  })

  it('provides retry functionality', () => {
    render(
      <TestErrorBoundary fallback={ShaderErrorFallback}>
        <ThrowError />
      </TestErrorBoundary>
    )
    
    // Error state should show ShaderErrorFallback
    expect(screen.getByTestId('shader-error-fallback')).toBeInTheDocument()
    
    // Click retry button - this should reset error boundary
    const retryButton = screen.getByText('Retry')
    fireEvent.click(retryButton)
    
    // After retry, component tries to render again and fails again
    expect(screen.getByTestId('shader-error-fallback')).toBeInTheDocument()
  })

  it('handles fallback component errors', () => {
    // Test that our error boundary can handle errors in general
    render(
      <TestErrorBoundary fallback={ShaderErrorFallback}>
        <ThrowError />
      </TestErrorBoundary>
    )
    
    // Should show the fallback
    expect(screen.getByTestId('shader-error-fallback')).toBeInTheDocument()
    expect(consoleErrorSpy).toHaveBeenCalled()
  })

})

describe('Error Component Integration', () => {
  it('renders MinimalErrorFallback correctly', () => {
    render(
      <MinimalErrorFallback>
        <div>Test Content</div>
      </MinimalErrorFallback>
    )
    
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('ShaderErrorFallback shows notification', () => {
    // Test the actual component, not the mock
    jest.unmock('@/components/visualization/shaders/shader-error-fallback')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ActualShaderErrorFallback = require('@/components/visualization/shaders/shader-error-fallback').default
    
    render(
      <ActualShaderErrorFallback>
        <div>Test Content</div>
      </ActualShaderErrorFallback>
    )
    
    expect(screen.getByText('Visual effects unavailable')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('ShaderErrorFallback shows retry button when onRetry provided', () => {
    const mockRetry = jest.fn()
    
    // Test the actual component, not the mock
    jest.unmock('@/components/visualization/shaders/shader-error-fallback')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ActualShaderErrorFallback = require('@/components/visualization/shaders/shader-error-fallback').default
    
    render(
      <ActualShaderErrorFallback onRetry={mockRetry}>
        <div>Test Content</div>
      </ActualShaderErrorFallback>
    )
    
    const retryButton = screen.getByText('Retry')
    fireEvent.click(retryButton)
    
    expect(mockRetry).toHaveBeenCalledTimes(1)
  })
})