"use client"

import type React from "react"

import { useRef } from "react"
import { MeshGradient } from "@paper-design/shaders-react"
import { useThemeColors } from "@/hooks/use-theme-colors"

interface ShaderBackgroundProps {
  children: React.ReactNode
}

export default function ShaderBackground({ children }: ShaderBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { filterValues, gradientColors } = useThemeColors()

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* SVG Filters */}
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values={`1 0 0 0 ${filterValues.r}
                      0 1 0 0 ${filterValues.g}
                      0 0 1 0 ${filterValues.b}
                      0 0 0 ${filterValues.opacity} 0`}
              result="tint"
            />
          </filter>
          <filter id="gooey-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Background Shaders */}
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={gradientColors.primary}
        speed={0.3}
      />
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-60"
        colors={gradientColors.secondary}
        speed={0.2}
      />

      {children}
    </div>
  )
}
