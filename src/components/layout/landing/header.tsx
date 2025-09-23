"use client"

import type React from "react"
import Link from "next/link"
import { DASHBOARD_ROUTES } from "@/constants/routes"
import { Logo } from "@/components/brand/logo"

interface HeaderProps {
  className?: string
}

export default function Header({ className }: HeaderProps) {
  return (
    <header className={`relative z-20 flex items-center justify-between p-6 ${className || ''}`}>
      {/* Logo */}
      <div className="flex items-center">
        <Logo className="size-10 text-slate-100" />
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
