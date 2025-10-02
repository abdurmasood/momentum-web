# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production with Turbopack
- `npm run lint` - Run ESLint
- `npm run test` - Run Jest test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push Prisma schema to database
- `npm run db:studio` - Open Prisma Studio

## Rules
Every time you talk with the user do not dive straight into coding. Always assume that the user wants to discuss with you first. Once you understand everything about what the user wants to accomplish, only then should you start making changes.

## Docs

Documentation is organized in `docs/` with the following files:

```
docs/
├── ARCHITECTURE.md       # System architecture, tech stack & project structure
├── AUTHENTICATION.md     # NextAuth v5, OAuth, magic links, JWT & security
├── DEVELOPMENT.md        # Getting started, commands, environment & testing
├── DATABASE.md           # Prisma schema, migrations & queries
├── COMPONENTS.md         # Marketing & UI component guides
├── API.md                # API routes & endpoints reference
├──NAMING_CONVENTIONS     # Naming conventions for this and other repos in the momentum ecosystem
└── DEPLOYMENT.md         # Vercel deployment & production setup
```

IMPORTANT: ALWAYS VIEW YOUR DOCS DIRECTORY BEFORE DOING ANYTHING

Note: when editing your docs folder, always try to keep its content up-to-date, coherent and organized. Do not create new files. Always keep any updates wihin one of the markdowns defined.

## Architecture Overview

**Momentum** is a Next.js 15.5 marketing site built with React 19 and TypeScript. It handles user authentication (Google OAuth + email magic links) and securely redirects authenticated users to a separate dashboard application via JWT tokens.

### Key Technologies
- **Frontend**: Next.js 15.5 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS 4.x with Radix UI components
- **Authentication**: NextAuth v5 with Prisma adapter
- **Database**: Neon PostgreSQL
- **Email**: Resend for magic link authentication
- **Testing**: Jest with React Testing Library

### Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── (marketing)/         # Marketing layout group (homepage)
│   ├── auth/                # Auth pages
│   │   ├── callback/        # Post-auth JWT generation & dashboard redirect
│   │   └── verify-request/  # Email magic link sent confirmation
│   ├── login/               # Login page
│   ├── signup/              # Signup page
│   ├── api/                 # API routes
│   │   ├── auth/
│   │   │   ├── [...nextauth]/   # NextAuth API handler
│   │   │   └── generate-token/  # Custom JWT generation for dashboard
│   │   └── cron/            # Scheduled cleanup jobs
│   ├── layout.tsx           # Root layout (fonts, session provider)
│   └── loading.tsx          # Global loading UI (WaveLoader)
├── components/
│   ├── marketing/           # Marketing-specific components
│   │   ├── auth/           # Auth forms (login, signup, Google button)
│   │   ├── navigation.tsx  # Main navigation
│   │   ├── hero-section.tsx
│   │   ├── footer.tsx
│   │   └── index.ts        # Barrel export
│   ├── providers/           # React context providers
│   │   └── session-provider.tsx  # NextAuth SessionProvider wrapper
│   ├── brand/               # Brand assets
│   │   └── logo.tsx
│   └── ui/                  # Radix UI components
│       ├── button.tsx
│       ├── input.tsx
│       ├── avatar.tsx
│       ├── wave-loader.tsx  # Loading animation
│       └── ...
├── constants/
│   ├── routes.ts            # Type-safe route definitions
│   └── marketing.ts         # Marketing copy, social links, brand info
├── lib/
│   ├── auth.ts              # NextAuth v5 configuration
│   ├── prisma.ts            # Prisma client singleton
│   ├── env.ts               # Environment validation
│   ├── email-templates.ts   # Magic link email HTML/text templates
│   └── utils.ts             # cn() utility for Tailwind
├── hooks/
│   └── use-mobile.ts        # Mobile device detection
├── services/
│   └── notifications.service.ts  # Notification service
├── types/
│   ├── index.ts             # Centralized type exports
│   ├── marketing.ts         # Marketing component types
│   ├── next-auth.d.ts       # NextAuth type extensions
│   └── env.d.ts             # Environment type definitions
└── styles/                  # Global styles
```

### Authentication System

#### NextAuth v5 Configuration
- Configuration in `src/lib/auth.ts`
- Prisma adapter for database sessions
- Supports two providers:
  - **Google OAuth**: Full OAuth flow with Google
  - **Email Magic Links**: Passwordless authentication via Resend
- Session strategy: JWT (7-day expiry)
- Custom callbacks for user data enrichment

#### Authentication Flow
1. User signs in via `/login` or `/signup`
2. NextAuth handles authentication (Google OAuth or email magic link)
3. After successful auth, NextAuth redirects to `/auth/callback`
4. Callback page generates custom JWT via `/api/auth/generate-token`
5. User redirected to dashboard app with JWT token in URL
6. Dashboard app validates JWT and creates session

#### Cross-Application Architecture
- **This repo**: Marketing site + authentication handler
- **Separate dashboard app** (`momentum-app`): Main application
- **JWT tokens**: Enable secure cross-app authentication
- **Vercel rewrites**: Proxy `/dashboard/*` requests to dashboard deployment (see `vercel.json`)

#### API Routes
- `/api/auth/[...nextauth]` - NextAuth API handler (signin, callback, session, etc.)
- `/api/auth/generate-token` - POST endpoint to generate dashboard JWT after authentication
- `/api/cron/*` - Scheduled cleanup jobs (Vercel Cron)

#### Auth Pages
- `/login` - Login form with Google OAuth + email magic link
- `/signup` - Signup form (same auth methods)
- `/auth/callback` - Post-auth page that generates JWT and redirects to dashboard
- `/auth/verify-request` - Confirmation page after magic link email sent

#### Email Templates
- HTML and plain text templates in `src/lib/email-templates.ts`
- Security: URL validation, HTML escaping to prevent injection
- Branding: Momentum-branded emails with dark theme
- Magic link expiry: 10 minutes

### Component Organization

#### Marketing Components (`components/marketing/`)
- `navigation.tsx` - Main navigation with auth buttons
- `hero-section.tsx` - Homepage hero with CTA
- `footer.tsx` - Site footer with links
- `auth/login-form.tsx` - Email magic link login form
- `auth/signup-form.tsx` - Email signup form
- `auth/google-signin-button.tsx` - Google OAuth button
- `auth/auth-layout.tsx` - Shared layout for auth pages
- `index.ts` - Barrel exports for clean imports

#### UI Components (`components/ui/`)
- Radix UI-based components (Button, Avatar, Input, Textarea, etc.)
- `wave-loader.tsx` - Loading animation used across app
- Follows shadcn/ui patterns with Tailwind CSS

#### Providers (`components/providers/`)
- `session-provider.tsx` - NextAuth SessionProvider wrapper for client components

#### Brand (`components/brand/`)
- `logo.tsx` - Momentum logo component

### Route Management

#### Route Constants (`src/constants/routes.ts`)
All routes defined with type safety:
- `PUBLIC_ROUTES` - Accessible without authentication (/, /landing)
- `AUTH_ROUTES` - Authentication pages (/login, /signup)
- `API_ROUTES` - API endpoints (/api/auth, etc.)

#### Helper Functions
- `isAuthRoute(path)` - Check if path is an auth route
- `isPublicRoute(path)` - Check if path is public
- `REDIRECT_ROUTES` - Default redirects (after signout, unauthorized, etc.)

### Database Schema

Prisma schema in `prisma/schema.prisma`:
- **User** - User accounts (email, name, image, timestamps)
- **Account** - OAuth provider accounts (Google, etc.)
- **Session** - User sessions
- **VerificationToken** - Email magic link tokens

All models follow NextAuth v5 adapter schema.

### Environment Variables

See `.env.example` for full list. Required variables:
- `NEXTAUTH_SECRET` - NextAuth session encryption (min 32 chars)
- `NEXTAUTH_URL` - App URL (http://localhost:3000 for dev)
- `JWT_SECRET` - Custom JWT signing key (min 32 chars)
- `DATABASE_URL` - Neon PostgreSQL pooled connection
- `DIRECT_URL` - Neon direct connection (for migrations)
- `NEXT_PUBLIC_DASHBOARD_URL` - Dashboard app URL for redirects
- **At least one auth provider**:
  - `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` (Google OAuth)
  - `RESEND_API_KEY` + `EMAIL_FROM` (Email magic links)

Environment validation runs at startup via `src/lib/env.ts`.

### Testing Strategy
- Jest with jsdom environment for component testing
- React Testing Library for user interaction testing
- Tests organized to mirror source structure
- Coverage includes: components, hooks, utilities, accessibility

### Development Notes

#### Fonts
Custom font setup in `src/app/layout.tsx`:
- **Figtree**: Primary sans-serif (300-700 weights)
- **Instrument Serif**: Serif font for accents
- **Geist Mono**: Monospace font
- Available as CSS variables: `--font-figtree`, `--font-instrument-serif`, `--font-mono`

#### Styling
- Tailwind CSS 4.x with custom configuration
- Dark theme (black background)
- Utility function `cn()` in `src/lib/utils.ts` for merging Tailwind classes

#### Error Handling
- Global error boundary in `src/components/error-boundary.tsx`
- Catches React errors and displays fallback UI

