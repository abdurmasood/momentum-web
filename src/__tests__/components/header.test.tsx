import { render, screen } from '@testing-library/react'
import Header from '@/components/features/landing/header'

describe('Header', () => {
  it('should render the logo with correct accessibility attributes', () => {
    render(<Header />)

    const logo = screen.getByLabelText('Momentum logo')
    expect(logo).toBeInTheDocument()
    expect(logo.tagName).toBe('svg')
  })

  it('should render navigation links', () => {
    render(<Header />)

    expect(screen.getByText('Features')).toBeInTheDocument()
    expect(screen.getByText('Pricing')).toBeInTheDocument()
    expect(screen.getByText('Docs')).toBeInTheDocument()
  })

  it('should render login button', () => {
    render(<Header />)

    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  it('should apply custom className prop', () => {
    render(<Header className="custom-class" />)

    const header = document.querySelector('header')
    expect(header).toHaveClass('custom-class')
  })

  it('should have correct CSS classes for styling', () => {
    render(<Header />)

    const header = document.querySelector('header')
    expect(header).toHaveClass(
      'relative',
      'z-20',
      'flex',
      'items-center',
      'justify-between',
      'p-6'
    )
  })

  it('should apply gooey filter class instead of inline styles', () => {
    render(<Header />)

    const gooeyButton = document.querySelector('#gooey-btn')
    expect(gooeyButton).toHaveClass('filter-gooey')
    expect(gooeyButton).not.toHaveAttribute('style')
  })

  it('should have proper hover states on navigation links', () => {
    render(<Header />)

    const navLinks = screen.getAllByRole('link')
    navLinks.forEach(link => {
      expect(link).toHaveClass(
        'text-slate-300',
        'hover:text-blue-200',
        'hover:bg-blue-950/30'
      )
    })
  })

  it('should render arrow icon in button', () => {
    render(<Header />)

    const arrowIcon = document.querySelector('svg path[d="M7 17L17 7M17 7H7M17 7V17"]')
    expect(arrowIcon).toBeInTheDocument()
  })

  it('should have correct button styling', () => {
    render(<Header />)

    const loginButton = screen.getByText('Login')
    expect(loginButton.closest('button')).toHaveClass(
      'px-6',
      'py-2',
      'rounded-full',
      'bg-blue-50',
      'text-slate-900'
    )
  })
})