"use client"

import { useState, useEffect } from "react"
import { useUser, useStackApp } from "@stackframe/stack"
import { useRouter } from "next/navigation"
import ShaderBackground from "@/components/shader-background"
import { useAuthRateLimit, useMagicLinkRateLimit } from "@/hooks/use-rate-limit"
import { 
  validateFormSubmission, 
  validateSecurityHeaders
} from "@/utils/auth-security"
import { AuthErrorHandlers } from "@/utils/error-utils"

export default function CustomAuth() {
  const [email, setEmail] = useState("")
  const [honeypot, setHoneypot] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  
  const user = useUser()
  const stackApp = useStackApp()
  const router = useRouter()
  
  // Rate limiting hooks
  const authRateLimit = useAuthRateLimit()
  const magicLinkRateLimit = useMagicLinkRateLimit(email)

  // Initialize security validation
  useEffect(() => {
    validateSecurityHeaders()
  }, [])

  // Redirect if already signed in
  if (user) {
    router.push("/")
    return null
  }

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMagicLinkSent(false)

    try {
      // Validate form with security checks
      const validation = validateFormSubmission(email, honeypot)
      if (!validation.isValid) {
        setError(validation.errors[0])
        return
      }

      // Check rate limits
      if (!magicLinkRateLimit.canAttempt()) {
        setError(`Too many magic link requests. Please wait ${magicLinkRateLimit.timeRemainingFormatted}`)
        return
      }

      // Record the attempt
      magicLinkRateLimit.recordAttempt()

      // Send magic link with Stack Auth
      await stackApp.sendMagicLinkEmail(email)
      setMagicLinkSent(true)
      
      // Show warnings if any
      if (validation.warnings.length > 0) {
        console.warn('Security warnings:', validation.warnings)
      }
    } catch (err) {
      setError(AuthErrorHandlers.handleMagicLinkSendError(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true)
    setError("")

    try {
      // Check rate limits for OAuth attempts
      if (!authRateLimit.canAttempt()) {
        setError(`Too many login attempts. Please wait ${authRateLimit.timeRemainingFormatted}`)
        setIsGoogleLoading(false)
        return
      }

      // Record the attempt
      authRateLimit.recordAttempt()

      // Proceed with OAuth
      await stackApp.signInWithOAuth('google')
      // OAuth will redirect, so no need for manual redirect
    } catch (err) {
      setError(AuthErrorHandlers.handleOAuthError(err))
      setIsGoogleLoading(false)
    }
  }

  return (
    <ShaderBackground hideCircle>
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <div className="w-full max-w-md">
          {/* Clean auth form - no background card */}
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-light text-slate-100 mb-2">
                Welcome to <span className="font-medium italic instrument">Momentum</span>
              </h1>
              <p className="text-sm text-slate-200 font-light">
                {magicLinkSent ? "Check your email for the magic link" : "Sign in or create your account"}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 rounded-lg bg-red-600 border border-red-700 text-white text-sm shadow-lg">
                {error}
              </div>
            )}

            {/* Rate Limit Warning */}
            {(authRateLimit.isRateLimited || magicLinkRateLimit.isRateLimited) && (
              <div className="mb-6 p-3 rounded-lg bg-amber-600 border border-amber-700 text-white text-sm shadow-lg">
                {authRateLimit.isRateLimited && (
                  <p>Too many authentication attempts. Please wait {authRateLimit.timeRemainingFormatted}</p>
                )}
                {magicLinkRateLimit.isRateLimited && (
                  <p>Magic link limit reached. Please wait {magicLinkRateLimit.timeRemainingFormatted}</p>
                )}
              </div>
            )}

            {/* Success Message */}
            {magicLinkSent && (
              <div className="mb-6 p-3 rounded-lg bg-green-600 border border-green-700 text-white text-sm shadow-lg">
                Magic link sent! Check your email and click the link to continue.
              </div>
            )}

            {/* Google Auth Button */}
            <button
              onClick={handleGoogleAuth}
              disabled={isGoogleLoading || isLoading || authRateLimit.isRateLimited}
              className="w-full mb-6 px-6 py-3 rounded-lg bg-white text-gray-700 border border-gray-200 font-medium text-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isGoogleLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                  Continuing with Google...
                </>
              ) : (
                <>
                  {/* Google Icon */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            {/* Divider */}
            <div className="mb-6 flex items-center">
              <div className="flex-1 border-t border-white/25"></div>
              <span className="px-4 text-xs text-slate-300 font-light">or continue with email</span>
              <div className="flex-1 border-t border-white/25"></div>
            </div>

            {/* Email Magic Link Form */}
            <form onSubmit={handleSendMagicLink} className="space-y-6">
              {/* Honeypot field for bot protection - hidden from users */}
              <input
                type="text"
                name="url"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />
              
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-light text-slate-200 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/25 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 shadow-lg"
                  placeholder="your@email.com"
                  required
                  disabled={isLoading || magicLinkSent || authRateLimit.isRateLimited || magicLinkRateLimit.isRateLimited}
                />
              </div>

              {/* Send Magic Link Button */}
              <button
                type="submit"
                disabled={isLoading || magicLinkSent || authRateLimit.isRateLimited || magicLinkRateLimit.isRateLimited}
                className="w-full px-6 py-3 rounded-lg bg-blue-500/80 backdrop-blur-sm border border-blue-400/30 text-white font-medium text-sm transition-all duration-200 hover:bg-blue-600/90 hover:border-blue-300/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? "Sending magic link..." : 
                 magicLinkSent ? "Magic link sent!" : 
                 magicLinkRateLimit.isRateLimited ? `Wait ${magicLinkRateLimit.timeRemainingFormatted}` :
                 "Continue with Email"}
              </button>

              {magicLinkSent && (
                <button
                  type="button"
                  onClick={() => {
                    setMagicLinkSent(false)
                    setError("")
                  }}
                  className="w-full px-6 py-2 text-sm text-slate-400 hover:text-slate-300 transition-colors duration-200"
                >
                  Send another link
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </ShaderBackground>
  )
}