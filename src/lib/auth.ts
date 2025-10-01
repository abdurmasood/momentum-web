import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"
import { Resend } from "resend"
import { generateMagicLinkEmail, generateMagicLinkText } from "@/lib/email-templates"

/**
 * Validates JWT_SECRET environment variable
 * Ensures the secret exists and has minimum entropy (32 characters)
 */
function validateJwtSecret(): string {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error(
      'JWT_SECRET environment variable is not set. Please add JWT_SECRET to your .env file.'
    )
  }

  if (secret.length < 32) {
    throw new Error(
      `JWT_SECRET must be at least 32 characters long for security. Current length: ${secret.length}`
    )
  }

  return secret
}

// Validate JWT_SECRET at module load time (fail fast on startup)
const JWT_SECRET = validateJwtSecret()

/**
 * Type guard to validate session has all required user properties
 * Ensures type safety at runtime before generating tokens
 */
export function isValidSession(session: any): session is {
  user: { id: string; email: string; name: string }
} {
  return (
    session != null &&
    session.user != null &&
    typeof session.user.id === 'string' &&
    session.user.id.length > 0 &&
    typeof session.user.email === 'string' &&
    session.user.email.length > 0 &&
    typeof session.user.name === 'string' &&
    session.user.name.length > 0
  )
}

/**
 * NextAuth v5 configuration with Prisma adapter
 * Supports Google OAuth with Neon PostgreSQL database
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Email Magic Link Provider
    EmailProvider({
      server: {
        host: "unused",
        port: 587,
        auth: { user: "unused", pass: "unused" },
      },
      from: process.env.EMAIL_FROM!,
      maxAge: 10 * 60, // Magic link valid for 10 minutes
      
      async sendVerificationRequest({ identifier: email, url, provider }) {
        const resend = new Resend(process.env.RESEND_API_KEY!)
        const { host } = new URL(url)

        try {
          await resend.emails.send({
            from: provider.from,
            to: email,
            subject: `Sign in to Momentum`,
            html: generateMagicLinkEmail({ url, host }),
            text: generateMagicLinkText({ url, host }),
          })
        } catch (error) {
          console.error("Error sending magic link email:", error)
          throw new Error("Failed to send verification email")
        }
      },
    }),
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
    async signIn({ user, account, profile }) {
      // PrismaAdapter automatically creates/updates user in database
      // No need to manually handle user creation
      
      if (account?.provider === "google") {
        console.log("Google user signed in:", user.email)
        // User and Account records are automatically managed by Prisma adapter
      } else if (account?.provider === "email") {
        console.log("Email magic link used:", user.email)
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

  secret: process.env.NEXTAUTH_SECRET,
})

/**
 * Generate custom JWT for dashboard
 * Called after NextAuth authentication succeeds
 */
export function generateDashboardToken(user: { id: string; email: string; name: string }) {
  const token = jwt.sign(
    {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
      iat: Math.floor(Date.now() / 1000),
    },
    JWT_SECRET
  )

  return token
}