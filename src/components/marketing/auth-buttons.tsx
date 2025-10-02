"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BUTTON_TEXT } from '@/constants/marketing'

interface AuthButtonsProps {
  signInText?: string
  signUpText?: string
  className?: string
}

/**
 * Authentication buttons component for marketing pages
 * Navigates to login and signup pages with golden ratio proportions
 */
export const AuthButtons: React.FC<AuthButtonsProps> = ({
  signInText = BUTTON_TEXT.SIGN_IN,
  signUpText = BUTTON_TEXT.GET_STARTED,
  className = ""
}) => {
  const router = useRouter()

  const handleSignIn = () => {
    router.push('/login')
  }

  const handleSignUp = () => {
    router.push('/signup')
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Button 
        variant="ghost" 
        size="golden"
        className={cn(
          "text-gray-300 hover:text-white hover:bg-gray-800",
          "rounded-md"
        )}
        onClick={handleSignIn}
      >
        {signInText}
      </Button>
      <Button 
        size="golden"
        className={cn(
          "bg-gray-200 text-black hover:bg-gray-300",
          "rounded-md"
        )}
        onClick={handleSignUp}
      >
        {signUpText}
      </Button>
    </div>
  )
}
