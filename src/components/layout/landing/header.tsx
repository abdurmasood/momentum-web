"use client"

import type React from "react"
import Link from "next/link"
import { DASHBOARD_ROUTES } from "@/constants/routes"

interface HeaderProps {
  className?: string
}

export default function Header({ className }: HeaderProps) {
  return (
    <header className={`relative z-20 flex items-center justify-between p-6 ${className || ''}`}>
      {/* Logo */}
      <div className="flex items-center">
        <svg
          fill="currentColor"
          viewBox="0 0 147 70"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Momentum logo"
          className="size-10 translate-x-[-0.5px] text-slate-100"
        >
          <path d="M56 50.2031V14H70V60.1562C70 65.5928 65.5928 70 60.1562 70C57.5605 70 54.9982 68.9992 53.1562 67.1573L0 14H19.7969L56 50.2031Z"></path>
          <path d="M147 56H133V23.9531L100.953 56H133V70H96.6875C85.8144 70 77 61.1856 77 50.3125V14H91V46.1562L123.156 14H91V0H127.312C138.186 0 147 8.81439 147 19.6875V56Z"></path>
        </svg>
      </div>

      {/* Navigation */}
      <nav className="flex items-center space-x-2">
        <a
          href="#"
          className="text-slate-300 hover:text-blue-200 text-xs font-light px-3 py-2 rounded-full hover:bg-blue-950/30 transition-all duration-200"
        >
          Features
        </a>
        <a
          href="#"
          className="text-slate-300 hover:text-blue-200 text-xs font-light px-3 py-2 rounded-full hover:bg-blue-950/30 transition-all duration-200"
        >
          Pricing
        </a>
        <a
          href="#"
          className="text-slate-300 hover:text-blue-200 text-xs font-light px-3 py-2 rounded-full hover:bg-blue-950/30 transition-all duration-200"
        >
          Docs
        </a>
      </nav>

      {/* Login Button Group with Arrow */}
      <div id="gooey-btn" className="relative flex items-center group filter-gooey">
        <Link href={DASHBOARD_ROUTES.ROOT} className="absolute right-0 px-2.5 py-2 rounded-full bg-blue-50 text-slate-900 font-normal text-xs transition-all duration-300 hover:bg-blue-100 cursor-pointer h-8 flex items-center justify-center -translate-x-10 group-hover:-translate-x-20 z-0">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        </Link>
        <Link href={DASHBOARD_ROUTES.ROOT} className="px-6 py-2 rounded-full bg-blue-50 text-slate-900 font-normal text-xs transition-all duration-300 hover:bg-blue-100 cursor-pointer h-8 flex items-center z-10">
          Login
        </Link>
      </div>
    </header>
  )
}
