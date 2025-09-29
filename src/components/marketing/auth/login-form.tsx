"use client"

import React from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { GoogleSignInButton } from "./google-signin-button"

interface LoginFormProps {
  className?: string
}

/**
 * Login form component with golden ratio button sizing
 * Handles user authentication with Google OAuth
 */
export const LoginForm: React.FC<LoginFormProps> = ({ 
  className = "" 
}) => {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Google Sign In */}
      <GoogleSignInButton />

      {/* Sign up link */}
      <div className="text-center text-sm text-gray-400">
        Don't have an account?{" "}
        <Link 
          href="/signup" 
          className="text-white hover:underline"
        >
          Sign up
        </Link>
      </div>
    </div>
  )
}
