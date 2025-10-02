# Components

## Overview

Momentum's component library is organized into three main categories:
1. **Marketing Components** - Marketing-specific UI (navigation, hero, footer, auth forms)
2. **UI Components** - Reusable Radix UI-based components (buttons, inputs, etc.)
3. **Brand Components** - Brand assets (logo)

All components use TypeScript for type safety and Tailwind CSS for styling.

## Component Organization

```
src/components/
├── marketing/          # Marketing-specific components
│   ├── auth/          # Authentication forms
│   │   ├── auth-layout.tsx
│   │   ├── google-signin-button.tsx
│   │   ├── login-form.tsx
│   │   └── signup-form.tsx
│   ├── navigation.tsx
│   ├── hero-section.tsx
│   ├── hero-cta.tsx
│   ├── footer.tsx
│   ├── auth-buttons.tsx
│   ├── logo-brand.tsx
│   ├── nav-links.tsx
│   └── index.ts       # Barrel exports
│
├── ui/                 # Reusable UI components
│   ├── button.tsx
│   ├── input.tsx
│   ├── avatar.tsx
│   ├── sheet.tsx
│   ├── textarea.tsx
│   ├── skeleton.tsx
│   ├── wave-loader.tsx
│   └── ...
│
├── providers/          # React context providers
│   └── session-provider.tsx
│
└── brand/              # Brand assets
    └── logo.tsx
```

## Marketing Components

### Navigation

**Location**: [src/components/marketing/navigation.tsx](../src/components/marketing/navigation.tsx)

**Purpose**: Main navigation bar for marketing pages

**Structure**:
```tsx
<Navigation>
  <LogoBrand />         # Left: Logo
  <NavLinks />          # Center: Navigation links
  <AuthButtons />       # Right: Auth buttons
</Navigation>
```

**Props**:
```typescript
interface NavigationProps {
  className?: string
}
```

**Usage**:
```tsx
import { Navigation } from '@/components/marketing'

<Navigation className="sticky top-0" />
```

**Features**:
- Responsive layout (flexbox)
- Consistent spacing (`px-12 py-2`)
- Modular sub-components

**Sub-components**:

#### LogoBrand
**Location**: [src/components/marketing/logo-brand.tsx](../src/components/marketing/logo-brand.tsx)

- Displays Momentum brand logo
- Links to homepage
- [REVIEW: Confirm logo implementation - text or image?]

#### NavLinks
**Location**: [src/components/marketing/nav-links.tsx](../src/components/marketing/nav-links.tsx)

