"use client"

import React, { useState } from "react"
import { signIn } from "next-auth/react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { GoogleSignInButton } from "./google-signin-button"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SignupFormProps {
  className?: string
}

/**
 * Signup form component with golden ratio button sizing
 * Handles user registration with Google OAuth and email magic links
 */
export const SignupForm: React.FC<SignupFormProps> = ({ 
  className = "" 
}) => {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    
    try {
      await signIn("email", {
        email,
        redirect: true,
        callbackUrl: "/auth/callback",
      })
    } catch (err) {
      console.error("Error sending magic link:", err)
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Email Magic Link Form */}
      <form onSubmit={handleMagicLink} className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="w-full bg-black/50 border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>
        
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <Button 
          type="submit" 
          size="golden"
          disabled={isLoading || !email}
          className="w-full bg-white text-black hover:bg-gray-200"
        >
          {isLoading ? "Sending..." : "Continue with Email"}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-gray-900 px-2 text-gray-500">Or</span>
        </div>
      </div>

      {/* Google Sign In */}
      <GoogleSignInButton text="Continue with Google" />

      {/* Login link */}
      <div className="text-center text-sm text-gray-400">
        Already have an account?{" "}
        <Link 
          href="/login" 
          className="text-white hover:underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  )
}
