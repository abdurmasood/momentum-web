import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { stackServerApp } from './src/stack'

export async function middleware(request: NextRequest) {
  // Only apply to dashboard routes
  if (!request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.next()
  }

  try {
    // Check if user is authenticated
    const user = await stackServerApp.getUser()
    
    if (!user) {
      // Redirect to sign-in page if not authenticated
      return NextResponse.redirect(new URL('/handler/sign-in', request.url))
    }
    
    // User is authenticated, allow access
    return NextResponse.next()
  } catch (error) {
    // Handle different error types appropriately
    if (error instanceof TypeError) {
      // Network or connectivity issues
      console.error('Network error in middleware authentication:', error.message)
      return new Response('Authentication service unavailable', { status: 503 })
    } else if (error && typeof error === 'object' && 'code' in error) {
      // Structured error (e.g., from Stack Auth)
      console.error('Authentication service error:', error)
      const errorWithCode = error as { code: string }
      if (errorWithCode.code === 'UNAUTHENTICATED' || errorWithCode.code === 'UNAUTHORIZED') {
        return NextResponse.redirect(new URL('/handler/sign-in', request.url))
      }
      return new Response('Authentication error', { status: 500 })
    } else {
      // Unknown error, log and fallback to sign-in redirect for safety
      console.error('Unexpected middleware authentication error:', error)
      return NextResponse.redirect(new URL('/handler/sign-in', request.url))
    }
  }
}

export const config = {
  matcher: '/dashboard/:path*'
}