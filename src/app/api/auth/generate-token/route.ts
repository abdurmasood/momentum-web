import { NextResponse } from "next/server"
import { auth, generateDashboardToken, isValidSession } from "@/lib/auth"

/**
 * POST /api/auth/generate-token
 *
 * Generates a custom JWT for the dashboard after NextAuth authentication
 * Requires an active NextAuth session with valid user properties
 */
export async function POST() {

  try {
    // Verify user is authenticated with NextAuth
    const session = await auth()

    // Validate session has all required properties using type guard
    if (!isValidSession(session)) {
      console.error("Invalid session: missing required user properties")


      return NextResponse.json(
        {
          success: false,
          message: "Invalid session: missing required user information"
        },
        { status: 401 }
      )
    }

    // Generate custom JWT for dashboard
    // Type guard ensures session.user has id, email, and name
    const token = generateDashboardToken({
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
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