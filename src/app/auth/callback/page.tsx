"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { WaveLoader } from "@/components/ui/wave-loader"

/**
 * Auth callback page
 * After NextAuth authentication, this page:
 * 1. Gets the NextAuth session
 * 2. Generates a custom JWT for the dashboard
 * 3. Redirects to dashboard with the JWT token
 */
export default function AuthCallbackPage() {
  const { data: session, status } = useSession()

  useEffect(() => {
    async function redirectToDashboard() {
      if (status === "authenticated" && session?.user) {
        try {
          // Generate custom JWT for dashboard
          // Session cookie is automatically sent with the request
          const dashboardToken = await fetch("/api/auth/generate-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }).then((res) => res.json())

          if (dashboardToken.token) {
            // Redirect to dashboard with token
            const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || ""
            window.location.href = `${dashboardUrl}/dashboard/auth?token=${dashboardToken.token}`
          }
        } catch (error) {
          console.error("Error generating dashboard token:", error)
          // Fallback: redirect to login
          window.location.href = "/login?error=token_generation_failed"
        }
      } else if (status === "unauthenticated") {
        // No session, redirect to login
        window.location.href = "/login"
      }
    }

    redirectToDashboard()
  }, [session, status])

  // Loading state with wave loader
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <WaveLoader />
    </div>
  )
}