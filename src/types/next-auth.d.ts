import { DefaultSession } from "next-auth"
import { DefaultJWT } from "next-auth/jwt"

/**
 * Type declarations for NextAuth
 * Extends default types to include custom properties
 */

declare module "next-auth" {
  /**
   * Extends the built-in session type with custom user properties
   */
  interface Session {
    user: {
      /** User's unique database ID */
      id: string
    } & DefaultSession["user"]
  }

  /**
   * Extends the built-in user type
   */
  interface User {
    id: string
    email: string
    name?: string | null
    image?: string
  }
}

declare module "next-auth/jwt" {
  /**
   * Extends the JWT token with custom claims
   */
  interface JWT extends DefaultJWT {
    userId?: string
    provider?: string
  }
}
