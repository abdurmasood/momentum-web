"use client"

import type React from "react"

interface ShaderSkeletonProps {
  children: React.ReactNode
}

/**
 * Lightweight placeholder component shown while shader components are loading
 * 
 * Provides a graceful loading experience with minimal visual disruption
 * and maintains layout stability during lazy loading.
 */
export default function ShaderSkeleton({ children }: ShaderSkeletonProps) {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Static background gradient as fallback */}
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, #1e3a8a 0%, transparent 50%),
            radial-gradient(ellipse 60% 80% at 0% 100%, #0f172a 0%, transparent 50%),
            radial-gradient(ellipse 60% 80% at 100% 100%, #1e293b 0%, transparent 50%)
          `
        }}
      />
      
      {/* Subtle loading animation */}
      <div className="absolute inset-0">
        <div className="animate-pulse opacity-30">
          <div 
            className="h-full w-full"
            style={{
              background: `
                linear-gradient(45deg, transparent 30%, #334155 50%, transparent 70%),
                linear-gradient(-45deg, transparent 30%, #1e40af 50%, transparent 70%)
              `,
              backgroundSize: '400% 400%',
              animation: 'gradientShift 8s ease-in-out infinite'
            }}
          />
        </div>
      </div>

      {/* SVG Filters for glass effect compatibility */}
      <svg className="absolute inset-0 w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.05
                      0 1 0 0 0.08
                      0 0 1 0 0.2
                      0 0 0 0.75 0"
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

      {/* Content overlay */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Loading indicator (subtle) */}
      <div className="absolute bottom-4 right-4 z-20">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-light">
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
          <span>Loading shaders...</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </div>
  )
}