import { NextResponse } from "next/server"
import { auth, generateDashboardToken } from "@/lib/auth"

/**
 * POST /api/auth/generate-token
 * 
 * Generates a custom JWT for the dashboard after NextAuth authentication
 * Requires an active NextAuth session
 */
export async function POST(request: Request) {
  try {
    // Verify user is authenticated with NextAuth
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Generate custom JWT for dashboard
    const token = generateDashboardToken({
      id: (session.user as any).id || 'unknown',
      email: session.user.email!,
      name: session.user.name!,
    })

    return NextResponse.json({
      success: true,
      token,
    })
  } catch (error) {
    console.error("Token generation error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to generate token" },
      { status: 500 }
    )
  }
}