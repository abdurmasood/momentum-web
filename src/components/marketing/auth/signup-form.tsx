"use client"

import React from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { GoogleSignInButton } from "./google-signin-button"

interface SignupFormProps {
  className?: string
}

/**
 * Signup form component with golden ratio button sizing
 * Handles user registration with Google OAuth
 */
export const SignupForm: React.FC<SignupFormProps> = ({ 
  className = "" 
}) => {
  return (
    <div className={cn("space-y-6", className)}>
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
