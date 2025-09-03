"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser } from "@stackframe/stack"
import { useState } from "react"
import { UserRoundIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ClockIcon } from "@/components/icons/clock-icon"
import { MessageSquareIcon } from "@/components/icons/message-square-icon"
import { SparklesIcon } from "@/components/icons/sparkles-icon"
import { TelescopeIcon } from "@/components/icons/telescope-icon"
import { LogoutIcon } from "@/components/icons/logout-icon"

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
      <TelescopeIcon size={20} />
    ),
  },
  {
    name: 'Deep Work',
    href: '/dashboard/deep-work',
    icon: (
      <ClockIcon size={20} />
    ),
  },
  {
    name: 'Tasks',
    href: '/dashboard/todo',
    icon: (
      <SparklesIcon size={20} />
    ),
  },
  {
    name: 'Messages',
    href: '/dashboard/chat',
    icon: (
      <MessageSquareIcon size={20} />
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
      <div className={`fixed inset-y-0 left-0 z-50 w-64 glass-sidebar rounded-r-2xl transform transition-all duration-500 ease-in-out flex flex-col ${
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

      {/* User section - Now at absolute bottom */}
      <div className="mt-auto border-t border-white/5 p-4">
        {user ? (
          <div className="flex items-center hover:bg-white/5 rounded-lg p-2 transition-colors duration-200">
            {/* Avatar */}
            <div className="flex-shrink-0 relative">
              {user.profileImageUrl ? (
                <Avatar>
                  <AvatarImage 
                    src={user.profileImageUrl}
                    alt={user.displayName || 'User avatar'}
                  />
                  <AvatarFallback>
                    <UserRoundIcon size={16} className="opacity-60" aria-hidden="true" />
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Avatar>
                  <AvatarFallback>
                    <UserRoundIcon size={16} className="opacity-60" aria-hidden="true" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
            
            {/* User info */}
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">
                {user.displayName}
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
              <LogoutIcon size={16} />
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