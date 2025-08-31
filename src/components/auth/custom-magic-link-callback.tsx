"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useStackApp } from "@stackframe/stack"
import ShaderBackground from "@/components/shader-background"

export default function CustomMagicLinkCallback() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const stackApp = useStackApp()

  useEffect(() => {
    const handleMagicLinkVerification = async () => {
      const code = searchParams.get('code')
      
      if (!code) {
        setError("Invalid magic link - no verification code found")
        setIsLoading(false)
        return
      }

      try {
        await stackApp.signInWithMagicLink(code)
        setSuccess(true)
        
        // Redirect to home after successful authentication
        setTimeout(() => {
          router.push("/")
        }, 2000)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Magic link verification failed")
      } finally {
        setIsLoading(false)
      }
    }

    handleMagicLinkVerification()
  }, [searchParams, stackApp, router])

  return (
    <ShaderBackground>
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <div className="w-full max-w-md">
          {/* Glass morphism card */}
          <div 
            className="backdrop-blur-xl bg-white/15 border border-white/30 rounded-2xl p-8 shadow-2xl text-center"
            style={{
              filter: "url(#glass-effect)",
            }}
          >
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

            {success && (
              <>
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h1 className="text-2xl font-light text-slate-100 mb-4">
                  Welcome to <span className="font-medium italic instrument">Momentum</span>
                </h1>
                <p className="text-sm text-slate-200 font-light mb-4">
                  You've been successfully signed in!
                </p>
                <p className="text-xs text-slate-400">
                  Redirecting to your dashboard...
                </p>
              </>
            )}

            {error && (
              <>
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
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
                <button
                  onClick={() => router.push("/auth/sign-in")}
                  className="px-6 py-3 rounded-lg bg-blue-500 text-white font-medium text-sm transition-all duration-200 hover:bg-blue-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </ShaderBackground>
  )
}