import { render, screen } from '@testing-library/react'
import ShaderBackground from '@/components/shader-background'

// Mock the MeshGradient component
jest.mock('@paper-design/shaders-react', () => ({
  MeshGradient: ({ colors, speed, className }: any) => (
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

describe('ShaderBackground', () => {
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
  })
})