# Development Guide

## Overview

This guide covers setting up the Momentum marketing site for local development, running development commands, testing, and best practices for contributing to the codebase.

## Prerequisites

### Required Software

- **Node.js**: v20.x or later (LTS recommended)
- **npm**: Included with Node.js (v10.x or later)
- **PostgreSQL**: Via Neon (cloud-hosted) - no local installation needed
- **Git**: For version control

**Check Versions**:
```bash
node --version   # Should be v20.x or later
npm --version    # Should be v10.x or later
git --version    # Any recent version
```

### Required Accounts

1. **Neon** - PostgreSQL database hosting
   - Sign up: [https://neon.tech](https://neon.tech)
   - Free tier available

2. **Resend** - Email magic link delivery (optional for development)
   - Sign up: [https://resend.com](https://resend.com)
   - Free tier: 100 emails/day

3. **Google Cloud Console** - Google OAuth (optional for development)
   - Console: [https://console.cloud.google.com](https://console.cloud.google.com)
   - Free to set up

[REVIEW: Add any other required accounts/services]

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_ORG/momentum.git
cd momentum
```

### 2. Install Dependencies

```bash
npm install
```

**What Gets Installed**:
- Next.js 15.5 + React 19
- NextAuth v5 + Prisma
- Tailwind CSS 4.x + Radix UI
- Testing libraries (Jest + React Testing Library)
- Development tools (ESLint, TypeScript)

### 3. Environment Configuration

**Copy Example File**:
```bash
cp .env.example .env
```

**Edit `.env`** with your values:

```bash
# Required for local development
NEXTAUTH_SECRET=your-local-secret-32-chars-minimum
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret-32-chars-minimum

# Database (from Neon dashboard)
DATABASE_URL="postgresql://user:password@host-pooler.region.aws.neon.tech/dbname?sslmode=require"
DIRECT_URL="postgresql://user:password@host.region.aws.neon.tech/dbname?sslmode=require"

# Dashboard URL
NEXT_PUBLIC_DASHBOARD_URL=http://localhost:3001

# Optional: Choose at least one auth provider for development
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OR use email provider
RESEND_API_KEY=re_your_resend_api_key
EMAIL_FROM=Momentum <dev@yourdomain.com>
```

**Generate Secrets**:
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate JWT_SECRET
openssl rand -base64 32
```

**Environment Validation**:
- App validates environment on startup (see [src/lib/env.ts](../src/lib/env.ts))
- Missing/invalid variables cause startup failure with clear error messages
- At least one auth provider (Google OR Email) must be configured

### 4. Database Setup

**Generate Prisma Client**:
```bash
npm run db:generate
```

**Push Schema to Database**:
```bash
npm run db:push
```

This creates all required tables:
- `users` - User accounts
- `accounts` - OAuth provider data
- `sessions` - User sessions
- `verification_tokens` - Email magic link tokens

**Open Prisma Studio** (optional, for database GUI):
```bash
npm run db:studio
```
Opens at [http://localhost:5555](http://localhost:5555)

### 5. Start Development Server

```bash
npm run dev
```

**Server starts at**: [http://localhost:3000](http://localhost:3000)

**What Runs**:
- Next.js dev server with Turbopack (fast refresh)
- Hot module replacement (changes reflect instantly)
- TypeScript type checking (in IDE/terminal)

## Development Commands

### Primary Commands

```bash
# Start development server with Turbopack
npm run dev

# Build production bundle
npm run build

# Start production server (after build)
npm run start

# Run ESLint
npm run lint

# Run Jest tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

### Database Commands

```bash
# Generate Prisma client (after schema changes)
npm run db:generate

# Push schema to database (development only)
npm run db:push

# Open Prisma Studio (database GUI)
npm run db:studio

# Seed database (if seeding is configured)
npm run db:seed
```

[REVIEW: Is database seeding implemented? If so, document seed data]

### Bundle Analysis

```bash
# Analyze production bundle
npm run analyze

# Analyze browser bundle only
npm run analyze:browser

# Analyze server bundle only
npm run analyze:server

# Analyze both browser and server
npm run analyze:both
```

Opens bundle analyzer in browser showing:
- Bundle size breakdown
- Module dependencies
- Optimization opportunities

## Project Structure

See [ARCHITECTURE.md](ARCHITECTURE.md#project-structure) for detailed structure.

**Key Directories**:
```
src/
├── app/              # Next.js pages (App Router)
├── components/       # React components
├── lib/              # Core utilities & config
├── constants/        # Type-safe constants
├── types/            # TypeScript definitions
├── hooks/            # Custom React hooks
└── services/         # Business logic services
```

## Development Workflow

### Making Changes

**1. Create Feature Branch**:
```bash
git checkout -b feature/your-feature-name
```

**2. Make Changes**:
- Edit files in `src/`
- Components auto-reload via Turbopack
- TypeScript errors show in terminal/IDE

**3. Test Changes**:
```bash
npm run lint              # Check code style
npm run test              # Run tests
npm run build             # Test production build
```

**4. Commit Changes**:
```bash
git add .
git commit -m "feat: Add your feature description"
```

See [NAMING_CONVENTIONS.md](NAMING_CONVENTIONS.md) for commit message conventions.

**5. Push & Create PR**:
```bash
git push origin feature/your-feature-name
```

[REVIEW: Add PR template requirements, code review process]

### Hot Reload & Fast Refresh

**What Auto-Reloads**:
- ✅ React components
- ✅ Pages (app router)
- ✅ CSS/Tailwind classes
- ✅ TypeScript files

**What Requires Restart**:
- ❌ Environment variables (`.env` changes)
- ❌ `next.config.mjs` changes
- ❌ `tailwind.config.ts` changes (sometimes)
- ❌ Prisma schema changes (requires `db:generate`)

### Working with Database

**Schema Changes**:
1. Edit `prisma/schema.prisma`
2. Run `npm run db:push` (development)
3. Run `npm run db:generate` (regenerate Prisma client)
4. Restart dev server

**Viewing Data**:
- Use Prisma Studio: `npm run db:studio`
- Or query via Neon dashboard SQL editor

**Resetting Database** (development only):
```bash
# WARNING: Deletes all data
npm run db:push -- --force-reset
```

[REVIEW: Add migration commands for production database changes]

## Testing

### Running Tests

```bash
# Run all tests once
npm run test

# Watch mode (reruns on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Coverage Report Location**: `coverage/lcov-report/index.html`

### Test Structure

Tests mirror source structure:
```
src/
└── components/
    └── ui/
        └── button.tsx

tests/
└── components/
    └── ui/
        └── button.test.tsx
```

### Writing Tests

**Example Component Test**:
```typescript
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)

    await userEvent.click(screen.getByText('Click'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

**Testing Libraries Available**:
- `@testing-library/react` - Component testing
- `@testing-library/user-event` - User interaction simulation
- `@testing-library/jest-dom` - Custom matchers

### Test Configuration

**Location**: [jest.config.js](../jest.config.js)

**Key Settings**:
- **Environment**: jsdom (browser simulation)
- **Path aliases**: `@/` maps to `src/`
- **Setup file**: `jest.setup.js` (global test configuration)

[REVIEW: Add integration test examples, API route testing]

## Code Style & Linting

### ESLint

**Run Linting**:
```bash
npm run lint
```

**Auto-Fix Issues**:
```bash
npm run lint -- --fix
```

**Configuration**: `eslint.config.mjs` (ESLint 9 flat config)

**Rules**:
- Next.js recommended rules
- React hooks rules
- TypeScript recommended rules
- Accessibility (a11y) rules

### TypeScript

**Type Checking**:
- Automatic in IDE (if configured)
- Checked during `npm run build`
- Strict mode enabled

**Configuration**: `tsconfig.json`

**Path Aliases**:
```typescript
import { Button } from '@/components/ui/button'  // src/components/ui/button.tsx
import { auth } from '@/lib/auth'                // src/lib/auth.ts
```

### Prettier

[REVIEW: Is Prettier configured? If so, document settings]

## Styling with Tailwind CSS

### Development Workflow

**Tailwind IntelliSense** (VS Code):
1. Install extension: "Tailwind CSS IntelliSense"
2. Get autocomplete for class names
3. See color previews inline

**Using Tailwind**:
```tsx
// Basic usage
<div className="bg-black text-white p-4 rounded-lg">

// Responsive
<div className="p-2 sm:p-4 md:p-6 lg:p-8">

// Hover states
<button className="bg-white hover:bg-gray-200">

// Dark mode (if configured)
<div className="bg-white dark:bg-black">
```

### Custom Utilities

**cn() Helper** ([src/lib/utils.ts](../src/lib/utils.ts)):
```typescript
import { cn } from '@/lib/utils'

// Merge classes with conflict resolution
<Button className={cn(
  "bg-white text-black",
  isLoading && "opacity-50 cursor-not-allowed",
  className
)} />
```

### Tailwind Configuration

**Configuration**: `tailwind.config.ts`

**Custom Theme**:
- **Colors**: Custom color palette [REVIEW: Document custom colors]
- **Fonts**: Figtree, Instrument Serif, Geist Mono
- **Spacing**: Default scale + custom values [REVIEW: Document custom spacing]

**Content Paths**:
```typescript
content: [
  './src/pages/**/*.{ts,tsx}',
  './src/components/**/*.{ts,tsx}',
  './src/app/**/*.{ts,tsx}',
]
```

## Working with Components

### Component Organization

**Marketing Components**: `src/components/marketing/`
- Marketing-specific UI (navigation, hero, footer)
- Auth forms (login, signup)
- Use barrel exports (`index.ts`)

**UI Components**: `src/components/ui/`
- Reusable Radix UI components
- Shared across entire app
- Follow shadcn/ui patterns

**Brand Components**: `src/components/brand/`
- Logo, brand assets

### Creating New Components

**1. Create Component File**:
```typescript
// src/components/marketing/new-component.tsx
"use client"  // If using hooks/interactivity

import React from "react"
import { cn } from "@/lib/utils"

interface NewComponentProps {
  className?: string
  // ... other props
}

export const NewComponent: React.FC<NewComponentProps> = ({
  className,
}) => {
  return (
    <div className={cn("base-styles", className)}>
      {/* Component content */}
    </div>
  )
}
```

**2. Add to Barrel Export** (if in marketing/):
```typescript
// src/components/marketing/index.ts
export { NewComponent } from './new-component'
```

**3. Create Test**:
```typescript
// tests/components/marketing/new-component.test.tsx
import { render } from '@testing-library/react'
import { NewComponent } from '@/components/marketing/new-component'

describe('NewComponent', () => {
  it('renders', () => {
    const { container } = render(<NewComponent />)
    expect(container).toBeInTheDocument()
  })
})
```

### Component Conventions

- **File Naming**: `kebab-case.tsx`
- **Component Naming**: `PascalCase`
- **Props Interface**: `ComponentNameProps`
- **Export**: Named export (not default)
- **Client Components**: Add `"use client"` directive if needed
- **Styling**: Use `className` prop for style customization

## Working with API Routes

### Creating API Routes

**Location**: `src/app/api/your-route/route.ts`

**Example**:
```typescript
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  return NextResponse.json({ data: "Your data" })
}

export async function POST(request: Request) {
  const body = await request.json()

  // Process request
  return NextResponse.json({ success: true })
}
```

### API Route Conventions

- **Authentication**: Use `auth()` from `@/lib/auth`
- **Error Handling**: Return proper status codes
- **Response Format**: Consistent JSON structure
- **Validation**: Validate request bodies/params

[REVIEW: Add API middleware, rate limiting implementation]

## Environment Management

### Environment Files

```
.env.example       # Template (committed to git)
.env               # Local development (gitignored)
.env.local         # Local overrides (gitignored)
.env.production    # Production values (store securely)
```

**Priority** (highest to lowest):
1. `.env.local`
2. `.env`
3. `.env.example` (not loaded, just a template)

### Adding New Environment Variables

**1. Add to `.env.example`**:
```bash
# Description of variable
NEW_VARIABLE=example-value
```

**2. Add to Validation** ([src/lib/env.ts](../src/lib/env.ts)):
```typescript
// Add validation
const newVarError = validateMinLength(
  'NEW_VARIABLE',
  process.env.NEW_VARIABLE,
  10,
  'Description of requirement'
)
if (newVarError) errors.push(newVarError)

// Add to export
export const env = {
  // ... existing
  NEW_VARIABLE: process.env.NEW_VARIABLE!,
}
```

**3. Add to TypeScript Types** (if needed):
```typescript
// src/types/env.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEW_VARIABLE: string
    }
  }
}
```

**4. Document in `.env.example`** with clear instructions

## Debugging

### Server-Side Debugging

**Console Logging**:
```typescript
// Server components, API routes
console.log("Debug info:", data)
```

**NextAuth Debug**:
```bash
# Enable NextAuth debug logs
NEXTAUTH_DEBUG=true npm run dev
```

### Client-Side Debugging

**Browser DevTools**:
- Use React DevTools extension
- Network tab for API calls
- Console for client logs

**Component State**:
```typescript
useEffect(() => {
  console.log("State changed:", state)
}, [state])
```

### Database Debugging

**Prisma Logging**:
```typescript
// src/lib/prisma.ts
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
})
```

**Query Inspection**:
```typescript
const result = await prisma.user.findMany()
console.log("Query result:", result)
```

## Performance Optimization

### Development Performance

**Turbopack** (enabled by default):
- 700x faster than Webpack
- Incremental compilation
- Fast refresh optimized

**Bundle Analysis**:
```bash
npm run analyze
```

Identifies:
- Large dependencies
- Duplicate modules
- Optimization opportunities

### Runtime Performance

**Next.js Built-in**:
- Automatic code splitting
- Image optimization
- Font optimization

**Custom Optimizations** ([next.config.mjs](../next.config.mjs)):
- Package import optimization
- Bundle chunking strategy
- Compression enabled

[REVIEW: Add performance benchmarks, Core Web Vitals targets]

## Common Development Tasks

### Adding a New Page

**1. Create Page File**:
```typescript
// src/app/new-page/page.tsx
export default function NewPage() {
  return (
    <main>
      <h1>New Page</h1>
    </main>
  )
}
```

**2. Add Route Constant**:
```typescript
// src/constants/routes.ts
export const PUBLIC_ROUTES = {
  // ... existing
  NEW_PAGE: "/new-page",
}
```

**3. Link to Page**:
```typescript
import Link from 'next/link'
import { PUBLIC_ROUTES } from '@/constants/routes'

