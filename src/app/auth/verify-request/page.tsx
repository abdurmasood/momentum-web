import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Check Your Email | Momentum",
  description: "A sign-in link has been sent to your email address"
}

/**
 * Email verification request page
 * Shown after user submits email for magic link authentication
 */
export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header with Logo */}
      <header className="px-12 py-6">
        <Link href="/">
          <h1 className="text-2xl font-light tracking-tight">Momentum</h1>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20">
              <svg 
                className="w-8 h-8 text-green-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-light mb-4">Check your email</h1>

          {/* Description */}
          <p className="text-gray-400 mb-2 text-base">
            A sign-in link has been sent to your email address.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Click the link in the email to complete your sign-in. The link will expire in 10 minutes.
          </p>

          {/* Additional Info */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-6">
            <p className="text-sm text-gray-400 mb-3">
              <strong className="text-gray-300">Didn&apos;t receive the email?</strong>
            </p>
            <ul className="text-sm text-gray-500 space-y-2 text-left">
              <li>• Check your spam or junk folder</li>
              <li>• Make sure you entered the correct email address</li>
              <li>• Wait a few minutes for the email to arrive</li>
            </ul>
          </div>

          {/* Back to Login */}
          <Link 
            href="/login"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back to login
          </Link>
        </div>
      </main>
    </div>
  )
}