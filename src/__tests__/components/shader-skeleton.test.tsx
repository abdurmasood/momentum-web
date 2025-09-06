import { render, screen } from '@testing-library/react'
import ShaderSkeleton from '@/components/visualization/shaders/shader-skeleton'

describe('ShaderSkeleton', () => {
  it('should render children correctly', () => {
    render(
      <ShaderSkeleton>
        <div data-testid="child-content">Test Content</div>
      </ShaderSkeleton>
    )

    expect(screen.getByTestId('child-content')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should have correct container styling', () => {
    render(
      <ShaderSkeleton>
        <div>Test</div>
      </ShaderSkeleton>
    )

    const container = document.querySelector('.min-h-screen.bg-slate-950.relative.overflow-hidden')
    expect(container).toBeInTheDocument()
  })

  it('should render SVG filters for compatibility', () => {
    render(
      <ShaderSkeleton>
        <div>Test</div>
      </ShaderSkeleton>
    )

    const glassFilter = document.querySelector('#glass-effect')
    const gooeyFilter = document.querySelector('#gooey-filter')

    expect(glassFilter).toBeInTheDocument()
    expect(gooeyFilter).toBeInTheDocument()
  })

  it('should have proper filter matrix values', () => {
    render(
      <ShaderSkeleton>
        <div>Test</div>
      </ShaderSkeleton>
    )

    const colorMatrix = document.querySelector('feColorMatrix')
    expect(colorMatrix).toBeInTheDocument()
    
    const valuesAttr = colorMatrix?.getAttribute('values')
    expect(valuesAttr).toContain('0.05') // r value
    expect(valuesAttr).toContain('0.08') // g value
    expect(valuesAttr).toContain('0.2')  // b value
    expect(valuesAttr).toContain('0.75') // opacity value
  })

  it('should render loading indicator', () => {
    render(
      <ShaderSkeleton>
        <div>Test</div>
      </ShaderSkeleton>
    )

    expect(screen.getByText('Loading shaders...')).toBeInTheDocument()
  })

  it('should have loading dots animation', () => {
    render(
      <ShaderSkeleton>
        <div>Test</div>
      </ShaderSkeleton>
    )

    const dots = document.querySelectorAll('.w-1.h-1.bg-blue-400.rounded-full.animate-pulse')
    expect(dots).toHaveLength(3)
    
    // Check that dots have the correct Tailwind animation classes
    dots.forEach(dot => {
      expect(dot).toHaveClass('animate-pulse')
      expect(dot).toHaveClass('bg-blue-400')
    })
  })

  it('should have static background gradient', () => {
    render(
      <ShaderSkeleton>
        <div>Test</div>
      </ShaderSkeleton>
    )

    const gradientDiv = document.querySelector('.absolute.inset-0.opacity-50')
    expect(gradientDiv).toBeInTheDocument()
    // Check that background style is applied (value doesn't matter for this test)
    expect(gradientDiv).toHaveStyle({ background: expect.any(String) })
  })

  it('should have animated gradient overlay', () => {
    render(
      <ShaderSkeleton>
        <div>Test</div>
      </ShaderSkeleton>
    )

    const animatedDiv = document.querySelector('.animate-pulse.opacity-30')
    expect(animatedDiv).toBeInTheDocument()
  })

  it('should be accessible', () => {
    render(
      <ShaderSkeleton>
        <div>Test</div>
      </ShaderSkeleton>
    )

    // SVG should be hidden from screen readers
    const svg = document.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('should maintain proper z-index layering', () => {
    render(
      <ShaderSkeleton>
        <div>Test</div>
      </ShaderSkeleton>
    )

    const contentOverlay = document.querySelector('.relative.z-10')
    const loadingIndicator = document.querySelector('.absolute.bottom-4.right-4.z-20')

    expect(contentOverlay).toBeInTheDocument()
    expect(loadingIndicator).toBeInTheDocument()
  })

  it('should have proper loading indicator styling', () => {
    render(
      <ShaderSkeleton>
        <div>Test</div>
      </ShaderSkeleton>
    )

    const loadingText = screen.getByText('Loading shaders...')
    const parentDiv = loadingText.parentElement
    // Check the parent div has the styling classes (styled-jsx may affect direct element classes)
    expect(parentDiv).toHaveClass('text-xs', 'text-slate-400', 'font-light')
  })
})