<Link href={PUBLIC_ROUTES.NEW_PAGE}>New Page</Link>
```

### Adding Radix UI Component

**1. Install Component**:
```bash
npm install @radix-ui/react-component-name
```

**2. Create Wrapper** in `src/components/ui/`:
```typescript
// src/components/ui/new-component.tsx
import * as RadixComponent from "@radix-ui/react-component-name"
import { cn } from "@/lib/utils"

export const NewComponent = ({ className, ...props }) => (
  <RadixComponent.Root
    className={cn("base-styles", className)}
    {...props}
  />
)
```

**3. Use Component**:
```typescript
import { NewComponent } from "@/components/ui/new-component"

<NewComponent>Content</NewComponent>
```

### Updating Database Schema

**1. Edit Schema**:
```prisma
// prisma/schema.prisma
model NewModel {
  id        String   @id @default(cuid())
  // ... fields
}
```

**2. Push to Database**:
```bash
npm run db:push
```

**3. Regenerate Client**:
```bash
npm run db:generate
```

**4. Restart Dev Server**

## Troubleshooting

### Common Issues

**Port Already in Use**:
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm run dev
```

**Module Not Found**:
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

**Prisma Client Out of Sync**:
```bash
npm run db:generate
```

**TypeScript Errors Not Clearing**:
```bash
# Restart TypeScript server in IDE
# VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

**Environment Variables Not Loading**:
- Restart dev server after `.env` changes
- Check for typos in variable names
- Verify `.env` is in project root

**Build Fails**:
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

[REVIEW: Add more common issues from production experience]

## IDE Setup

### VS Code (Recommended)

**Recommended Extensions**:
- ESLint
- Tailwind CSS IntelliSense
- Prisma
- TypeScript and JavaScript Language Features (built-in)
- Pretty TypeScript Errors

**Settings** (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "non-relative"
}
```

[REVIEW: Add recommended workspace settings file]

## Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [NextAuth Docs](https://authjs.dev)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Radix UI Docs](https://www.radix-ui.com/primitives/docs/overview/introduction)

### Internal Docs
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [AUTHENTICATION.md](AUTHENTICATION.md) - Auth implementation
- [DATABASE.md](DATABASE.md) - Database schema
- [COMPONENTS.md](COMPONENTS.md) - Component guide
- [API.md](API.md) - API reference
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide

---

*Last Updated: January 2025*
*Version: 1.0.0*
