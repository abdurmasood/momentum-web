import type React from "react"
import { Suspense } from "react"
import { StackProvider, StackTheme } from "@stackframe/stack"
import { stackServerApp } from "../../stack"
import DashboardSidebar from "@/components/dashboard-sidebar"

/**
 * Dashboard layout with sidebar navigation and authentication
 * Provides consistent layout structure for all dashboard pages
 */
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <StackProvider app={stackServerApp}>
      <StackTheme>
        <Suspense fallback={
          <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-300 text-sm">Loading dashboard...</p>
            </div>
          </div>
        }>
          {/* Dashboard container */}
          <div className="min-h-screen bg-slate-950">
            {/* Sidebar */}
            <DashboardSidebar />
            
            {/* Main content area */}
            <div className="md:pl-64 min-h-screen transition-all duration-300">
              <div className="h-full">
                {children}
              </div>
            </div>
          </div>
        </Suspense>
      </StackTheme>
    </StackProvider>
  )
}