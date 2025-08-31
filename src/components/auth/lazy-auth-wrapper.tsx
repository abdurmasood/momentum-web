/**
 * Lazy-loaded authentication components wrapper
 * 
 * This component provides dynamic imports for auth components,
 * reducing the main bundle size by code-splitting authentication code.
 */

import { lazy, Suspense } from "react"
import ShaderBackground from "@/components/shader-background"
import { SimpleAuthErrorBoundary } from "./auth-error-boundary"

// Lazy load auth components to reduce main bundle size
const LazyCustomAuth = lazy(() => import("./custom-auth"))
const LazyCustomMagicLinkCallback = lazy(() => import("./custom-magic-link-callback"))

/**
 * Loading fallback component for auth pages
 */
function AuthLoadingFallback() {
  return (
    <ShaderBackground hideCircle>
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
          <h2 className="text-xl font-light text-slate-100 mb-2">
            Loading <span className="font-medium italic instrument">Authentication</span>
          </h2>
          <p className="text-sm text-slate-300 font-light">
            Preparing secure sign-in experience...
          </p>
        </div>
      </div>
    </ShaderBackground>
  )
}

/**
 * Error boundary fallback for lazy loading failures
 */
function AuthErrorFallback({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <ShaderBackground hideCircle>
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 mx-auto rounded-full bg-red-600 flex items-center justify-center mb-6">
            <svg className="w-6 h-6 text-red-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-light text-slate-100 mb-2">
            Failed to Load <span className="font-medium italic instrument">Authentication</span>
          </h2>
          <p className="text-sm text-slate-300 mb-6 font-light">
            {error.message || "Authentication components failed to load"}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={onRetry}
              className="px-6 py-3 rounded-lg bg-blue-500/80 backdrop-blur-sm border border-blue-400/30 text-white font-medium text-sm transition-all duration-200 hover:bg-blue-600/90 hover:border-blue-300/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 shadow-lg"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 rounded-lg bg-transparent border border-white/25 text-slate-300 font-light text-sm transition-all duration-200 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </ShaderBackground>
  )
}

/**
 * Wrapper for lazy-loaded auth component with error handling
 */
function LazyAuthComponentWrapper({ 
  component: Component, 
  fallback = <AuthLoadingFallback />
}: {
  component: React.ComponentType
  fallback?: React.ReactNode
  onError?: (error: Error) => void
}) {
  return (
    <Suspense fallback={fallback}>
      <Component />
    </Suspense>
  )
}

/**
 * Lazy-loaded custom auth component
 */
export function LazyCustomAuthComponent() {
  return (
    <SimpleAuthErrorBoundary onError={(error) => console.error("Auth component error:", error)}>
      <LazyAuthComponentWrapper
        component={LazyCustomAuth}
      />
    </SimpleAuthErrorBoundary>
  )
}

/**
 * Lazy-loaded magic link callback component
 */
export function LazyMagicLinkCallbackComponent() {
  return (
    <SimpleAuthErrorBoundary onError={(error) => console.error("Magic link callback error:", error)}>
      <LazyAuthComponentWrapper
        component={LazyCustomMagicLinkCallback}
      />
    </SimpleAuthErrorBoundary>
  )
}

/**
 * Auth component factory with retry capability
 */
export function createLazyAuthComponent(componentType: 'auth' | 'magic-link') {
  return function LazyAuthWithRetry() {
    const handleRetry = () => {
      // Force reload the lazy component
      window.location.reload()
    }

    try {
      if (componentType === 'magic-link') {
        return <LazyMagicLinkCallbackComponent />
      } else {
        return <LazyCustomAuthComponent />
      }
    } catch (error) {
      return <AuthErrorFallback error={error as Error} onRetry={handleRetry} />
    }
  }
}

/**
 * Default exports for easy usage
 */
export const LazyAuth = createLazyAuthComponent('auth')
export const LazyMagicLinkCallback = createLazyAuthComponent('magic-link')