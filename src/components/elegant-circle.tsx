"use client"

import type React from "react"

interface ElegantCircleProps {
  className?: string
  /** Colors from theme system for consistent styling */
  gradientColors?: {
    primary: string[]
    secondary: string[]
  }
}

/**
 * Organic circle component that appears as part of the shader background
 * 
 * Features:
 * - Fluid morphing animations matching shader movement
 * - Deep integration with background gradients
 * - Multiple animated layers for depth
 * - Natural, breathing motion patterns
 */
export default function ElegantCircle({ 
  className = "",
  gradientColors 
}: ElegantCircleProps) {
  // Extract colors with more transparency for better blending
  const blueDeep = gradientColors?.primary?.[4] || '#1e3a8a'
  const blueMedium = gradientColors?.secondary?.[1] || '#1e40af'
  const blueBright = gradientColors?.secondary?.[2] || '#3b82f6'
  
  return (
    <>
      <style jsx>{`
        .shader-circle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: clamp(180px, 19vw, 290px);
          height: clamp(180px, 19vw, 290px);
          z-index: 3;
        }

        .circle-layer {
          position: absolute;
          inset: 0;
          border-radius: 50%;
        }

        .layer-1 {
          background: radial-gradient(ellipse 120% 80% at 30% 40%, 
            ${blueBright}95 0%,
            ${blueDeep}90 25%,
            ${blueMedium}70 50%,
            transparent 80%);
          mix-blend-mode: normal;
          filter: blur(4px);
        }

        .layer-2 {
          background: radial-gradient(ellipse 100% 140% at 70% 60%, 
            ${blueBright}100 0%,
            ${blueMedium}95 30%,
            ${blueDeep}75 60%,
            transparent 85%);
          mix-blend-mode: screen;
          filter: blur(6px);
        }

        .layer-3 {
          background: radial-gradient(ellipse 90% 110% at 50% 30%, 
            rgba(59, 130, 246, 1) 0%,
            ${blueBright}98 35%,
            ${blueMedium}80 70%,
            transparent 90%);
          mix-blend-mode: screen;
          filter: blur(3px);
        }

        .core-glow {
          background: radial-gradient(circle at center, 
            rgba(99, 179, 255, 1) 0%,
            rgba(59, 130, 246, 0.95) 15%,
            ${blueBright}85 35%,
            transparent 70%);
          mix-blend-mode: screen;
          filter: blur(1px);
        }

        .inner-luminosity {
          background: radial-gradient(circle at center, 
            rgba(147, 197, 253, 0.9) 0%,
            rgba(99, 179, 255, 0.7) 25%,
            rgba(59, 130, 246, 0.5) 45%,
            transparent 65%);
          mix-blend-mode: screen;
          filter: blur(0.5px);
        }

        .outer-halo {
          background: radial-gradient(circle at center, 
            transparent 40%,
            ${blueBright}30 50%,
            ${blueMedium}25 70%,
            transparent 100%);
          mix-blend-mode: screen;
          filter: blur(6px);
        }


        /* Responsive adjustments */
        @media (max-width: 768px) {
          .layer-1, .layer-2, .layer-3 {
            filter: blur(6px);
          }
          .core-glow {
            filter: blur(3px);
          }
        }

        @media (max-width: 480px) {
          .layer-1, .layer-2, .layer-3 {
            filter: blur(4px);
          }
          .core-glow {
            filter: blur(2px);
          }
        }

        /* Accessibility: Respect reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .circle-layer {
            filter: none !important;
          }
        }

      `}</style>
      
      <div className={`shader-circle ${className}`}>
        {/* Multiple animated layers for depth and organic movement */}
        <div className="circle-layer outer-halo" />
        <div className="circle-layer layer-1" />
        <div className="circle-layer layer-2" />
        <div className="circle-layer layer-3" />
        <div className="circle-layer core-glow" />
        <div className="circle-layer inner-luminosity" />
      </div>
    </>
  )
}