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
    // If there's an error checking authentication, redirect to sign-in
    console.error('Middleware authentication error:', error)
    return NextResponse.redirect(new URL('/handler/sign-in', request.url))
  }
}

export const config = {
  matcher: '/dashboard/:path*'
}