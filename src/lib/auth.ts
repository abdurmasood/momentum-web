import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import jwt from "jsonwebtoken"

/**
 * NextAuth configuration
 * Supports Google OAuth
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
      // TODO: Check if user exists in database
      // If not, create new user record
      
      // For Google OAuth
      if (account?.provider === "google") {
        // You can access Google profile data here
        console.log("Google user signed in:", user.email)
        
        // TODO: Create user in database if doesn't exist
        // const existingUser = await db.user.findUnique({ where: { email: user.email }})
        // if (!existingUser) {
        //   await db.user.create({ data: { email: user.email, name: user.name }})
        // }
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
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  secret: process.env.NEXTAUTH_SECRET,
})

// Export authOptions for backward compatibility
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }: any) {
      if (user) {
        token.userId = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }
      if (account?.provider === "google") {
        token.provider = "google"
      }
      return token
    },
    async session({ session, token }: any) {
      if (session?.user && token) {
        (session.user as any).id = token.userId || token.sub
        if (token.email) session.user.email = token.email as string
        if (token.name) session.user.name = token.name as string
        if (token.picture) session.user.image = token.picture as string
      }
      return session
    },
    async signIn({ user, account }: any) {
      if (account?.provider === "google") {
        console.log("Google user signed in:", user.email)
      }
      return true
    },
    async redirect({ url, baseUrl }: any) {
      if (url.startsWith(baseUrl)) {
        return `${baseUrl}/auth/callback`
      }
      return baseUrl
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 7 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
}

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