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
    // Enhanced error handling with proper logging and status codes
    const errorContext = {
      path: request.nextUrl.pathname,
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString(),
    }

    // Handle HTTP-like errors with status codes
    if (error && typeof error === 'object' && 'status' in error) {
      const statusError = error as { status: number; message?: string }
      console.error('HTTP error in middleware authentication:', { 
        ...errorContext, 
        status: statusError.status,
        message: statusError.message 
      })
      
      // Handle different status codes appropriately
      if (statusError.status === 401 || statusError.status === 403) {
        return NextResponse.redirect(new URL('/handler/sign-in', request.url))
      } else if (statusError.status === 429) {
        return new Response('Too many requests. Please try again later.', { 
          status: 429,
          headers: { 'Retry-After': '60' }
        })
      } else if (statusError.status >= 500) {
        return new Response('Service temporarily unavailable', { status: 503 })
      } else if (statusError.status >= 400) {
        return NextResponse.redirect(new URL('/handler/sign-in', request.url))
      }
    }
    
    // Handle network and connectivity issues
    if (error instanceof TypeError) {
      console.error('Network error in middleware authentication:', {
        ...errorContext,
        error: error.message,
        stack: error.stack
      })
      return new Response('Authentication service unavailable', { status: 503 })
    }
    
    // Handle structured errors from Stack Auth
    if (error && typeof error === 'object' && 'code' in error) {
      const errorWithCode = error as { code: string; message?: string }
      console.error('Authentication service error:', {
        ...errorContext,
        code: errorWithCode.code,
        message: errorWithCode.message
      })
      
      if (errorWithCode.code === 'UNAUTHENTICATED' || errorWithCode.code === 'UNAUTHORIZED') {
        return NextResponse.redirect(new URL('/handler/sign-in', request.url))
      } else if (errorWithCode.code === 'SERVICE_UNAVAILABLE' || errorWithCode.code === 'TIMEOUT') {
        return new Response('Authentication service temporarily unavailable', { status: 503 })
      }
      
      return new Response('Authentication error', { status: 500 })
    }
    
    // Handle unknown errors with comprehensive logging
    console.error('Unexpected middleware authentication error:', {
      ...errorContext,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      errorType: typeof error,
      errorConstructor: error?.constructor?.name
    })
    
    // For unknown errors, redirect to sign-in as a safe fallback
    // but log detailed information for debugging
    return NextResponse.redirect(new URL('/handler/sign-in', request.url))
  }
}

export const config = {
  matcher: '/dashboard/:path*'
}