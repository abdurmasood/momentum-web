import type React from "react"
import { Suspense } from "react";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "../../stack";
import { AuthProvider } from "../../contexts/auth-context";

/**
 * Auth-specific layout that loads Stack Auth components
 * This isolates the heavy Stack Auth dependencies to only auth pages
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <StackProvider app={stackServerApp}>
      <StackTheme>
        <AuthProvider>
          <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-300 text-sm">Loading authentication...</p>
              </div>
            </div>
          }>
            {children}
          </Suspense>
        </AuthProvider>
      </StackTheme>
    </StackProvider>
  )
}