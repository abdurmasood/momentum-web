import { render, screen, fireEvent } from '@testing-library/react'
import ShaderErrorFallback, { MinimalErrorFallback } from '@/components/shader-error-fallback'
import '@testing-library/jest-dom'

// Mock the theme colors hook
jest.mock('@/hooks/use-theme-colors', () => ({
  useThemeColors: () => ({
    filterValues: {
      r: 0.1,
      g: 0.2,
      b: 0.3,
      opacity: 0.8
    },
    gradientColors: {
      primary: ['#0f172a', '#1e293b', '#334155'],
      secondary: ['#1e40af', '#3b82f6', '#60a5fa']
    }
  })
}))

describe('ShaderErrorFallback', () => {
  it('renders error fallback with children', () => {
    render(
      <ShaderErrorFallback>
        <div>Test Content</div>
      </ShaderErrorFallback>
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
    expect(screen.getByText('Visual effects unavailable')).toBeInTheDocument()
  })

  it('displays error message when error prop is provided in development', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    
    const testError = new Error('WebGL not supported')
    
    render(
      <ShaderErrorFallback error={testError}>
        <div>Test Content</div>
      </ShaderErrorFallback>
    )

    expect(screen.getByText('Visual effects unavailable')).toBeInTheDocument()
    expect(screen.getByText('WebGL not supported')).toBeInTheDocument()
    
    process.env.NODE_ENV = originalEnv
  })

  it('calls onRetry when retry button is clicked', () => {
    const mockRetry = jest.fn()
    
    render(
      <ShaderErrorFallback onRetry={mockRetry}>
        <div>Test Content</div>
      </ShaderErrorFallback>
    )

    fireEvent.click(screen.getByText('Retry'))
    expect(mockRetry).toHaveBeenCalledTimes(1)
  })

  it('renders retry button only when onRetry is provided', () => {
    const { rerender } = render(
      <ShaderErrorFallback>
        <div>Test Content</div>
      </ShaderErrorFallback>
    )

    expect(screen.queryByText('Retry')).not.toBeInTheDocument()

    rerender(
      <ShaderErrorFallback onRetry={() => {}}>
        <div>Test Content</div>
      </ShaderErrorFallback>
    )

    expect(screen.getByText('Retry')).toBeInTheDocument()
  })

  it('applies correct CSS classes for layout', () => {
    render(
      <ShaderErrorFallback>
        <div>Test Content</div>
      </ShaderErrorFallback>
    )

    const container = screen.getByText('Test Content').closest('.min-h-screen')
    expect(container).toHaveClass('min-h-screen', 'bg-slate-950', 'relative', 'overflow-hidden')
  })

  it('renders SVG filters', () => {
    render(
      <ShaderErrorFallback>
        <div>Test Content</div>
      </ShaderErrorFallback>
    )

    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    
    const glassFilter = document.querySelector('#glass-effect')
    const gooeyFilter = document.querySelector('#gooey-filter')
    
    expect(glassFilter).toBeInTheDocument()
    expect(gooeyFilter).toBeInTheDocument()
  })

  it('displays notification in bottom-right corner', () => {
    render(
      <ShaderErrorFallback>
        <div>Test Content</div>
      </ShaderErrorFallback>
    )

    const notification = screen.getByText('Visual effects unavailable')
    const notificationContainer = notification.closest('.bg-slate-800\\/90')
    expect(notificationContainer?.parentElement).toHaveClass('absolute', 'bottom-4', 'right-4', 'z-20')
  })
})

describe('MinimalErrorFallback', () => {
  it('renders minimal fallback with children', () => {
    render(
      <MinimalErrorFallback>
        <div>Test Content</div>
      </MinimalErrorFallback>
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('applies correct minimal styling', () => {
    render(
      <MinimalErrorFallback>
        <div data-testid="content">Test Content</div>
      </MinimalErrorFallback>
    )

    const container = screen.getByTestId('content').closest('.min-h-screen')
    expect(container).toHaveClass('min-h-screen', 'bg-slate-950', 'relative')
  })

  it('does not render error notification', () => {
    render(
      <MinimalErrorFallback>
        <div>Test Content</div>
      </MinimalErrorFallback>
    )

    expect(screen.queryByText('Visual effects unavailable')).not.toBeInTheDocument()
  })
})