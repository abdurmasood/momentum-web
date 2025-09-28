"use client"

import React, { useState } from "react"
import { Logo } from "@/components/brand/logo"
import { cn } from "@/lib/utils"
import type { LogoBrandProps } from "@/types"

/**
 * Brand logo component with interactive rotation animation
 * Features hover effects and smooth transitions
 */
export const LogoBrand: React.FC<LogoBrandProps> = ({ className = "", textClassName = "" }) => {
  const [rotationCount, setRotationCount] = useState(0)

  const handleHover = () => {
    setRotationCount(prev => prev + 1)
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Logo 
        className={cn(
          "w-6 h-8 text-white transition-transform duration-[2000ms] cursor-pointer",
          {
            "-rotate-[360deg]": rotationCount > 0,
          }
        )}
        onMouseEnter={handleHover}
      />
      <span 
        className={cn(
          "text-lg font-medium text-white cursor-pointer",
          textClassName
        )}
        onMouseEnter={handleHover}
      >
        Momentum
      </span>
    </div>
  )
}