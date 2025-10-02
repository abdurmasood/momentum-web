# Architecture

## Overview

**Momentum** is a Next.js 15.5 marketing and authentication site that serves as the entry point to the Momentum platform. It handles user authentication via Google OAuth and email magic links, then securely redirects authenticated users to a separate dashboard application using JWT tokens.

## System Architecture

### Two-Application Model

The Momentum platform follows a **split-architecture** pattern with two separate deployments:

```
┌─────────────────────────────────────────────────────────────┐
│                     Momentum Ecosystem                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────┐         ┌────────────────────┐    │
│  │   momentum (web)     │         │   momentum-app     │    │
│  │  Marketing + Auth    │────────▶│    Dashboard       │    │
│  │                      │   JWT   │                    │    │
│  │  - Landing pages     │         │  - Main app UI     │    │
│  │  - NextAuth v5       │         │  - WebGL features  │    │
│  │  - Google OAuth      │         │  - User dashboard  │    │
│  │  - Magic links       │         │                    │    │
│  └──────────────────────┘         └────────────────────┘    │
│           │                                 ▲                │
│           │                                 │                │
│           ▼                                 │                │
│  ┌──────────────────────┐                  │                │
│  │   Neon PostgreSQL    │──────────────────┘                │
│  │   (via Prisma)       │                                   │
│  └──────────────────────┘                                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Why This Architecture?**

- **Separation of concerns**: Marketing/auth logic isolated from app logic
- **Independent scaling**: Each app can scale based on its own traffic patterns
- **Deployment flexibility**: Deploy marketing updates without touching the dashboard
- **Security**: Authentication happens in a separate context from the main application
- **Performance**: Smaller bundle sizes for each application

[REVIEW: Add any business reasons or historical context for choosing this architecture]

### Authentication Flow

```
User visits /login or /signup
        ↓
Chooses auth method (Google OAuth or Email Magic Link)
        ↓
NextAuth v5 handles authentication
        ↓
Redirects to /auth/callback
        ↓
Callback page calls /api/auth/generate-token
        ↓
Custom JWT generated with user data
        ↓
Redirect to momentum-app dashboard with JWT in URL
        ↓
Dashboard validates JWT and creates session
        ↓
User accesses dashboard features
```

### Cross-Application Communication

**JWT Token Structure**:
```typescript
{
  user: {
    id: string,        // User ID from database
    email: string,     // User email
    name: string       // User name (or email username as fallback)
  },
  exp: number,         // Expiration timestamp (7 days)
  iat: number          // Issued at timestamp
}
```

**Security Measures**:
- JWT signed with `JWT_SECRET` (min 32 characters)
- 7-day expiration
- HTTPS-only in production
- Validated on both apps

[REVIEW: Document how the dashboard app validates the JWT]

## Tech Stack

### Frontend
- **Framework**: Next.js 15.5 with App Router
- **React**: 19.1.0 (latest stable)
- **TypeScript**: v5 with strict mode
- **Styling**: Tailwind CSS 4.x
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion 12.x
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js (via Next.js server)
- **Authentication**: NextAuth v5 (beta.29)
- **Database ORM**: Prisma 6.16.2
- **Database**: Neon PostgreSQL (serverless)
- **Email Service**: Resend (magic link delivery)

### Build & Development
- **Bundler**: Turbopack (Next.js 15+ default)
- **Package Manager**: npm
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint 9 with Next.js config

[REVIEW: Add deployment platform details - is this Vercel, AWS, etc?]

## Project Structure

```
momentum/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (marketing)/         # Marketing layout group
│   │   │   ├── layout.tsx       # Marketing-specific layout
│   │   │   └── page.tsx         # Homepage
│   │   │
│   │   ├── auth/                # Auth pages
│   │   │   ├── callback/        # JWT generation & redirect
│   │   │   └── verify-request/  # Magic link confirmation
│   │   │
│   │   ├── login/               # Login page
│   │   ├── signup/              # Signup page
│   │   │
│   │   ├── api/                 # API routes
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/  # NextAuth handler
│   │   │   │   └── generate-token/ # Custom JWT endpoint
│   │   │   └── cron/            # Scheduled jobs
│   │   │
│   │   ├── layout.tsx           # Root layout
│   │   └── loading.tsx          # Global loading state
│   │
│   ├── components/
│   │   ├── marketing/           # Marketing components
│   │   │   ├── auth/           # Auth forms & buttons
│   │   │   ├── navigation.tsx
│   │   │   ├── hero-section.tsx
│   │   │   ├── footer.tsx
│   │   │   └── index.ts        # Barrel exports
│   │   │
│   │   ├── ui/                  # Radix UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── wave-loader.tsx
│   │   │   └── ...
│   │   │
│   │   ├── providers/           # React context providers
│   │   │   └── session-provider.tsx
│   │   │
│   │   └── brand/               # Brand assets
│   │       └── logo.tsx
│   │
│   ├── lib/                     # Core utilities
│   │   ├── auth.ts             # NextAuth v5 config
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── env.ts              # Environment validation
│   │   ├── email-templates.ts  # Magic link email HTML
│   │   └── utils.ts            # Shared utilities
│   │
│   ├── constants/
│   │   ├── routes.ts           # Type-safe route definitions
│   │   └── marketing.ts        # Marketing copy & brand info
│   │
│   ├── types/                   # TypeScript definitions
│   │   ├── index.ts            # Centralized exports
│   │   ├── marketing.ts
│   │   ├── next-auth.d.ts      # NextAuth type extensions
│   │   └── env.d.ts
│   │
│   ├── hooks/
│   │   └── use-mobile.ts       # Mobile detection
│   │
│   ├── services/
│   │   └── notifications.service.ts
│   │
│   └── styles/                  # Global styles
│
├── prisma/
│   └── schema.prisma           # Database schema
│
├── docs/                        # Documentation
├── public/                      # Static assets
└── tests/                       # Test files
```

### Directory Organization Principles

1. **App Router Structure**: Pages organized by route pattern
2. **Component Grouping**: Marketing vs. UI vs. Brand separation
3. **Shared Utilities**: Centralized in `lib/`
4. **Type Safety**: All types in dedicated `types/` directory
5. **Constants**: Configuration centralized for easy updates

## Key Design Patterns

### Route Groups

Uses Next.js route groups for layout isolation:
```typescript
app/
├── (marketing)/     // Marketing layout (nav + footer)
│   └── page.tsx     // Homepage
└── login/           // Auth pages (minimal layout)
    └── page.tsx
