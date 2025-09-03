"use client"

import type React from 'react'
import { usePreloadDashboard } from '@/hooks/use-preload-dashboard'

/**
 * Props interface for AuthPreloader component
 */
interface AuthPreloaderProps {
  // Currently no props needed, but interface maintained for consistency
}

/**
 * Invisible component that starts preloading dashboard assets
 * during the authentication process
 * 
 * This component renders nothing but triggers background preloading
 * to improve perceived performance when users navigate to the dashboard
 */
export default function AuthPreloader({}: AuthPreloaderProps): React.ReactElement | null {
  const { hasStartedPreloading } = usePreloadDashboard()

  // This component is purely for side effects - it renders nothing
  if (process.env.NODE_ENV === 'development') {
    // Only show debug info in development
    if (hasStartedPreloading) {
      console.log('🔄 Dashboard preloading in progress...')
    }
  }

  // Return null - this component is invisible
  return null
}