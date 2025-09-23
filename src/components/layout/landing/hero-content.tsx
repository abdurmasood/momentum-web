"use client"

import Link from "next/link"
import { DASHBOARD_ROUTES } from "@/constants/routes"

export default function HeroContent() {
  return (
    <main className="absolute bottom-8 left-8 z-20 max-w-lg">
      <div className="text-left">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-800/80 backdrop-blur-sm mb-4 relative border border-white/20">
          <div className="absolute top-0 left-1 right-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full" />
          <span className="text-slate-200 text-xs font-light relative z-10">✨ New Paper Shaders Experience</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-6xl md:leading-16 tracking-tight font-light text-slate-100 mb-4">
          <span className="font-medium italic instrument">Beautiful</span> Shader
          <br />
          <span className="font-light tracking-tight text-slate-100">Experiences</span>
        </h1>

        {/* Description */}
        <p className="text-xs font-light text-slate-300 mb-4 leading-relaxed">
          Create stunning visual experiences with our advanced shader technology. Interactive lighting, smooth
          animations, and beautiful effects that respond to your every move.
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-4 flex-wrap">
          <button 
            className="px-8 py-3 rounded-full bg-transparent font-normal text-xs transition-all duration-200 hover:bg-white/10 focus:outline-none cursor-pointer"
            style={{
              border: '1px solid #e2e8f0',
              borderColor: '#e2e8f0',
              color: '#e2e8f0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#ffffff'
              e.currentTarget.style.color = '#ffffff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0'
              e.currentTarget.style.color = '#e2e8f0'
            }}
          >
            Pricing
          </button>
          <Link href={DASHBOARD_ROUTES.ROOT} className="px-8 py-3 rounded-full bg-white text-black font-normal text-xs transition-all duration-200 hover:bg-gray-100 cursor-pointer inline-block">
            Get Started
          </Link>
        </div>
      </div>
    </main>
  )
}
