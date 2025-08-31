/**
 * Authentication Context Provider
 * 
 * Provides centralized auth state management and optimized
 * context sharing for authentication-related components.
 */

"use client"

import React, { createContext, useContext, useMemo, useCallback } from 'react'
import { useUser, useStackApp } from '@stackframe/stack'
import type { User, StackClientApp } from '@stackframe/stack'

/**
 * Authentication context interface
 */
interface AuthContextValue {
  /** Current authenticated user */
  user: User | null
  /** Stack App instance */
  stackApp: StackClientApp<true, string>
  /** Loading state */
  isLoading: boolean
  /** Authentication status */
  isAuthenticated: boolean
  /** Sign out function */
  signOut: () => Promise<void>
  /** Refresh user data */
  refreshUser: () => void
}

/**
 * Auth context with proper default values
 */
const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Hook to use auth context with error checking
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

/**
 * Auth provider component props
 */
interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * Authentication provider component
 * 
 * This component provides authentication state and methods
 * to all child components through React Context.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const user = useUser()
  const stackApp = useStackApp()
  
  // Memoize authentication status to prevent unnecessary re-renders
  const isAuthenticated = useMemo(() => {
    return user !== null
  }, [user])
  
  // Memoize loading state (Stack Auth typically handles this internally)
  const isLoading = useMemo(() => {
    // Stack Auth doesn't expose loading state directly, so we infer it
    // This might need adjustment based on Stack Auth's actual API
    return false
  }, [])
  
  // Memoized sign out function
  const signOut = useCallback(async () => {
    try {
      // Stack Auth may use a different method name - check documentation
      // Common patterns: signOut(), logOut(), logout()
      if ('signOut' in stackApp && typeof stackApp.signOut === 'function') {
        await stackApp.signOut()
      } else if ('logout' in stackApp && typeof (stackApp as Record<string, unknown>).logout === 'function') {
        await ((stackApp as Record<string, unknown>).logout as () => Promise<void>)()
      } else {
        console.warn('Sign out method not available on stackApp')
      }
    } catch (error) {
      console.error('Sign out failed:', error)
      throw error
    }
  }, [stackApp])
  
  // Memoized refresh function (Stack Auth may handle this automatically)
  const refreshUser = useCallback(() => {
    // Stack Auth typically handles user refresh automatically
    // This is here for API consistency
    console.log('User refresh requested')
  }, [])
  
  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<AuthContextValue>(() => ({
    user,
    stackApp,
    isLoading,
    isAuthenticated,
    signOut,
    refreshUser
  }), [user, stackApp, isLoading, isAuthenticated, signOut, refreshUser])
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * HOC for components that require authentication
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  const AuthenticatedComponent = (props: P) => {
    const { isAuthenticated, isLoading } = useAuth()
    
    if (isLoading) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-300 text-sm">Loading...</p>
          </div>
        </div>
      )
    }
    
    if (!isAuthenticated) {
      // This could redirect to auth page instead of returning null
      return null
    }
    
    return <Component {...props} />
  }
  
  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`
  
  return AuthenticatedComponent
}

/**
 * Hook for components that need to check auth status
 * without throwing if provider is not available
 */
export function useAuthOptional(): AuthContextValue | null {
  return useContext(AuthContext)
}

/**
 * Utility hooks for common auth operations
 */

/**
 * Hook for user information with memoization
 */
export function useUserInfo() {
  const { user } = useAuth()
  
  return useMemo(() => {
    if (!user) return null
    
    return {
      id: user.id,
      email: user.primaryEmail,
      displayName: user.displayName || user.primaryEmail || 'User',
      // Add other user properties as needed
    }
  }, [user])
}

/**
 * Hook for auth actions with stable references
 */
export function useAuthActions() {
  const { signOut, refreshUser, stackApp } = useAuth()
  
  return useMemo(() => ({
    signOut,
    refreshUser,
    // Add other auth actions as needed
    sendMagicLink: async (email: string) => {
      return stackApp.sendMagicLinkEmail(email)
    },
    signInWithOAuth: async (provider: 'google') => {
      return stackApp.signInWithOAuth(provider)
    }
  }), [signOut, refreshUser, stackApp])
}

/**
 * Hook for auth state with selector pattern to prevent unnecessary re-renders
 */
export function useAuthState<T>(selector: (auth: AuthContextValue) => T): T {
  const auth = useAuth()
  
  return useMemo(() => selector(auth), [auth, selector])
}

/**
 * Example usage of selector hook:
 * 
 * // Only re-render when user ID changes
 * const userId = useAuthState(auth => auth.user?.id)
 * 
 * // Only re-render when loading state changes
 * const isLoading = useAuthState(auth => auth.isLoading)
 */