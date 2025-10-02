# Authentication

## Overview

Momentum uses **NextAuth v5** (Auth.js) to handle authentication with two providers:
1. **Google OAuth** - Full OAuth 2.0 flow with Google
2. **Email Magic Links** - Passwordless authentication via Resend

After successful authentication, users are redirected to a separate dashboard application with a secure JWT token.

## Authentication Architecture

### NextAuth v5 Configuration

**Location**: [src/lib/auth.ts](../src/lib/auth.ts)

**Key Features**:
- Prisma adapter for database sessions
- JWT session strategy (7-day expiry)
- Custom callbacks for user data enrichment
- Conditional provider loading based on environment variables

**Configuration Export**:
```typescript
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [GoogleProvider, EmailProvider],
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  secret: env.NEXTAUTH_SECRET,
  // ... callbacks
})
```

### Authentication Providers

#### 1. Google OAuth

**Setup Requirements**:
```bash
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**How to Get Credentials**:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`

**User Data Retrieved**:
- Email (primary identifier)
- Name
- Profile image URL
- Google account ID

**Flow**:
```
User clicks "Continue with Google"
        ↓
Redirects to Google OAuth consent screen
        ↓
User approves permissions
        ↓
Google redirects to /api/auth/callback/google
        ↓
NextAuth creates/updates user in database
        ↓
Redirects to /auth/callback for JWT generation
```

#### 2. Email Magic Links

**Setup Requirements**:
```bash
RESEND_API_KEY=re_your_resend_api_key_here
EMAIL_FROM=Momentum <noreply@yourdomain.com>
```

