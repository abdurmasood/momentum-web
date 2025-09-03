"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser } from "@stackframe/stack"
import { useState } from "react"

interface NavigationItem {
  name: string
  href: string
  icon: React.ReactNode
  current?: boolean
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    name: 'Deep Work',
    href: '/dashboard/deep-work',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v6"/>
        <path d="M12 17v6"/>
        <path d="m4.2 4.2 4.2 4.2"/>
        <path d="m15.6 15.6 4.2 4.2"/>
        <path d="M1 12h6"/>
        <path d="M17 12h6"/>
        <path d="m4.2 19.8 4.2-4.2"/>
        <path d="m15.6 8.4 4.2-4.2"/>
      </svg>
    ),
  },
  {
    name: 'Tasks',
    href: '/dashboard/todo',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path d="M9 12l2 2 4-4"/>
        <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
        <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
        <path d="M12 3v6l4-4-4-4z"/>
        <path d="M12 17v6"/>
        <path d="M9 21h6"/>
      </svg>
    ),
  },
  {
    name: 'Messages',
    href: '/dashboard/chat',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        <path d="M8 10h8"/>
        <path d="M8 14h4"/>
      </svg>
    ),
  },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function DashboardSidebar() {
  const pathname = usePathname()
  const user = useUser()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-6 left-6 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="glass-card p-3 rounded-xl text-slate-200 hover:text-blue-300 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 glass-sidebar rounded-r-2xl transform transition-all duration-500 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={classNames(
                  isActive
                    ? 'text-blue-300 bg-white/5 border-l-2 border-blue-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5',
                  'group relative flex items-center px-3 py-2.5 text-sm font-medium rounded-r-lg transition-all duration-200'
                )}
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  {item.icon}
                </div>
                
                {/* Label */}
                <span className="ml-3">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User section */}
      <div className="border-t border-white/5 p-4">
        {user ? (
          <div className="flex items-center hover:bg-white/5 rounded-lg p-2 transition-colors duration-200">
            {/* Avatar */}
            <div className="flex-shrink-0 relative">
              {user.profileImageUrl ? (
                <img
                  className="h-8 w-8 rounded-full"
                  src={user.profileImageUrl}
                  alt={user.displayName || 'User avatar'}
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-xs font-semibold text-white">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              )}
            </div>
            
            {/* User info */}
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">
                {user.displayName || 'User'}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user.primaryEmail}
              </p>
            </div>
            
            {/* Sign out button */}
            <button
              onClick={() => user.signOut()}
              className="ml-2 p-1.5 rounded-md text-slate-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-200"
              title="Sign out"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m0 14l4-4m0 0l4-4m-4 4H9m8 0V9" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex items-center p-2">
            <div className="animate-pulse flex space-x-3">
              <div className="rounded-full bg-slate-700/50 h-8 w-8"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-700/50 rounded w-20"></div>
                <div className="h-2 bg-slate-700/50 rounded w-16"></div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  )
}