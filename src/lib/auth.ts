import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"
import { Resend } from "resend"
import { generateMagicLinkEmail, generateMagicLinkText } from "@/lib/email-templates"
import { env, JWT_SECRET } from "@/lib/env"

/**
 * Type guard to validate session has all required user properties
 * Ensures type safety at runtime before generating tokens
 * Note: name is optional to support email magic link authentication
 */
export function isValidSession(session: unknown): session is {

  user: { id: string; email: string; name?: string | null }
} {
  return (
    session != null &&
    typeof session === 'object' &&
    'user' in session &&
    session.user != null &&
    typeof session.user === 'object' &&
    'id' in session.user &&
    typeof session.user.id === 'string' &&
    session.user.id.length > 0 &&
    'email' in session.user &&
    typeof session.user.email === 'string' &&
    session.user.email.length > 0 &&
    // Name is optional - accept if it's a string or null/undefined
    (!('name' in session.user) || session.user.name == null || typeof session.user.name === 'string')
  )
}

/**
 * NextAuth v5 configuration with Prisma adapter
 * Supports Google OAuth with Neon PostgreSQL database
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  
  providers: [
    // Google OAuth Provider (conditionally included if configured)
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    // Email Magic Link Provider (conditionally included if configured)
    ...(env.RESEND_API_KEY && env.EMAIL_FROM
      ? [
          EmailProvider({
            server: {
              host: "unused",
              port: 587,
              auth: { user: "unused", pass: "unused" },
            },
            from: env.EMAIL_FROM,
            maxAge: 10 * 60, // Magic link valid for 10 minutes

            async sendVerificationRequest({ identifier: email, url }) {
              const resend = new Resend(env.RESEND_API_KEY!)

              try {
                await resend.emails.send({
                  from: env.EMAIL_FROM!,
                  to: email,
                  subject: `Sign in to Momentum`,
                  html: generateMagicLinkEmail({ url }),
                  text: generateMagicLinkText({ url }),
                })
              } catch (error) {
                console.error("Error sending magic link email:", error)
                throw new Error("Failed to send verification email")
              }
            },
          }),
        ]
      : []),
  ],

  callbacks: {
    // Called when JWT is created or updated
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.userId = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }

      // OAuth sign in (Google)
      if (account?.provider === "google") {
        token.provider = "google"
      } else if (account?.provider === "email") {
        token.provider = "email"
      }

      return token
    },

    // Called whenever session is checked
    async session({ session, token }) {
      if (session?.user && token) {
        // Assign user ID from token (required for session validation)
        session.user.id = token.userId || token.sub || ''

        // Assign other properties from token
        if (token.email) session.user.email = token.email as string
        if (token.name) session.user.name = token.name as string
        if (token.picture) session.user.image = token.picture as string
      }

      return session
    },

    // Called on successful sign in
    async signIn({ user, account }) {
  
      // PrismaAdapter automatically creates/updates user in database
      // No need to manually handle user creation
      
      if (account?.provider === "google") {
        if (process.env.NODE_ENV === 'development') {
          console.log("Google user signed in:", user.email)
        }
        // User and Account records are automatically managed by Prisma adapter
      } else if (account?.provider === "email") {
        if (process.env.NODE_ENV === 'development') {
          console.log("Email magic link used:", user.email)
        }
        // Email verification successful
      }

      return true
    },

    // Custom redirect after sign in
    async redirect({ url, baseUrl }) {
      // After successful auth, redirect to a page that will generate JWT and go to dashboard
      if (url.startsWith(baseUrl)) {
        return `${baseUrl}/auth/callback`
      }
      return baseUrl
    },
  },

  pages: {
    signIn: "/login",
    verifyRequest: "/auth/verify-request",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  secret: env.NEXTAUTH_SECRET,
})

/**
 * Generate custom JWT for dashboard
 * Called after NextAuth authentication succeeds
 * Uses email username as fallback for users without a name (e.g., magic link auth)
 */
export function generateDashboardToken(user: {
  id: string;
  email: string;
  name?: string | null
}) {
  const token = jwt.sign(
    {
      user: {
        id: user.id,
        email: user.email,
        // Use name if available, otherwise fallback to email username
        name: user.name || user.email.split('@')[0],
      },
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
      iat: Math.floor(Date.now() / 1000),
    },
    JWT_SECRET
  )

  return token
}