import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HeroContent from '@/components/hero-content'

describe('HeroContent', () => {
  it('should render the main heading with correct text', () => {
    render(<HeroContent />)

    expect(screen.getByText('Beautiful')).toBeInTheDocument()
    expect(screen.getByText('Shader')).toBeInTheDocument()
    expect(screen.getByText('Experiences')).toBeInTheDocument()
  })

  it('should render the new feature badge', () => {
    render(<HeroContent />)

    expect(screen.getByText('✨ New Paper Shaders Experience')).toBeInTheDocument()
  })

  it('should render the description text', () => {
    render(<HeroContent />)

    const description = screen.getByText(/Create stunning visual experiences/i)
    expect(description).toBeInTheDocument()
    expect(description).toHaveClass('text-xs', 'font-light', 'text-slate-300')
  })

  it('should render both action buttons', () => {
    render(<HeroContent />)

    const pricingButton = screen.getByRole('button', { name: /pricing/i })
    const getStartedButton = screen.getByRole('button', { name: /get started/i })

    expect(pricingButton).toBeInTheDocument()
    expect(getStartedButton).toBeInTheDocument()
  })

  it('should apply correct styling classes to main container', () => {
    render(<HeroContent />)

    const mainElement = document.querySelector('main')
    expect(mainElement).toHaveClass(
      'absolute',
      'bottom-8',
      'left-8',
      'z-20',
      'max-w-lg'
    )
  })

  it('should apply glass effect filter to the badge', () => {
    render(<HeroContent />)

    const badgeElement = document.querySelector('[style*="filter: url(#glass-effect)"]')
    expect(badgeElement).toBeInTheDocument()
    expect(badgeElement).toHaveClass(
      'inline-flex',
      'items-center',
      'px-3',
      'py-1',
      'rounded-full',
      'bg-white/5',
      'backdrop-blur-sm'
    )
  })

  it('should have correct typography classes for headings', () => {
    render(<HeroContent />)

    const h1 = document.querySelector('h1')
    expect(h1).toHaveClass(
      'text-5xl',
      'md:text-6xl',
      'md:leading-16',
      'tracking-tight',
      'font-light',
      'text-slate-100',
      'mb-4'
    )

    const beautifulSpan = screen.getByText('Beautiful')
    expect(beautifulSpan).toHaveClass('font-medium', 'italic', 'instrument')
  })

  it('should style buttons correctly', () => {
    render(<HeroContent />)

    const pricingButton = screen.getByRole('button', { name: /pricing/i })
    expect(pricingButton).toHaveClass(
      'px-8',
      'py-3',
      'rounded-full',
      'bg-transparent',
      'border',
      'border-slate-500',
      'text-slate-200'
    )

    const getStartedButton = screen.getByRole('button', { name: /get started/i })
    expect(getStartedButton).toHaveClass(
      'px-8',
      'py-3',
      'rounded-full',
      'bg-blue-500',
      'text-white'
    )
  })

  it('should have hover states on buttons', () => {
    render(<HeroContent />)

    const pricingButton = screen.getByRole('button', { name: /pricing/i })
    const getStartedButton = screen.getByRole('button', { name: /get started/i })

    expect(pricingButton).toHaveClass('hover:bg-blue-950/30', 'hover:border-blue-400')
    expect(getStartedButton).toHaveClass('hover:bg-blue-600')
  })

  it('should be accessible with proper semantic structure', () => {
    render(<HeroContent />)

    // Should have a main landmark
    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()

    // Should have proper heading hierarchy
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toBeInTheDocument()

    // Buttons should be focusable
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toHaveClass('cursor-pointer')
    })
  })

  it('should render decorative gradient line in badge', () => {
    render(<HeroContent />)

    const gradientLine = document.querySelector('.bg-gradient-to-r.from-transparent.via-blue-400\\/20.to-transparent')
    expect(gradientLine).toBeInTheDocument()
    expect(gradientLine).toHaveClass('absolute', 'top-0', 'left-1', 'right-1', 'h-px', 'rounded-full')
  })

  it('should have responsive text sizing', () => {
    render(<HeroContent />)

    const h1 = document.querySelector('h1')
    expect(h1).toHaveClass('text-5xl', 'md:text-6xl', 'md:leading-16')
  })

  it('should handle button interactions', async () => {
    const user = userEvent.setup()
    render(<HeroContent />)

    const pricingButton = screen.getByRole('button', { name: /pricing/i })
    const getStartedButton = screen.getByRole('button', { name: /get started/i })

    // Buttons should be clickable (no specific handlers but should not throw)
    await user.click(pricingButton)
    await user.click(getStartedButton)

    // Test passes if no errors are thrown
    expect(pricingButton).toBeInTheDocument()
    expect(getStartedButton).toBeInTheDocument()
  })

  it('should have correct z-index layering', () => {
    render(<HeroContent />)

    const main = document.querySelector('main')
    const badge = document.querySelector('.relative.z-10')

    expect(main).toHaveClass('z-20')
    expect(badge).toBeInTheDocument() // Badge text has z-10
  })

  it('should contain all expected text content', () => {
    render(<HeroContent />)

    // Check all text content is present
    expect(screen.getByText('✨ New Paper Shaders Experience')).toBeInTheDocument()
    expect(screen.getByText('Beautiful')).toBeInTheDocument()
    expect(screen.getByText('Shader')).toBeInTheDocument()
    expect(screen.getByText('Experiences')).toBeInTheDocument()
    expect(screen.getByText(/Create stunning visual experiences/)).toBeInTheDocument()
    expect(screen.getByText(/Interactive lighting, smooth animations/)).toBeInTheDocument()
    expect(screen.getByText('Pricing')).toBeInTheDocument()
    expect(screen.getByText('Get Started')).toBeInTheDocument()
  })
})