"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { MeshGradient } from "@paper-design/shaders-react"

interface ShaderBackgroundProps {
  children: React.ReactNode
}

export default function ShaderBackground({ children }: ShaderBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // State for computed CSS variable values with fallbacks
  const [filterValues, setFilterValues] = useState({
    r: 0.05,
    g: 0.08,
    b: 0.2,
    opacity: 0.75
  })
  
  const [gradientColors, setGradientColors] = useState({
    primary: ["#0f172a", "#1e293b", "#334155", "#0c1220", "#1e3a8a"],
    secondary: ["#0f172a", "#1e40af", "#3b82f6", "#1e293b"]
  })
  
  // Read CSS variables and provide browser-compatible values
  useEffect(() => {
    const computedStyle = getComputedStyle(document.documentElement)
    
    // Read filter values
    setFilterValues({
      r: parseFloat(computedStyle.getPropertyValue('--filter-glass-r')) || 0.05,
      g: parseFloat(computedStyle.getPropertyValue('--filter-glass-g')) || 0.08,
      b: parseFloat(computedStyle.getPropertyValue('--filter-glass-b')) || 0.2,
      opacity: parseFloat(computedStyle.getPropertyValue('--filter-glass-opacity')) || 0.75
    })
    
    // Read gradient colors
    const navyDeep = computedStyle.getPropertyValue('--shader-navy-deep').trim() || "#0f172a"
    const navyMedium = computedStyle.getPropertyValue('--shader-navy-medium').trim() || "#1e293b"
    const grayMedium = computedStyle.getPropertyValue('--shader-gray-medium').trim() || "#334155"
    const navyDarker = computedStyle.getPropertyValue('--shader-navy-darker').trim() || "#0c1220"
    const blueDeep = computedStyle.getPropertyValue('--shader-blue-deep').trim() || "#1e3a8a"
    const blueMedium = computedStyle.getPropertyValue('--shader-blue-medium').trim() || "#1e40af"
    const blueBright = computedStyle.getPropertyValue('--shader-blue-bright').trim() || "#3b82f6"
    
    setGradientColors({
      primary: [navyDeep, navyMedium, grayMedium, navyDarker, blueDeep],
      secondary: [navyDeep, blueMedium, blueBright, navyMedium]
    })
  }, [])

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
