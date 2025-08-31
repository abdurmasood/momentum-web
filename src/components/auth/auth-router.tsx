"use client"

import { useSearchParams, usePathname } from "next/navigation"
import { LazyAuth, LazyMagicLinkCallback } from "./lazy-auth-wrapper"

export default function AuthRouter() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  
  // Check if this is a magic link callback
  if (pathname?.includes('magic-link-callback') || searchParams.get('code')) {
    return <LazyMagicLinkCallback />
  }
  
  // For all other auth routes (/auth/sign-in, /auth/sign-up, etc)
  // use the unified auth component with lazy loading
  return <LazyAuth />
}