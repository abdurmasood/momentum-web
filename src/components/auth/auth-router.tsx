"use client"

import { useSearchParams, usePathname } from "next/navigation"
import CustomAuth from "./custom-auth"
import CustomMagicLinkCallback from "./custom-magic-link-callback"

export default function AuthRouter() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  
  // Check if this is a magic link callback
  if (pathname?.includes('magic-link-callback') || searchParams.get('code')) {
    return <CustomMagicLinkCallback />
  }
  
  // For all other auth routes (/auth/sign-in, /auth/sign-up, etc)
  // use the unified auth component
  return <CustomAuth />
}