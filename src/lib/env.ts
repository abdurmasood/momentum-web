/**
 * Environment Variable Validation
 *
 * Validates all required environment variables at application startup.
 * Provides type-safe access to configuration with runtime validation.
 *
 * Validation runs on module import - fails fast if configuration is incomplete.
 */

// ============================================================================
// Types
// ============================================================================

interface EnvValidationError {
  variable: string
  message: string
}

interface ValidationResult {
  success: boolean
  errors: EnvValidationError[]
  warnings: string[]
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Check if a variable exists and is not empty
 */
function isDefined(value: string | undefined): value is string {
  return value !== undefined && value !== null && value.trim() !== ''
}

/**
 * Validate minimum string length
 */
function validateMinLength(
  varName: string,
  value: string | undefined,
  minLength: number,
  description?: string
): EnvValidationError | null {
  if (!isDefined(value)) {
    return {
      variable: varName,
      message: description || 'Required variable is missing'
    }
  }

  if (value.length < minLength) {
    return {
      variable: varName,
      message: `Must be at least ${minLength} characters (current: ${value.length})`
    }
  }

  return null
}

/**
 * Validate URL format
 */
function validateUrl(
  varName: string,
  value: string | undefined,
  description?: string
): EnvValidationError | null {
  if (!isDefined(value)) {
    return {
      variable: varName,
      message: description || 'Required URL is missing'
    }
  }

  try {
    new URL(value)
    return null
  } catch {
    return {
      variable: varName,
      message: 'Must be a valid URL (e.g., http://localhost:3001 or https://app.example.com)'
    }
  }
}

/**
 * Validate email format
 * Supports both simple format (email@domain.com) and display name format (Name <email@domain.com>)
 */
function validateEmail(
  varName: string,
  value: string | undefined,
  description?: string
): EnvValidationError | null {
  if (!isDefined(value)) {
    return {
      variable: varName,
      message: description || 'Required email is missing'
    }
  }

  // Support both formats:
  // 1. Simple: email@domain.com
  // 2. Display name: Name <email@domain.com>
  const simpleEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const displayNameEmailRegex = /^.+\s<[^\s@]+@[^\s@]+\.[^\s@]+>$/

  if (!simpleEmailRegex.test(value) && !displayNameEmailRegex.test(value)) {
    return {
      variable: varName,
      message: 'Must be a valid email address (e.g., "email@domain.com" or "Name <email@domain.com>")'
    }
  }

  return null
}

/**
 * Validate PostgreSQL connection string
 */
function validatePostgresUrl(
  varName: string,
  value: string | undefined
): EnvValidationError | null {
  if (!isDefined(value)) {
    return {
      variable: varName,
      message: 'PostgreSQL connection string is required'
    }
  }

  if (!value.startsWith('postgresql://') && !value.startsWith('postgres://')) {
    return {
      variable: varName,
      message: 'Must be a valid PostgreSQL connection string (starts with postgresql:// or postgres://)'
    }
  }

  return null
}

// ============================================================================
// Main Validation Function
// ============================================================================

/**
 * Validates all environment variables according to three-tier system:
 * - Tier 1: Always required (core functionality)
 * - Tier 2: Provider-specific (at least one auth provider required)
 * - Tier 3: Optional (warnings only)
 */
function validateEnvironment(): ValidationResult {
  const errors: EnvValidationError[] = []
  const warnings: string[] = []

  // Skip strict validation in test environment
  const isTest = process.env.NODE_ENV === 'test'
  if (isTest) {
    return { success: true, errors: [], warnings: [] }
  }

  // ========================================================================
  // TIER 1: Always Required
  // ========================================================================

  // NextAuth secret for session encryption
  const nextAuthSecretError = validateMinLength(
    'NEXTAUTH_SECRET',
    process.env.NEXTAUTH_SECRET,
    32,
    'Required for NextAuth session encryption (min 32 characters)'
  )
  if (nextAuthSecretError) errors.push(nextAuthSecretError)

  // JWT secret for custom token generation
  const jwtSecretError = validateMinLength(
    'JWT_SECRET',
    process.env.JWT_SECRET,
    32,
    'Required for JWT token generation (min 32 characters)'
  )
  if (jwtSecretError) errors.push(jwtSecretError)

  // Database connection
  const databaseUrlError = validatePostgresUrl(
    'DATABASE_URL',
    process.env.DATABASE_URL
  )
  if (databaseUrlError) errors.push(databaseUrlError)

  // Dashboard URL for post-auth redirects
  const dashboardUrlError = validateUrl(
    'NEXT_PUBLIC_DASHBOARD_URL',
    process.env.NEXT_PUBLIC_DASHBOARD_URL,
    'Required for post-authentication redirects'
  )
  if (dashboardUrlError) errors.push(dashboardUrlError)

  // NextAuth URL (required in production)
  if (process.env.NODE_ENV === 'production') {
    const nextAuthUrlError = validateUrl(
      'NEXTAUTH_URL',
      process.env.NEXTAUTH_URL,
      'Required in production for NextAuth callbacks'
    )
    if (nextAuthUrlError) errors.push(nextAuthUrlError)
  }

  // ========================================================================
  // TIER 2: Auth Provider Validation
  // At least ONE complete provider must be configured
  // ========================================================================

  const hasGoogleOAuth =
    isDefined(process.env.GOOGLE_CLIENT_ID) &&
    isDefined(process.env.GOOGLE_CLIENT_SECRET)

  const hasEmailAuth =
    isDefined(process.env.RESEND_API_KEY) &&
    isDefined(process.env.EMAIL_FROM)

  // Validate that at least one provider is fully configured
  if (!hasGoogleOAuth && !hasEmailAuth) {
    errors.push({
      variable: 'AUTH_PROVIDER',
      message: 'At least one authentication provider must be configured:\n' +
        '  • Google OAuth: Set both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET\n' +
        '  • Email Magic Link: Set both RESEND_API_KEY and EMAIL_FROM'
    })
  }

  // Validate partial configurations (warn if incomplete)
  const hasPartialGoogle =
    (isDefined(process.env.GOOGLE_CLIENT_ID) && !isDefined(process.env.GOOGLE_CLIENT_SECRET)) ||
    (!isDefined(process.env.GOOGLE_CLIENT_ID) && isDefined(process.env.GOOGLE_CLIENT_SECRET))

  if (hasPartialGoogle) {
    warnings.push(
      'Incomplete Google OAuth configuration. Both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required.'
    )
  }

  const hasPartialEmail =
    (isDefined(process.env.RESEND_API_KEY) && !isDefined(process.env.EMAIL_FROM)) ||
    (!isDefined(process.env.RESEND_API_KEY) && isDefined(process.env.EMAIL_FROM))

  if (hasPartialEmail) {
    warnings.push(
      'Incomplete Email provider configuration. Both RESEND_API_KEY and EMAIL_FROM are required.'
    )
  }

  // Validate email format if EMAIL_FROM is provided
  if (isDefined(process.env.EMAIL_FROM)) {
    const emailFromError = validateEmail(
      'EMAIL_FROM',
      process.env.EMAIL_FROM,
      'Must be a valid email address for sending magic links'
    )
    if (emailFromError) errors.push(emailFromError)
  }

  // ========================================================================
  // TIER 3: Optional Variables (Warnings Only)
  // ========================================================================

  // Direct database URL for Prisma Migrate (only needed for migrations, not runtime)
  if (!isDefined(process.env.DIRECT_URL) && process.env.NODE_ENV === 'development') {
    warnings.push('DIRECT_URL not set - Prisma migrations may not work with connection pooling')
  }

  // Note: NEXT_PUBLIC_GA_ID is optional and won't generate warnings
  // Set it when you're ready to enable Google Analytics tracking

  return {
    success: errors.length === 0,
    errors,
    warnings
  }
}

// ============================================================================
// Execute Validation & Export Config
// ============================================================================

/**
 * Run validation at module load time
 * This ensures the application fails fast if configuration is incomplete
 */
const validationResult = validateEnvironment()

// Display warnings in development
if (validationResult.warnings.length > 0 && process.env.NODE_ENV === 'development') {
  console.warn('\n⚠️  Environment Configuration Warnings:\n')
  validationResult.warnings.forEach(warning => {
    console.warn(`  • ${warning}`)
  })
  console.warn('')
}

// Throw error if validation failed
if (!validationResult.success) {
  const errorMessage = [
    '',
    '❌ Environment Validation Failed',
    '',
    'Missing or invalid environment variables:',
    ...validationResult.errors.map(err => `  • ${err.variable}: ${err.message}`),
    '',
    'Please check your .env file and ensure all required variables are set.',
    'See .env.example for reference.',
    ''
  ].join('\n')

  throw new Error(errorMessage)
}

/**
 * Type-safe environment configuration
 * All values are validated at runtime
 */
export const env = {
  // Core Authentication
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  JWT_SECRET: process.env.JWT_SECRET!,

  // Database
  DATABASE_URL: process.env.DATABASE_URL!,
  DIRECT_URL: process.env.DIRECT_URL,

  // OAuth Providers
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

  // Email Provider
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,

  // Application URLs
  NEXT_PUBLIC_DASHBOARD_URL: process.env.NEXT_PUBLIC_DASHBOARD_URL!,

  // Analytics (Optional)
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,

  // System
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const

/**
 * Export individual validated values for convenience
 */
export const JWT_SECRET = env.JWT_SECRET
export const NEXTAUTH_SECRET = env.NEXTAUTH_SECRET
export const DATABASE_URL = env.DATABASE_URL
