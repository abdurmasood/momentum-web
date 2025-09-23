"use client"

import type React from "react"

interface ShaderErrorFallbackProps {
  children: React.ReactNode
  error?: Error
  onRetry?: () => void
}

/**
 * Error fallback component for shader loading failures
 * 
 * Provides a graceful degradation when WebGL shaders fail to load,
 * maintaining the layout and offering retry functionality.
 */
export default function ShaderErrorFallback({ 
  children, 
  error, 
  onRetry 
}: ShaderErrorFallbackProps) {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Static gradient background as fallback */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, #1e3a8a 0%, transparent 50%),
            radial-gradient(ellipse 60% 80% at 0% 100%, #0f172a 0%, transparent 50%),
            radial-gradient(ellipse 60% 80% at 100% 100%, #1e293b 0%, transparent 50%)
          `
        }}
      />

      {/* SVG Filters - maintain compatibility */}
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

      {/* Error notification - subtle and non-intrusive */}
      <div className="absolute bottom-4 right-4 z-20">
        <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-lg p-3 max-w-xs">
          <div className="flex items-start gap-3">
            {/* Warning icon */}
            <div className="flex-shrink-0 mt-0.5">
              <svg 
                className="w-4 h-4 text-yellow-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-200">
                Visual effects unavailable
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Using fallback graphics
              </p>
              
              {/* Error details in development */}
              {process.env.NODE_ENV === 'development' && error && (
                <p className="text-xs text-slate-500 mt-2 font-mono truncate">
                  {error.message}
                </p>
              )}
            </div>

            {/* Retry button */}
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex-shrink-0 text-xs text-blue-400 hover:text-blue-300 transition-colors duration-200 px-2 py-1 hover:bg-blue-950/30 rounded"
                aria-label="Retry loading visual effects"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Minimal error fallback for critical failures
 * Used when even the enhanced fallback fails
 */
export function MinimalErrorFallback({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black relative">
      {/* Very basic gradient */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}