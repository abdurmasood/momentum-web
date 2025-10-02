"use client"

import React from "react"
import { LogoBrand } from "../logo-brand"
import { cn } from "@/lib/utils"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  className?: string
}

/**
 * Authentication layout component
 * Provides consistent styling for login/signup pages
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  className = ""
}) => {
  return (
    <div className={cn("min-h-screen bg-black text-white flex flex-col", className)}>
      {/* Header with Logo */}
      <header className="px-12 py-6">
        <LogoBrand />
      </header>

      {/* Main Auth Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Title and Subtitle */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-light mb-2 font-sans">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-400 text-sm font-sans">
                {subtitle}
              </p>
            )}
          </div>

          {/* Auth Form Content */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}