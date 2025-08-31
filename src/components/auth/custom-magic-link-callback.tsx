"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useStackApp } from "@stackframe/stack"
import ShaderBackground from "@/components/shader-background"
import { AuthErrorHandlers } from "@/utils/error-utils"

export default function CustomMagicLinkCallback() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [hasAttemptedVerification, setHasAttemptedVerification] = useState(false)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const stackApp = useStackApp()
  
  // Track component mount state for cleanup
  const mountedRef = useRef(true)
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Stable references to prevent useEffect re-runs
  const stackAppRef = useRef(stackApp)
  const routerRef = useRef(router)
  
  // Update refs when values change
  useEffect(() => {
    stackAppRef.current = stackApp
    routerRef.current = router
  }, [stackApp, router])

  /**
   * Perform redirect with fallback mechanisms
   */
  const performRedirect = useCallback(async () => {
    if (!mountedRef.current) return
    
    setIsRedirecting(true)
    
    try {
      // Attempt immediate redirect using stable router ref
      await routerRef.current.push("/")
    } catch (err) {
      console.warn("Primary redirect failed, trying fallback:", err)
      
      // Fallback: use window.location if available
      if (typeof window !== 'undefined') {
        try {
          window.location.href = "/"
        } catch (locationErr) {
          console.error("Window location redirect also failed:", locationErr)
          // Final fallback - show manual redirect link
          if (mountedRef.current) {
            setError("Redirect failed. Please click here to continue.")
          }
        }
      }
    }
  }, []) // No dependencies needed as we use refs

  /**
   * Handle successful authentication with improved UX
   */
  const handleAuthSuccess = useCallback(() => {
    if (!mountedRef.current) return
    
    setSuccess(true)
    setIsLoading(false)
    
    // Show success message briefly for better UX
    setShowSuccess(true)
    
    // Redirect after a minimal delay for UX (500ms instead of 2000ms)
    redirectTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        performRedirect()
      }
    }, 500)
  }, [performRedirect])

  // Extract code from search params to prevent unnecessary re-runs
  const verificationCode = searchParams.get('code')

  useEffect(() => {
    // Early exit if already attempted verification or component unmounted
    if (hasAttemptedVerification || !mountedRef.current) {
      return
    }

    const handleMagicLinkVerification = async () => {
      if (!verificationCode) {
        if (mountedRef.current) {
          setError("Invalid magic link - no verification code found")
          setIsLoading(false)
          setHasAttemptedVerification(true)
        }
        return
      }

      try {
        // Mark as attempted to prevent duplicate calls
        setHasAttemptedVerification(true)
        
        await stackAppRef.current.signInWithMagicLink(verificationCode)
        
        if (mountedRef.current) {
          handleAuthSuccess()
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(AuthErrorHandlers.handleMagicLinkVerifyError(err))
          setIsLoading(false)
        }
      }
    }

    handleMagicLinkVerification()
  }, [verificationCode, hasAttemptedVerification, handleAuthSuccess]) // Only re-run if code or attempt status changes

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
      }
    }
  }, [])

  return (
    <ShaderBackground hideCircle>
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <div className="w-full max-w-md">
          {/* Clean verification form - no background card */}
          <div className="p-8 text-center">
            {isLoading && (
              <>
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h1 className="text-2xl font-light text-slate-100 mb-4">
                  Verifying your <span className="font-medium italic instrument">magic link</span>
                </h1>
                <p className="text-sm text-slate-200 font-light">
                  Please wait while we verify your authentication...
                </p>
              </>
            )}

            {success && !isRedirecting && showSuccess && (
              <>
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-600 border border-green-700 flex items-center justify-center shadow-lg animate-pulse">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h1 className="text-2xl font-light text-slate-100 mb-4">
                  Welcome to <span className="font-medium italic instrument">Momentum</span>
                </h1>
                <p className="text-sm text-slate-200 font-light mb-4">
                  You&apos;ve been successfully signed in!
                </p>
                <p className="text-xs text-slate-400">
                  Taking you to your dashboard...
                </p>
              </>
            )}

            {isRedirecting && (
              <>
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h1 className="text-2xl font-light text-slate-100 mb-4">
                  Redirecting...
                </h1>
                <p className="text-sm text-slate-200 font-light">
                  Please wait while we take you to your dashboard
                </p>
              </>
            )}

            {error && (
              <>
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-red-600 border border-red-700 flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
                <h1 className="text-2xl font-light text-slate-100 mb-4">
                  Verification <span className="font-medium italic instrument">failed</span>
                </h1>
                <p className="text-sm text-red-300 mb-6">
                  {error}
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => router.push("/auth/sign-in")}
                    className="px-6 py-3 rounded-lg bg-blue-500/80 backdrop-blur-sm border border-blue-400/30 text-white font-medium text-sm transition-all duration-200 hover:bg-blue-600/90 hover:border-blue-300/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 shadow-lg"
                  >
                    Try Again
                  </button>
                  
                  {error.includes("Redirect failed") && (
                    <button
                      onClick={performRedirect}
                      className="px-6 py-2 rounded-lg bg-transparent border border-white/25 text-slate-300 font-light text-sm transition-all duration-200 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    >
                      Continue to Dashboard
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </ShaderBackground>
  )
}