```

### Barrel Exports

Components use barrel exports for clean imports:
```typescript
// components/marketing/index.ts
export { Navigation } from './navigation'
export { HeroSection } from './hero-section'
export { Footer } from './footer'

// Usage
import { Navigation, HeroSection } from '@/components/marketing'
```

### Type-Safe Routes

All routes defined as typed constants:
```typescript
// src/constants/routes.ts
export const AUTH_ROUTES = {
  LOGIN: "/login",
  SIGNUP: "/signup",
} as const

export type AuthRoute = typeof AUTH_ROUTES[keyof typeof AUTH_ROUTES]
```

### Environment Validation

Runtime environment validation on startup:
- See [src/lib/env.ts](../src/lib/env.ts)
- Validates required variables
- Provides type-safe access
- Fails fast if misconfigured

### Database Singleton

Prisma client uses singleton pattern to prevent connection exhaustion:
```typescript
// src/lib/prisma.ts
const globalForPrisma = globalThis as { prisma?: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
```

## Performance Optimizations

### Build Performance
- **Turbopack**: 700x faster bundling than Webpack
- **Bundle analyzer**: Available via `npm run analyze`
- **Code splitting**: Automatic via Next.js App Router
- **Package optimization**: `@paper-design/shaders-react` optimized separately

### Runtime Performance
- **Image optimization**: AVIF + WebP formats
- **Compression**: Enabled by default
- **DNS prefetching**: Headers configured
- **Font optimization**: Self-hosted fonts with `next/font`

### Database Performance
- **Connection pooling**: Via Neon (pooled connection)
- **Direct URL**: Available for migrations (non-pooled)
- **Prisma client**: Singleton pattern prevents multiple instances

[REVIEW: Add any specific performance benchmarks or targets]

## Security Architecture

### Authentication Security
- NextAuth v5 with database sessions
- JWT tokens with 7-day expiration
- HTTPS-only cookies in production
- CSRF protection via NextAuth

### Email Security
- HTML escaping in email templates
- URL validation before rendering
- Magic link expiry: 10 minutes
- Rate limiting [REVIEW: Is this implemented?]

### Database Security
- SSL connections to Neon PostgreSQL
- Prisma prepared statements (SQL injection prevention)
- User data encrypted at rest (Neon feature)

### Environment Security
- Secrets never committed to version control
- Environment validation at startup
- Minimum 32-character secrets enforced

[REVIEW: Add any additional security measures, rate limiting, DDoS protection, etc.]

## Scalability Considerations

### Horizontal Scaling
- **Stateless design**: No server-side sessions (JWT-based)
- **Database**: Neon autoscaling PostgreSQL
- **Deployment**: Serverless-ready (Vercel Edge, AWS Lambda compatible)

### Vertical Scaling
- **Database queries**: Optimized with Prisma
- **Bundle size**: Monitored with bundle analyzer
- **Image optimization**: Next.js built-in optimization

[REVIEW: Add current/expected traffic numbers, scaling thresholds]

## Error Handling Strategy

### Client-Side Errors
- React Error Boundaries for component errors
- Form validation with user-friendly messages
- Loading states for async operations

### Server-Side Errors
- API routes return structured error responses
- NextAuth callbacks handle auth failures gracefully
- Database errors logged and sanitized for users

### Monitoring
[REVIEW: Document error tracking solution - Sentry, LogRocket, etc?]

## Future Architecture Considerations

### Potential Enhancements
- **API Backend**: Separate `momentum-api` for REST/GraphQL endpoints
- **Real-time Features**: WebSocket service for notifications
- **CDN Integration**: Static asset delivery via CDN
- **Background Jobs**: Separate worker service for async tasks

### Migration Paths
- **Monorepo**: Consider Turborepo if services grow
- **Microservices**: Split auth into separate service if needed
- **Edge Functions**: Move lightweight operations to edge

[REVIEW: Add any planned architectural changes or roadmap items]

---

*Last Updated: January 2025*
*Version: 1.0.0*
