"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface GoogleSignInButtonProps {
  className?: string
  text?: string
}

/**
 * Google Sign In button with golden ratio styling
 * Uses NextAuth to handle OAuth flow
 */
export function GoogleSignInButton({ 
  className = "",
  text = "Continue with Google"
}: GoogleSignInButtonProps) {
  const handleGoogleSignIn = () => {
    signIn("google", {
      callbackUrl: "/auth/callback",
    })
  }

  return (
    <Button
      type="button"
      size="golden"
      variant="outline"
      onClick={handleGoogleSignIn}
      className={cn(
        "w-full border-gray-700 text-white hover:bg-gray-800",
        "rounded-md transition-colors",
        "flex items-center justify-center gap-3",
        className
      )}
    >
      {/* Google Icon SVG */}
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
        <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.909-2.259c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
        <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
        <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
      </svg>
      {text}
    </Button>
  )
}