**How to Get Credentials**:
1. Sign up at [Resend](https://resend.com)
2. Verify your sending domain
3. Generate API key from dashboard
4. Add domain to DNS records (SPF, DKIM, DMARC recommended)

**Flow**:
```
User enters email on /login or /signup
        ↓
NextAuth generates verification token
        ↓
Stores token in database (10-minute expiry)
        ↓
Sends email via Resend with magic link
        ↓
Redirects to /auth/verify-request (confirmation page)
        ↓
User clicks link in email
        ↓
NextAuth validates token
        ↓
Creates/updates user in database
        ↓
Redirects to /auth/callback for JWT generation
```

**Magic Link Expiry**: 10 minutes (configured in [src/lib/auth.ts:65](../src/lib/auth.ts#L65))

**Email Templates**:
- HTML template: [src/lib/email-templates.ts:73](../src/lib/email-templates.ts#L73)
- Plain text fallback: [src/lib/email-templates.ts:173](../src/lib/email-templates.ts#L173)
- Dark theme branded design
- Security: URL validation and HTML escaping

### Environment Variable Validation

**Location**: [src/lib/env.ts](../src/lib/env.ts)

**Three-Tier Validation System**:

**Tier 1 - Always Required**:
- `NEXTAUTH_SECRET` - Min 32 characters, for session encryption
- `JWT_SECRET` - Min 32 characters, for custom token generation
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_DASHBOARD_URL` - Dashboard redirect URL
- `NEXTAUTH_URL` - Required in production for callbacks

**Tier 2 - Provider-Specific** (at least one complete provider required):
- Google OAuth: `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`
- Email Magic Link: `RESEND_API_KEY` + `EMAIL_FROM`

**Tier 3 - Optional**:
- `DIRECT_URL` - Direct database connection for migrations
- `NEXT_PUBLIC_GA_ID` - Google Analytics tracking

**Validation Behavior**:
- Runs at application startup (fails fast)
- Errors displayed with actionable messages
- Warnings shown in development mode
- Test environment skips strict validation

[REVIEW: Confirm if there's a minimum character requirement for NEXTAUTH_URL in production]

## Complete Authentication Flow

### Step-by-Step Process

```
┌─────────────────────────────────────────────────────────────────┐
│                    Authentication Flow                           │
└─────────────────────────────────────────────────────────────────┘

1. User visits /login or /signup
   ├─ See: src/app/login/page.tsx
   └─ See: src/app/signup/page.tsx

2. User chooses authentication method:
   ├─ Google OAuth (GoogleSignInButton component)
   │  └─ Calls: signIn("google", { callbackUrl: "/auth/callback" })
   │
   └─ Email Magic Link (LoginForm/SignupForm component)
      └─ Calls: signIn("email", { email, callbackUrl: "/auth/callback" })

3. NextAuth handles authentication
   ├─ Google OAuth: Redirects to Google consent screen
   └─ Email: Sends magic link, redirects to /auth/verify-request

4. Successful auth redirects to /auth/callback
   └─ See: src/app/auth/callback/page.tsx

5. Callback page generates custom JWT
   ├─ Calls: POST /api/auth/generate-token
   ├─ See: src/app/api/auth/generate-token/route.ts
   └─ Uses: generateDashboardToken() from src/lib/auth.ts

6. Redirect to dashboard with JWT
   └─ URL: {DASHBOARD_URL}/dashboard/auth?token={jwt}

7. Dashboard validates JWT and creates session
   [REVIEW: Document dashboard-side validation process]
```

### JWT Token Generation

**Function**: `generateDashboardToken()` in [src/lib/auth.ts:174](../src/lib/auth.ts#L174)

**Token Payload**:
```typescript
{
  user: {
    id: string,        // User ID from database
    email: string,     // User email
    name: string       // User name or email username as fallback
  },
  exp: number,         // Expiration (7 days from issue)
  iat: number          // Issued at timestamp
}
```

**Security**:
- Signed with `JWT_SECRET` (min 32 characters)
- 7-day expiration
- Contains only necessary user data (no sensitive info)
- Fallback name: Uses email username if name is null (common with magic links)

**Usage**:
```typescript
import { generateDashboardToken } from '@/lib/auth'

const token = generateDashboardToken({
  id: session.user.id,
  email: session.user.email,
  name: session.user.name
})
```

### Session Validation

**Type Guard**: `isValidSession()` in [src/lib/auth.ts:16](../src/lib/auth.ts#L16)

**Validates Session Has**:
- Valid user object
- User ID (string, non-empty)
- User email (string, non-empty)
- User name (optional, string or null)

**Usage Example**:
```typescript
const session = await auth()

if (!isValidSession(session)) {
  return NextResponse.json(
    { success: false, message: "Invalid session" },
    { status: 401 }
  )
}

// TypeScript now knows session.user has id, email, name properties
const token = generateDashboardToken(session.user)
```

## Authentication Pages

### Login Page

**Location**: [src/app/login/page.tsx](../src/app/login/page.tsx)

**Components**:
- `LoginForm` - Email magic link input
- `GoogleSignInButton` - Google OAuth button
- Link to signup page

**Features**:
- Loading states during authentication
- Error handling with user-friendly messages
- Auto-redirect if already authenticated [REVIEW: Is this implemented?]

### Signup Page

**Location**: [src/app/signup/page.tsx](../src/app/signup/page.tsx)

**Components**:
- `SignupForm` - Email magic link input
- `GoogleSignInButton` - Google OAuth button
- Link to login page

**Note**: Signup and login use the same authentication flow. The distinction is UI/copy only.

### Auth Callback Page

**Location**: [src/app/auth/callback/page.tsx](../src/app/auth/callback/page.tsx)

**Purpose**:
- Generates custom JWT after NextAuth authentication
- Redirects to dashboard with token

**Process**:
1. Checks session status with `useSession()` hook
2. If authenticated, calls `/api/auth/generate-token` API
3. Receives JWT token
4. Redirects to `{DASHBOARD_URL}/dashboard/auth?token={jwt}`
5. Shows `WaveLoader` while processing

**Error Handling**:
- Invalid session → Redirect to `/login`
- Token generation failure → Redirect to `/login?error=token_generation_failed`
- AbortController prevents memory leaks on unmount

### Verify Request Page

**Location**: [src/app/auth/verify-request/page.tsx](../src/app/auth/verify-request/page.tsx)

**Purpose**:
- Confirmation page shown after magic link email is sent
- Instructs user to check their email

**Copy** [REVIEW: Verify exact copy]:
- "Check your email"
- "We sent you a login link. Be sure to check your spam too."

## Authentication Components

### LoginForm Component

**Location**: [src/components/marketing/auth/login-form.tsx](../src/components/marketing/auth/login-form.tsx)

**State Management**:
```typescript
const [email, setEmail] = useState("")
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
```

**Submit Handler**:
```typescript
async function handleMagicLink(e: React.FormEvent) {
  e.preventDefault()
  setIsLoading(true)

  await signIn("email", {
    email,
    redirect: true,
    callbackUrl: "/auth/callback",
  })
}
```

**UI Features**:
- Email validation (HTML5 required + type="email")
- Disabled state during loading
- Error message display
- Link to signup page

### SignupForm Component

**Location**: [src/components/marketing/auth/signup-form.tsx](../src/components/marketing/auth/signup-form.tsx)

**Functionality**: Identical to LoginForm (different copy/branding only)

### GoogleSignInButton Component

**Location**: [src/components/marketing/auth/google-signin-button.tsx](../src/components/marketing/auth/google-signin-button.tsx)

**Props**:
```typescript
interface GoogleSignInButtonProps {
  className?: string
  text?: string  // Default: "Continue with Google"
}
```

**Handler**:
```typescript
function handleGoogleSignIn() {
  signIn("google", { callbackUrl: "/auth/callback" })
}
```

**Design**:
- Official Google brand colors in SVG logo
- Outline button variant
- "Golden ratio" button sizing (custom size variant)
- Hover state: `bg-gray-800`

### AuthLayout Component

**Location**: [src/components/marketing/auth/auth-layout.tsx](../src/components/marketing/auth/auth-layout.tsx)

**Purpose**: Shared layout wrapper for auth pages (login, signup)

**Features** [REVIEW: Confirm implementation details]:
- Centered card layout
- Minimal design (no nav/footer)
- Responsive sizing

## API Routes

### NextAuth Handler

**Location**: [src/app/api/auth/[...nextauth]/route.ts](../src/app/api/auth/[...nextauth]/route.ts)

**Endpoints** (auto-generated by NextAuth):
- `GET /api/auth/signin` - Sign in page
- `POST /api/auth/signin/:provider` - Initiate provider sign-in
- `GET/POST /api/auth/callback/:provider` - Provider callback
- `GET /api/auth/signout` - Sign out page
- `POST /api/auth/signout` - Sign out action
- `GET /api/auth/session` - Get session data
- `GET /api/auth/csrf` - CSRF token
- `GET /api/auth/providers` - List available providers

**Implementation**:
```typescript
import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers
```

### Generate Token Endpoint

**Location**: [src/app/api/auth/generate-token/route.ts](../src/app/api/auth/generate-token/route.ts)

**Method**: `POST /api/auth/generate-token`

**Authentication**: Requires active NextAuth session (cookie-based)

**Request**: No body required (uses session cookie)

**Response**:
```typescript
// Success
{
  success: true,
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Error - No session
{
  success: false,
  message: "Invalid session: missing required user information"
}

// Error - Token generation failed
{
  success: false,
  message: "Failed to generate token"
}
```

**Implementation**:
```typescript
export async function POST() {
  const session = await auth()

  if (!isValidSession(session)) {
    return NextResponse.json(
      { success: false, message: "Invalid session" },
      { status: 401 }
    )
  }

  const token = generateDashboardToken({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  })

  return NextResponse.json({ success: true, token })
}
```

## Email Templates

### Security Measures

**URL Validation** ([src/lib/email-templates.ts:19](../src/lib/email-templates.ts#L19)):
- Validates URL format using native `URL` parser
- Enforces HTTP/HTTPS protocol whitelist
- Prevents protocol injection (`javascript:`, `data:`, etc.)
- Throws error for invalid/malformed URLs

**HTML Escaping** ([src/lib/email-templates.ts:52](../src/lib/email-templates.ts#L52)):
- Escapes `<`, `>`, `&`, `"`, `'` characters
- Prevents XSS attacks in email content
- Applied to user-visible URL text (not href attributes)

### HTML Email Template

**Function**: `generateMagicLinkEmail()` in [src/lib/email-templates.ts:73](../src/lib/email-templates.ts#L73)

**Design Features**:
- Dark theme (black background, white text)
- Responsive table layout
- Momentum branding
- Primary CTA button (white background, black text)
- Alternative plain-text URL for accessibility
- Footer with expiry notice and current year

**Structure**:
```html
<!DOCTYPE html>
<html lang="en">
  <body style="background-color: #000000">
    <!-- Logo/Header: "Momentum" -->

    <!-- Main Content Card -->
    <div style="background: #111111; border: 1px solid #222222">
      <h2>Sign in to Momentum</h2>
      <p>Click the button below... expires in 10 minutes.</p>

      <!-- CTA Button -->
      <a href="{validated-url}">Sign In</a>

      <!-- Plain URL -->
      <p>Or copy and paste this URL:</p>
      <p>{escaped-url}</p>
    </div>

    <!-- Footer -->
    <p>Link expires in 10 minutes, single-use only</p>
    <p>Didn't request? Safely ignore</p>
    <p>© {year} Momentum. All rights reserved.</p>
  </body>
</html>
```

### Plain Text Email Template

**Function**: `generateMagicLinkText()` in [src/lib/email-templates.ts:173](../src/lib/email-templates.ts#L173)

**Content**:
```
Sign in to Momentum

Click the link below to sign in to your account:

{validated-url}

This link will expire in 10 minutes and can only be used once.

If you didn't request this email, you can safely ignore it.

© {year} Momentum. All rights reserved.
```

[REVIEW: Test email deliverability with SPF/DKIM/DMARC settings]

## Security Best Practices

### Session Security
- **Strategy**: JWT (stateless)
- **Storage**: HTTP-only cookies (automatic via NextAuth)
- **Expiry**: 7 days
- **Refresh**: [REVIEW: Is session refresh implemented?]
- **CSRF Protection**: Built into NextAuth
- **Secure cookies**: HTTPS-only in production

### Password Policy
- **No passwords**: Passwordless authentication only
- Magic links expire in 10 minutes
- Single-use tokens only

### Rate Limiting
[REVIEW: Document rate limiting implementation for:
- Magic link requests
- Token generation endpoint
- Failed authentication attempts]

### Secret Management
- Never commit secrets to version control
- Use `.env.local` for development (gitignored)
- Environment variable validation enforces minimum lengths
- Secrets should be randomly generated (not user-defined)

**Generate Secure Secrets**:
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate JWT_SECRET
openssl rand -base64 32
```

### Database Security
- User records use CUID for IDs (not auto-incrementing)
- Emails stored as unique indexes
- Cascade deletes for accounts/sessions (privacy)
- SSL connections to Neon PostgreSQL
- Prepared statements via Prisma (SQL injection prevention)

## Cross-Application Authentication

### Dashboard Integration

**Redirect URL Format**:
```
{NEXT_PUBLIC_DASHBOARD_URL}/dashboard/auth?token={jwt}
```

**Dashboard Responsibilities** [REVIEW: Confirm implementation]:
1. Receive JWT from URL parameter
2. Validate JWT signature using shared `JWT_SECRET`
3. Check expiration timestamp
4. Extract user data from token payload
5. Create dashboard session (cookie or local storage)
6. Redirect to dashboard home
7. Clear token from URL

**Shared Configuration**:
- Both apps must use the same `JWT_SECRET`
- Both apps must use the same `DATABASE_URL` (shared user database)
- Dashboard URL must be configured in `NEXT_PUBLIC_DASHBOARD_URL`

**Security Considerations**:
- JWT in URL is single-use (should be cleared immediately)
- HTTPS required in production (prevents token interception)
- Token expiry limits damage from leaked tokens
- Dashboard validates signature before trusting payload

[REVIEW: Document token revocation strategy if a user signs out]

## Testing Authentication

### Manual Testing Checklist

**Google OAuth**:
- [ ] Click "Continue with Google" button
- [ ] Redirected to Google consent screen
- [ ] Approve permissions
- [ ] Redirected back to app
- [ ] User record created/updated in database
- [ ] JWT generated successfully
- [ ] Redirected to dashboard with token

**Email Magic Link**:
- [ ] Enter email and submit
- [ ] Redirected to "Check your email" page
- [ ] Email received (check spam folder)
- [ ] Email contains branded template
- [ ] Click "Sign In" button
- [ ] Redirected back to app
- [ ] User record created/updated in database
- [ ] JWT generated successfully
- [ ] Redirected to dashboard with token

**Error Cases**:
- [ ] Invalid email format (should show validation error)
- [ ] Expired magic link (should show error) [REVIEW: Confirm error message]
- [ ] Already-used magic link (should show error)
- [ ] Missing environment variables (should fail at startup)
- [ ] Invalid JWT secret (should fail token validation)

### Automated Testing

[REVIEW: Document Jest tests for:
- Email template generation
- URL validation
- HTML escaping
- Session validation
- JWT generation/validation]

## Troubleshooting

### Common Issues

**"Invalid session: missing required user information"**:
- Cause: Session doesn't have required user properties
- Fix: Check NextAuth callbacks are populating session.user.id and email
- Debug: Log session object in callback/page.tsx

**Magic link emails not sending**:
- Check `RESEND_API_KEY` is valid
- Verify `EMAIL_FROM` domain is verified in Resend
- Check Resend dashboard for error logs
- Verify SPF/DKIM DNS records

**"Failed to generate token"**:
- Check `JWT_SECRET` is set and >= 32 characters
- Verify user session is valid before calling endpoint
- Check server logs for specific error

**Google OAuth redirect mismatch**:
- Verify redirect URI in Google Cloud Console matches exactly:
  - Dev: `http://localhost:3000/api/auth/callback/google`
  - Prod: `https://yourdomain.com/api/auth/callback/google`
- Check `NEXTAUTH_URL` is set correctly in production

**Database connection errors**:
- Verify `DATABASE_URL` format: `postgresql://user:pass@host/db`
- Check Neon dashboard for connection limits
- Use `DIRECT_URL` for migrations (non-pooled connection)

[REVIEW: Add more common issues based on production experience]

---

*Last Updated: January 2025*
*Version: 1.0.0*
