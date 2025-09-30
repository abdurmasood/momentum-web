import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"
import { Resend } from "resend"
import { generateMagicLinkEmail, generateMagicLinkText } from "@/lib/email-templates"

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
        // Safely assign properties with fallbacks
        (session.user as any).id = token.userId || token.sub
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
    process.env.JWT_SECRET!
  )

  return token
}