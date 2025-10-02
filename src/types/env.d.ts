/**
 * TypeScript Environment Variable Declarations
 *
 * Extends the NodeJS.ProcessEnv interface to provide type-safe access
 * to environment variables with IDE autocomplete and compile-time checking.
 */

declare namespace NodeJS {
  interface ProcessEnv {
    // Node Environment
    NODE_ENV: 'development' | 'production' | 'test'

    // Core Authentication
    NEXTAUTH_SECRET: string
    NEXTAUTH_URL?: string
    JWT_SECRET: string

    // Database
    DATABASE_URL: string
    DIRECT_URL?: string

    // OAuth Providers (Optional - at least one required)
    GOOGLE_CLIENT_ID?: string
    GOOGLE_CLIENT_SECRET?: string

    // Email Provider (Optional - at least one required)
    RESEND_API_KEY?: string
    EMAIL_FROM?: string

    // Application URLs
    NEXT_PUBLIC_DASHBOARD_URL: string

    // Analytics (Optional)
    NEXT_PUBLIC_GA_ID?: string

    // Build Configuration (Optional)
    ANALYZE?: string
    BUNDLE_ANALYZE?: string
    TURBOPACK?: string
    PERFORMANCE_MONITORING?: string
  }
}

export {}
