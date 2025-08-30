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
  const navyDeep = gradientColors?.primary[0] || '#0f172a'
  const navyMedium = gradientColors?.primary[1] || '#1e293b'
  const grayMedium = gradientColors?.primary[2] || '#334155'
  const blueDeep = gradientColors?.primary[4] || '#1e3a8a'
  const blueMedium = gradientColors?.secondary[1] || '#1e40af'
  const blueBright = gradientColors?.secondary[2] || '#3b82f6'
  
  return (
    <>
      <style jsx>{`
        .shader-circle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: clamp(200px, 22vw, 340px);
          height: clamp(200px, 22vw, 340px);
          z-index: 3;
          animation: organicMorph 20s ease-in-out infinite;
        }

        .circle-layer {
          position: absolute;
          inset: 0;
          border-radius: 50%;
        }

        .layer-1 {
          background: radial-gradient(ellipse 120% 80% at 30% 40%, 
            ${navyDeep}90 0%,
            ${blueDeep}85 25%,
            ${navyMedium}65 50%,
            transparent 80%);
          animation: shaderFlow1 24s ease-in-out infinite;
          mix-blend-mode: normal;
          filter: blur(4px);
        }

        .layer-2 {
          background: radial-gradient(ellipse 100% 140% at 70% 60%, 
            ${blueMedium}95 0%,
            ${blueBright}90 30%,
            ${grayMedium}70 60%,
            transparent 85%);
          animation: shaderFlow2 28s ease-in-out infinite reverse;
          mix-blend-mode: overlay;
          filter: blur(6px);
        }

        .layer-3 {
          background: radial-gradient(ellipse 90% 110% at 50% 30%, 
            ${blueBright}100 0%,
            ${blueDeep}95 35%,
            ${navyDeep}75 70%,
            transparent 90%);
          animation: shaderFlow3 32s ease-in-out infinite;
          mix-blend-mode: soft-light;
          filter: blur(3px);
        }

        .core-glow {
          background: radial-gradient(circle at center, 
            rgba(59, 130, 246, 1) 0%,
            ${blueMedium}90 20%,
            transparent 60%);
          animation: coreBreathing 12s ease-in-out infinite;
          mix-blend-mode: screen;
          filter: blur(2px);
        }

        .inner-luminosity {
          background: radial-gradient(circle at center, 
            rgba(59, 130, 246, 0.6) 0%,
            rgba(30, 64, 175, 0.4) 30%,
            transparent 50%);
          animation: gentlePulse 16s ease-in-out infinite;
          mix-blend-mode: soft-light;
          filter: blur(1px);
        }

        .outer-halo {
          background: radial-gradient(circle at center, 
            transparent 40%,
            ${blueBright}30 50%,
            ${blueMedium}25 70%,
            transparent 100%);
          animation: haloBreathing 18s ease-in-out infinite;
          mix-blend-mode: screen;
          filter: blur(6px);
        }

        /* Organic morphing animations matching shader patterns */
        @keyframes organicMorph {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
          }
          25% {
            transform: translate(-50%, -50%) scale(1.05, 0.98) rotate(90deg);
          }
          50% {
            transform: translate(-50%, -50%) scale(0.98, 1.08) rotate(180deg);
          }
          75% {
            transform: translate(-50%, -50%) scale(1.02, 0.95) rotate(270deg);
          }
        }

        @keyframes shaderFlow1 {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            border-radius: 50% 40% 60% 50%;
            opacity: 0.6;
          }
          25% {
            transform: scale(1.1, 0.9) rotate(90deg);
            border-radius: 60% 50% 40% 60%;
            opacity: 0.8;
          }
          50% {
            transform: scale(0.9, 1.15) rotate(180deg);
            border-radius: 40% 60% 50% 40%;
            opacity: 0.7;
          }
          75% {
            transform: scale(1.05, 0.95) rotate(270deg);
            border-radius: 50% 40% 60% 50%;
            opacity: 0.9;
          }
        }

        @keyframes shaderFlow2 {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            border-radius: 45% 55% 45% 55%;
            opacity: 0.5;
          }
          33% {
            transform: scale(1.08, 0.92) rotate(-120deg);
            border-radius: 55% 45% 55% 45%;
            opacity: 0.7;
          }
          66% {
            transform: scale(0.95, 1.12) rotate(-240deg);
            border-radius: 50% 50% 45% 55%;
            opacity: 0.6;
          }
        }

        @keyframes shaderFlow3 {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            border-radius: 55% 45% 50% 50%;
            opacity: 0.4;
          }
          40% {
            transform: scale(0.92, 1.18) rotate(144deg);
            border-radius: 45% 55% 45% 55%;
            opacity: 0.6;
          }
          80% {
            transform: scale(1.12, 0.88) rotate(288deg);
            border-radius: 50% 50% 55% 45%;
            opacity: 0.5;
          }
        }

        @keyframes coreBreathing {
          0%, 100% {
            transform: scale(0.85);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.8;
          }
        }

        @keyframes gentlePulse {
          0%, 100% {
            transform: scale(0.9);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.5;
          }
        }

        @keyframes haloBreathing {
          0%, 100% {
            transform: scale(1);
            opacity: 0.1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.25;
          }
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

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .shader-circle,
          .circle-layer {
            animation: none !important;
            transform: translate(-50%, -50%) !important;
            border-radius: 50% !important;
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