- Renders navigation links from `NAVIGATION_LINKS` constant
- Features: scroll-to-section hash links (#features, #pricing, etc.)
- Accessibility: aria-labels for each link

**Data Source**: [src/constants/marketing.ts](../src/constants/marketing.ts#L32)
```typescript
export const NAVIGATION_LINKS: NavLink[] = [
  { href: '#features', label: 'Features', ariaLabel: 'Learn about Momentum features' },
  { href: '#pricing', label: 'Pricing', ariaLabel: 'View pricing plans' },
  { href: '#resources', label: 'Resources', ariaLabel: 'Browse resources' },
]
```

#### AuthButtons
**Location**: [src/components/marketing/auth-buttons.tsx](../src/components/marketing/auth-buttons.tsx)

- Displays Sign In / Download buttons
- Responsive behavior [REVIEW: Mobile vs desktop layout]
- Links to `/login` page

### Hero Section

**Location**: [src/components/marketing/hero-section.tsx](../src/components/marketing/hero-section.tsx)

**Purpose**: Homepage hero with headline, subtitle, and CTA

**Props**:
```typescript
interface HeroContentProps {
  headline?: string          // Default: from HERO_CONTENT.HEADLINE
  subtitle?: string          // Default: from HERO_CONTENT.SUBTITLE
  onCTAClick?: () => void   // Custom CTA handler
  ctaText?: string          // Default: "Download for macOS ↓"
  showSecondaryCTA?: boolean // Default: false
  className?: string
}
```

**Usage**:
```tsx
import { HeroSection } from '@/components/marketing'

<HeroSection
  headline="Plan your day,\nextraordinarily simple."
  subtitle="Momentum helps you organize your day with focus and clarity."
  ctaText="Download for macOS ↓"
/>
```

**Features**:
- Multi-line headline support (split on `\n`)
- Responsive typography:
  - Mobile: `text-xl`
  - Small: `text-2xl`
  - Medium+: `text-3xl`
- Max-width container for readability
- Minimal padding for visual hierarchy

**Layout**:
```tsx
<main className="flex flex-col px-12 pt-[15vh] pb-16 min-h-[calc(100vh-80px)]">
  <div className="max-w-3xl">
    <h1>{headline}</h1>       {/* Font: Figtree (light weight) */}
    <p>{subtitle}</p>         {/* Color: text-gray-400 */}
    <HeroCTA />
  </div>
</main>
```

**Design Principles**:
- Left-aligned (not centered)
- Generous top padding (15vh)
- Constrains content width for readability

#### HeroCTA

**Location**: [src/components/marketing/hero-cta.tsx](../src/components/marketing/hero-cta.tsx)

**Purpose**: Call-to-action button(s) in hero section

**Props** [REVIEW: Confirm props]:
```typescript
interface HeroCTAProps {
  primaryText?: string
  onPrimaryClick?: () => void
  showSecondary?: boolean
}
```

**Features**:
- Primary CTA button (white bg, black text)
- Optional secondary CTA
- Golden ratio button sizing (`size="golden-hero"`)

### Footer

**Location**: [src/components/marketing/footer.tsx](../src/components/marketing/footer.tsx)

**Purpose**: Site-wide footer with links, social media, and copyright

**Structure**:
```tsx
<Footer>
  <Grid>
    {/* Left Column */}
    <SocialCard title="X" />
    <LinksGroup title="About Us" />
    <LinksGroup title="Support" />

    {/* Right Column */}
    <SocialCard title="Instagram" />
    <LinksGroup title="Community" />
    <LinksGroup title="Press" />
  </Grid>

  {/* Copyright */}
  <Copyright />
</Footer>
```

**Data Sources**:
- Social links: `SOCIAL_LINKS` from [constants/marketing.ts](../src/constants/marketing.ts#L22)
- Footer links: `FOOTER_LINKS` from [constants/marketing.ts](../src/constants/marketing.ts#L54)
- Copyright: `BRAND.COPYRIGHT` (auto-updates year)

**Sub-components**:

#### SocialCard
```typescript
interface SocialCardProps {
  title: string  // "X", "Instagram", etc.
  href: string   // Social media URL
}
```

**Features**:
- Hover effects (background color change)
- Arrow icon appears on hover
- Opens in new tab (`target="_blank"`)
- Accessibility: `rel="noopener noreferrer"`

#### LinksGroup
```typescript
interface LinksGroupProps {
  title: string  // Section title
  links: readonly { title: string; href: string }[]
}
```

**Styling**:
- Small text (`text-[10px]`, `text-[11px]`)
- Uppercase section titles with letter-spacing
- Hover color transitions
- Minimal spacing for compact layout

**Design Features**:
- Radial gradient background at top
- Grid layout (responsive)
- Border divisions between sections
- Ultra-compact spacing (minimal design)

### Authentication Components

#### AuthLayout

**Location**: [src/components/marketing/auth/auth-layout.tsx](../src/components/marketing/auth/auth-layout.tsx)

**Purpose**: Shared layout wrapper for login/signup pages

**Features** [REVIEW: Confirm implementation]:
- Centered card layout
- Minimal design (no header/footer)
- Responsive sizing
- Dark theme background

#### LoginForm

**Location**: [src/components/marketing/auth/login-form.tsx](../src/components/marketing/auth/login-form.tsx)

**Purpose**: Email magic link + Google OAuth login form

**State**:
```typescript
const [email, setEmail] = useState("")
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
```

**Form Structure**:
```tsx
<div>
  {/* Email Input */}
  <Input type="email" placeholder="Enter your email" />

  {/* Error Message */}
  {error && <p className="text-red-400">{error}</p>}

  {/* Submit Button */}
  <Button type="submit" size="golden">
    Continue with Email
  </Button>

  {/* Divider */}
  <div>Or</div>

  {/* Google OAuth */}
  <GoogleSignInButton />

  {/* Sign Up Link */}
  <Link href="/signup">Sign up</Link>
</div>
```

**Functionality**:
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

**Features**:
- Email validation (HTML5 `required` + `type="email"`)
- Loading states (disabled inputs/buttons)
- Error display
- Link to signup page

**Styling**:
- Dark input background (`bg-black/50`)
- Gray borders (`border-gray-700`)
- White text with gray placeholders
- Full-width buttons (`w-full`)

#### SignupForm

**Location**: [src/components/marketing/auth/signup-form.tsx](../src/components/marketing/auth/signup-form.tsx)

**Purpose**: Email magic link + Google OAuth signup form

**Implementation**: Nearly identical to LoginForm (different copy only)
- Same form structure
- Same authentication flow
- Different link (to `/login` instead of `/signup`)

**Note**: Signup vs. Login is UI distinction only - authentication flow is identical.

#### GoogleSignInButton

**Location**: [src/components/marketing/auth/google-signin-button.tsx](../src/components/marketing/auth/google-signin-button.tsx)

**Purpose**: Google OAuth sign-in button with official branding

**Props**:
```typescript
interface GoogleSignInButtonProps {
  className?: string
  text?: string  // Default: "Continue with Google"
}
```

**Usage**:
```tsx
<GoogleSignInButton text="Sign in with Google" />
```

**Functionality**:
```typescript
function handleGoogleSignIn() {
  signIn("google", {
    callbackUrl: "/auth/callback",
  })
}
```

**Design**:
- **Google logo**: Official SVG with brand colors
  - Blue (#4285F4), Green (#34A853), Yellow (#FBBC05), Red (#EA4335)
- **Button variant**: `outline`
- **Size**: `golden` (custom golden ratio sizing)
- **Hover state**: `bg-gray-800`
- **Layout**: Flexbox with logo + text

**Accessibility**:
- Clickable button (not link)
- Clear text label
- Keyboard navigable

## UI Components

### Button

**Location**: [src/components/ui/button.tsx](../src/components/ui/button.tsx)

**Purpose**: Reusable button component with variants and sizes

**Props**:
```typescript
interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon" | "golden" | "golden-hero" | "golden-hero-lg"
  asChild?: boolean  // Render as Slot (for composition)
  className?: string
}
```

**Variants**:
- `default` - Primary button (bg-primary, white text)
- `destructive` - Danger/delete actions (red background)
- `outline` - Border with transparent background
- `secondary` - Secondary actions (gray background)
- `ghost` - No background, hover effect only
- `link` - Text link with underline on hover

**Sizes**:
- `default` - Standard size (`h-9 px-4 py-2`)
- `sm` - Small (`h-8 px-3`)
- `lg` - Large (`h-10 px-6`)
- `icon` - Square icon button (`size-9`)
- `golden` - Golden ratio proportions (`h-8 px-3 py-1.5`) **[Custom for Momentum]**
- `golden-hero` - Hero CTA (`px-4 py-0.5`) **[Custom for Momentum]**
- `golden-hero-lg` - Large hero CTA (`h-12 px-6 py-3`) **[Custom for Momentum]**

**Golden Ratio Sizes**:
Custom sizes added for consistent landing page design:
```typescript
golden: "h-8 px-3 py-1.5 text-sm",              // 32px height, 12px padding
"golden-hero": "px-4 py-0.5 text-sm w-fit",     // Hero CTA proportions
"golden-hero-lg": "h-12 px-6 py-3 text-base w-fit",  // Larger hero CTA
```

**Usage**:
```tsx
import { Button } from '@/components/ui/button'

{/* Default */}
<Button>Click me</Button>

{/* Variant + Size */}
<Button variant="outline" size="lg">Large Outline</Button>

{/* Golden ratio (landing page) */}
<Button size="golden">Login</Button>

{/* As child (render as Link, etc.) */}
<Button asChild>
  <Link href="/signup">Sign Up</Link>
</Button>
```

**Features**:
- Built with `class-variance-authority` (CVA)
- Radix UI Slot support (composition)
- Focus-visible ring for accessibility
- Disabled state styling
- SVG icon support (auto-sizing)

**Accessibility**:
- Outline on focus-visible (keyboard navigation)
- Disabled state removes pointer events
- ARIA-invalid support for form errors

### Input

**Location**: [src/components/ui/input.tsx](../src/components/ui/input.tsx)

**Purpose**: Text input field with consistent styling

**Props** [REVIEW: Confirm props]:
```typescript
interface InputProps extends React.ComponentProps<"input"> {
  className?: string
}
```

**Usage**:
```tsx
import { Input } from '@/components/ui/input'

<Input
  type="email"
  placeholder="Enter email"
  required
  className="w-full"
/>
```

**Styling** (from LoginForm usage):
- Dark background: `bg-black/50`
- Border: `border-gray-700`
- Text: `text-white`
- Placeholder: `placeholder:text-gray-500`

**Features**:
- Supports all native input types
- Focus states
- Disabled styling
- Full TypeScript support

### WaveLoader

**Location**: [src/components/ui/wave-loader.tsx](../src/components/ui/wave-loader.tsx)

**Purpose**: Animated loading indicator

**Usage**:
```tsx
import { WaveLoader } from '@/components/ui/wave-loader'

<WaveLoader />
```

**Used In**:
- [src/app/loading.tsx](../src/app/loading.tsx) - Global loading state
- [src/app/auth/callback/page.tsx](../src/app/auth/callback/page.tsx) - Auth callback loading

**Features** [REVIEW: Confirm animation type]:
- Animated wave/pulse effect
- Centered layout
- Accessible (no motion for prefers-reduced-motion)

### Avatar

**Location**: [src/components/ui/avatar.tsx](../src/components/ui/avatar.tsx)

**Purpose**: User avatar component (Radix UI wrapper)

**Usage** [REVIEW: Confirm implementation]:
```tsx
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

<Avatar>
  <AvatarImage src={user.image} alt={user.name} />
  <AvatarFallback>{user.name[0]}</AvatarFallback>
</Avatar>
```

**Features**:
- Image with fallback initials
- Circular design
- Loading states

### Sheet

**Location**: [src/components/ui/sheet.tsx](../src/components/ui/sheet.tsx)

**Purpose**: Slide-out panel (mobile menu, sidebars)

**Usage** [REVIEW: Is this used in current implementation?]:
```tsx
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet'

<Sheet>
  <SheetTrigger>Open Menu</SheetTrigger>
  <SheetContent>
    {/* Menu content */}
  </SheetContent>
</Sheet>
```

**Features**:
- Slide from left/right/top/bottom
- Backdrop overlay
- Close on outside click
- Keyboard navigation (ESC to close)

### Textarea

**Location**: [src/components/ui/textarea.tsx](../src/components/ui/textarea.tsx)

**Purpose**: Multi-line text input

[REVIEW: Is this used in current implementation?]

### Skeleton

**Location**: [src/components/ui/skeleton.tsx](../src/components/ui/skeleton.tsx)

**Purpose**: Loading placeholder skeleton

**Usage**:
```tsx
import { Skeleton } from '@/components/ui/skeleton'

<Skeleton className="h-12 w-full" />
```

**Features**:
- Shimmer/pulse animation
- Configurable size via className

## Brand Components

### Logo

**Location**: [src/components/brand/logo.tsx](../src/components/brand/logo.tsx)

**Purpose**: Momentum logo component

[REVIEW: Confirm implementation - SVG, text, or image?]

**Usage**:
```tsx
import { Logo } from '@/components/brand/logo'

<Logo className="h-8 w-auto" />
```

## Provider Components

### SessionProvider

**Location**: [src/components/providers/session-provider.tsx](../src/components/providers/session-provider.tsx)

**Purpose**: NextAuth SessionProvider wrapper for client components

**Implementation**:
```tsx
"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}
```

**Usage** (in root layout):
```tsx
import { SessionProvider } from '@/components/providers/session-provider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
```

**Why Wrapper?**:
- NextAuth's SessionProvider is a client component
- Root layout can remain server component
- Enables `useSession()` hook in child components

## Component Patterns

### Barrel Exports

**Marketing components** use barrel exports for clean imports:

**File**: [src/components/marketing/index.ts](../src/components/marketing/index.ts)
```typescript
export { Navigation } from './navigation'
export { HeroSection } from './hero-section'
export { Footer } from './footer'
// ... etc
```

**Usage**:
```typescript
// Clean single import
import { Navigation, HeroSection, Footer } from '@/components/marketing'

// vs. multiple imports
import { Navigation } from '@/components/marketing/navigation'
import { HeroSection } from '@/components/marketing/hero-section'
import { Footer } from '@/components/marketing/footer'
```

### Client vs. Server Components

**Client Components** (`"use client"` directive):
- Use React hooks (useState, useEffect, etc.)
- Handle user interactions
- Access browser APIs

**Examples**:
- `navigation.tsx` - Uses state/interactions
- `login-form.tsx` - Form state management
- `auth/callback/page.tsx` - Uses useSession hook

**Server Components** (default):
- No hooks or browser APIs
- Can access database directly
- Better performance (smaller bundle)

**Examples** [REVIEW: Confirm which components are server-only]:
- Static marketing pages
- Initial page renders

### Composition with Radix UI

**Pattern**: Wrap Radix primitives with custom styling

**Example** (Button):
```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

function Button({ asChild, ...props }) {
  const Comp = asChild ? Slot : "button"
  return <Comp {...props} />
}
```

**Benefits**:
- Consistent design system
- Accessibility built-in (Radix UI)
- Flexibility via `asChild` prop

## Styling Conventions

### className Prop

All components accept `className` prop for customization:

```tsx
<Button className="mt-4 w-full" />
```

### cn() Utility

**Import**: `import { cn } from '@/lib/utils'`

**Purpose**: Merge Tailwind classes with conflict resolution

**Usage**:
```tsx
<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className  // Allow override
)}>
```

**How It Works**:
- Uses `clsx` to combine classes conditionally
- Uses `tailwind-merge` to resolve conflicts
- Last class wins (e.g., `bg-red bg-blue` → `bg-blue`)

### Responsive Design

**Breakpoint Prefixes**:
```tsx
<div className="
  text-sm          {/* Default (mobile) */}
  sm:text-base     {/* ≥640px */}
  md:text-lg       {/* ≥768px */}
  lg:text-xl       {/* ≥1024px */}
">
```

**Common Patterns**:
```tsx
{/* Mobile-first grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

{/* Hide on mobile */}
<div className="hidden md:block">

{/* Stack on mobile, row on desktop */}
<div className="flex flex-col md:flex-row">
```

### Dark Theme

Current implementation uses **dark theme by default**:
- Black background (`bg-black`)
- White text (`text-white`)
- Gray accents (`text-gray-400`, `border-gray-700`)

[REVIEW: Is light mode supported via dark: prefix?]

## Component Testing

[REVIEW: Document testing patterns for components]

**Example Test Structure**:
```typescript
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

## Creating New Components

### Step-by-Step Guide

**1. Create Component File**:
```tsx
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

**4. Document Usage** (in this file or component JSDoc)

### Component Checklist

- [ ] TypeScript interface for props
- [ ] className prop for customization
- [ ] Responsive design (if needed)
- [ ] Accessibility (ARIA labels, keyboard nav)
- [ ] "use client" directive (if using hooks)
- [ ] cn() utility for style merging
- [ ] Test file created
- [ ] JSDoc comments for complex logic

## Constants & Configuration

### Marketing Constants

**Location**: [src/constants/marketing.ts](../src/constants/marketing.ts)

**Contents**:
- `BRAND` - Name, tagline, description, copyright
- `SOCIAL_LINKS` - Twitter, Instagram, GitHub, LinkedIn
- `NAVIGATION_LINKS` - Main nav links
- `FOOTER_LINKS` - Footer link sections (About, Support, Community, Press)
- `HERO_CONTENT` - Hero headline, subtitle, CTA text
- `BUTTON_TEXT` - Reusable button labels
- `PAGE_METADATA` - SEO metadata (title, description, keywords)
- `ANALYTICS` - Google Analytics ID

**Usage**:
```tsx
import { BRAND, SOCIAL_LINKS } from '@/constants/marketing'

<Footer>
  <a href={SOCIAL_LINKS.TWITTER}>{BRAND.NAME} on X</a>
</Footer>
```

**Benefits**:
- Single source of truth
- Easy to update branding
- Type-safe constants (`as const`)
- No hardcoded strings in components

### Type Definitions

**Location**: [src/types/marketing.ts](../src/types/marketing.ts)

**Common Types**:
```typescript
export interface NavLink {
  href: string
  label: string
  ariaLabel: string
}

export interface HeroContentProps {
  headline?: string
  subtitle?: string
  onCTAClick?: () => void
  ctaText?: string
  showSecondaryCTA?: boolean
  className?: string
}

// ... etc
```

## Accessibility

### Best Practices

**Semantic HTML**:
```tsx
<nav>         {/* Use nav, not div */}
<main>        {/* Main content */}
<footer>      {/* Footer */}
<button>      {/* Buttons, not divs with onClick */}
```

**ARIA Labels**:
```tsx
<button aria-label="Close menu">
  <X className="h-4 w-4" />
</button>

<a href={url} aria-label={`Visit ${title} profile`}>
  {title}
</a>
```

**Keyboard Navigation**:
- All interactive elements focusable
- Focus-visible ring styles
- ESC to close modals/sheets
- Tab order makes sense

**Color Contrast**:
- Text: `text-white` on `bg-black` (21:1 contrast)
- Gray text: `text-gray-400` (meets WCAG AA)

**Focus States**:
```tsx
// Button focus-visible ring
focus-visible:ring-ring/50 focus-visible:ring-[3px]
```

[REVIEW: Run accessibility audit, document any issues/fixes]

---

*Last Updated: January 2025*
*Version: 1.0.0*
