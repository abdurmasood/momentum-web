"use client"

import Link from "next/link"

export default function HeroContent() {
  return (
    <main className="absolute bottom-8 left-8 z-20 max-w-lg">
      <div className="text-left">
        <div
          className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 backdrop-blur-sm mb-4 relative"
          style={{
            filter: "url(#glass-effect)",
          }}
        >
          <div className="absolute top-0 left-1 right-1 h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent rounded-full" />
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
          <button className="px-8 py-3 rounded-full bg-transparent border border-slate-500 text-slate-200 font-normal text-xs transition-all duration-200 hover:bg-blue-950/30 hover:border-blue-400 cursor-pointer">
            Pricing
          </button>
          <Link href="/handler/sign-in" className="px-8 py-3 rounded-full bg-blue-500 text-white font-normal text-xs transition-all duration-200 hover:bg-blue-600 cursor-pointer inline-block">
            Get Started
          </Link>
        </div>
      </div>
    </main>
  )
}
