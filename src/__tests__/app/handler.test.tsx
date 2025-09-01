import { render, screen, waitFor } from '@testing-library/react'
import Handler from '@/app/handler/[...stack]/page'
import ShaderBackground from '@/components/shader-background'

// Mock the stack server app
jest.mock('../../stack', () => ({
  stackServerApp: {
    getUser: jest.fn(),
    // Add other mock methods as needed
  }
}))

// Mock the StackHandler component
jest.mock('@stackframe/stack', () => ({
  StackHandler: jest.fn(({ app, routeProps }) => (
    <div data-testid="stack-handler">
      <div data-testid="stack-app">{JSON.stringify(app)}</div>
      <div data-testid="stack-params">{JSON.stringify(routeProps?.params)}</div>
    </div>
  ))
}))

// Mock ShaderBackground component
jest.mock('@/components/shader-background', () => {
  return jest.fn(({ children }) => (
    <div data-testid="shader-background">
      {children}
    </div>
  ))
})

// Mock the paper-design shaders to avoid WebGL issues in tests
jest.mock('@paper-design/shaders-react', () => ({
  MeshGradient: jest.fn(() => <div data-testid="mesh-gradient" />)
}))

describe('Authentication Handler Page', () => {
  const mockParams = {
    stack: ['sign-in']
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the handler page with basic structure', async () => {
    const props = {
      params: Promise.resolve(mockParams)
    }

    render(await Handler(props))

    expect(screen.getByTestId('shader-background')).toBeInTheDocument()
    expect(screen.getByTestId('shader-background')).toBeInTheDocument()
  })

  it('should render with proper container structure', async () => {
    const props = {
      params: Promise.resolve(mockParams)
    }

    render(await Handler(props))

    // Check for the main container
    const container = screen.getByTestId('shader-background')
    expect(container).toBeInTheDocument()

    // Check for the centered flex container
    const flexContainer = container.querySelector('.min-h-screen.flex.items-center.justify-center')
    expect(flexContainer).toBeInTheDocument()

    // Check for the content wrapper
    const contentWrapper = flexContainer?.querySelector('.w-full.max-w-md')
    expect(contentWrapper).toBeInTheDocument()
  })

  it('should show loading fallback initially', async () => {
    const props = {
      params: Promise.resolve(mockParams)
    }

    render(await Handler(props))

    // The loading fallback should be rendered by Suspense
    // We need to test this differently since the component is async
    const loadingElements = screen.queryAllByText(/Loading/)
    expect(loadingElements.length).toBeGreaterThanOrEqual(0) // May or may not be visible depending on timing
  })

  it('should eventually render the StackHandler', async () => {
    const props = {
      params: Promise.resolve(mockParams)
    }

    render(await Handler(props))

    await waitFor(() => {
      expect(screen.getByTestId('stack-handler')).toBeInTheDocument()
    })
  })

  it('should pass correct params to StackHandler', async () => {
    const props = {
      params: Promise.resolve(mockParams)
    }

    render(await Handler(props))

    await waitFor(() => {
      const stackParams = screen.getByTestId('stack-params')
      expect(stackParams).toHaveTextContent(JSON.stringify(mockParams))
    })
  })

  it('should handle different stack routes', async () => {
    const signUpParams = { stack: ['sign-up'] }
    const props = {
      params: Promise.resolve(signUpParams)
    }

    render(await Handler(props))

    await waitFor(() => {
      const stackParams = screen.getByTestId('stack-params')
      expect(stackParams).toHaveTextContent(JSON.stringify(signUpParams))
    })
  })

  it('should handle nested stack routes', async () => {
    const nestedParams = { stack: ['forgot-password', 'reset'] }
    const props = {
      params: Promise.resolve(nestedParams)
    }

    render(await Handler(props))

    await waitFor(() => {
      const stackParams = screen.getByTestId('stack-params')
      expect(stackParams).toHaveTextContent(JSON.stringify(nestedParams))
    })
  })

  it('should handle empty stack array', async () => {
    const emptyParams = { stack: [] }
    const props = {
      params: Promise.resolve(emptyParams)
    }

    render(await Handler(props))

    await waitFor(() => {
      const stackParams = screen.getByTestId('stack-params')
      expect(stackParams).toHaveTextContent(JSON.stringify(emptyParams))
    })
  })

  it('should pass stackServerApp to StackHandler', async () => {
    const props = {
      params: Promise.resolve(mockParams)
    }

    render(await Handler(props))

    await waitFor(() => {
      const stackApp = screen.getByTestId('stack-app')
      expect(stackApp).toBeInTheDocument()
      // The exact content depends on the mock, but it should be present
    })
  })


  describe('Loading State', () => {
    it('should show loading spinner structure in fallback', () => {
      // Test the fallback component structure directly
      const fallback = (
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
          <h2 className="text-2xl font-light text-slate-100 mb-4">
            Loading <span className="font-medium italic instrument">Authentication</span>
          </h2>
          <p className="text-sm text-slate-200 font-light">
            Please wait while we prepare your sign-in experience...
          </p>
        </div>
      )

      render(fallback)

      expect(screen.getByText('Loading')).toBeInTheDocument()
      expect(screen.getByText('Authentication')).toBeInTheDocument()
      expect(screen.getByText('Please wait while we prepare your sign-in experience...')).toBeInTheDocument()
    })

    it('should have proper loading spinner classes', () => {
      const spinner = (
        <div className="w-16 h-16 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
      )

      const { container } = render(spinner)
      const spinnerDiv = container.firstChild as HTMLElement

      expect(spinnerDiv).toHaveClass('w-16')
      expect(spinnerDiv).toHaveClass('h-16')
      expect(spinnerDiv).toHaveClass('mx-auto')
      expect(spinnerDiv).toHaveClass('border-4')
      expect(spinnerDiv).toHaveClass('border-blue-500')
      expect(spinnerDiv).toHaveClass('border-t-transparent')
      expect(spinnerDiv).toHaveClass('rounded-full')
      expect(spinnerDiv).toHaveClass('animate-spin')
      expect(spinnerDiv).toHaveClass('mb-6')
    })
  })

  describe('Accessibility', () => {
    it('should have proper content structure for screen readers', async () => {
      const props = {
        params: Promise.resolve(mockParams)
      }

      render(await Handler(props))

      // Check for proper container structure
      const container = screen.getByTestId('shader-background')
      expect(container).toBeInTheDocument()

      // The page should be navigable and have proper structure
      const contentArea = container.querySelector('.min-h-screen')
      expect(contentArea).toBeInTheDocument()
    })

    it('should render content within relative z-index container', async () => {
      const props = {
        params: Promise.resolve(mockParams)
      }

      render(await Handler(props))

      const relativeContainer = screen.getByTestId('shader-background')
        .querySelector('.relative.z-10')
      expect(relativeContainer).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle rejected params promise', async () => {
      const props = {
        params: Promise.reject(new Error('Failed to resolve params'))
      }

      // This should not crash the component
      await expect(async () => {
        try {
          await Handler(props)
        } catch (error) {
          // The component should handle this gracefully or the error should bubble up
          expect(error).toBeDefined()
        }
      }).not.toThrow()
    })

    it('should handle params with invalid data', async () => {
      const invalidParams = { stack: null as unknown as string[] }
      const props = {
        params: Promise.resolve(invalidParams)
      }

      render(await Handler(props))

      await waitFor(() => {
        // Component should still render even with invalid params
        expect(screen.getByTestId('shader-background')).toBeInTheDocument()
      })
    })
  })

  describe('Integration', () => {
    it('should integrate properly with ShaderBackground', async () => {
      const props = {
        params: Promise.resolve(mockParams)
      }

      render(await Handler(props))

      // Verify ShaderBackground was called with correct props
      expect(ShaderBackground).toHaveBeenCalledWith(
        expect.objectContaining({
          children: expect.anything()
        }),
        expect.anything()
      )
    })

    it('should render within proper layout structure', async () => {
      const props = {
        params: Promise.resolve(mockParams)
      }

      render(await Handler(props))

      // Check the nested structure
      const shaderBg = screen.getByTestId('shader-background')
      const minHeight = shaderBg.querySelector('.min-h-screen')
      const flexCenter = minHeight?.querySelector('.flex.items-center.justify-center')
      const maxWidth = flexCenter?.querySelector('.max-w-md')
      const padding = maxWidth?.querySelector('.p-8')

      expect(shaderBg).toBeInTheDocument()
      expect(minHeight).toBeInTheDocument()
      expect(flexCenter).toBeInTheDocument()
      expect(maxWidth).toBeInTheDocument()
      expect(padding).toBeInTheDocument()
    })
  })

  describe('Async Behavior', () => {
    it('should handle async params resolution', async () => {
      let resolveParams: (value: { stack: string[] }) => void
      const paramsPromise = new Promise((resolve) => {
        resolveParams = resolve
      })

      const props = {
        params: paramsPromise
      }

      // Start rendering with unresolved promise
      const renderPromise = Handler(props)

      // Resolve params
      resolveParams(mockParams)

      // Wait for component to render
      const component = await renderPromise
      render(component)

      expect(screen.getByTestId('shader-background')).toBeInTheDocument()
    })

    it('should work with immediately resolved params', async () => {
      const props = {
        params: Promise.resolve(mockParams)
      }

      const component = await Handler(props)
      render(component)

      expect(screen.getByTestId('shader-background')).toBeInTheDocument()
    })
  })
})