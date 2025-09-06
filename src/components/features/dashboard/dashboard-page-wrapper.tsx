"use client"

import { useUser } from "@stackframe/stack"
import { CONTAINER_WIDTHS } from "@/constants/layout"
import type { ReactNode } from "react"

interface DashboardPageWrapperProps {
  children: ReactNode
  /**
   * Container width class - defaults to dashboard width
   * Use CONTAINER_WIDTHS constants or custom Tailwind classes
   */
  containerWidth?: string
  /**
   * Whether to use full screen layout (no padding/container)
   * Useful for immersive experiences like the 3D sphere
   */
  fullScreen?: boolean
  /**
   * Custom background classes - defaults to slate gradient
   */
  backgroundClass?: string
}

/**
 * Reusable wrapper for dashboard pages that handles:
 * - Authentication (redirects if not authenticated)
 * - Common styling and layout
 * - Consistent container sizing
 * - Support for both regular and full-screen layouts
 */
export function DashboardPageWrapper({ 
  children, 
  containerWidth = CONTAINER_WIDTHS.dashboard,
  fullScreen = false,
  backgroundClass = "bg-gradient-to-br from-slate-950 to-slate-900"
}: DashboardPageWrapperProps) {
  // This will redirect to sign-in if user is not authenticated
  useUser({ or: "redirect" })
  
  if (fullScreen) {
    return (
      <div className={`min-h-screen ${backgroundClass}`}>
        {children}
      </div>
    )
  }
  
  return (
    <div className={`min-h-screen ${backgroundClass} p-6 md:p-8`}>
      <div className={`${containerWidth} mx-auto`}>
        {children}
      </div>
    </div>
  )
}