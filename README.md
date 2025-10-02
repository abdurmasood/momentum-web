# Momentum

![Momentum Banner](public/git/banner.png)

## Introduction

**Momentum** is a modern marketing and authentication site built with Next.js 15.5, React 19, and TypeScript. It provides a secure authentication gateway that handles user signup/login via Google OAuth and email magic links, then seamlessly redirects authenticated users to the main dashboard application.

The application features:

- **NextAuth v5 Authentication** with Google OAuth and passwordless email magic links
- **Cross-Application JWT Authentication** for secure dashboard handoff
- **Modern React Architecture** with Next.js 15.5 and App Router
- **Neon PostgreSQL Database** with Prisma ORM
- **Email Integration** via Resend for magic link authentication
- **Responsive Design** with Tailwind CSS 4.x and Radix UI components
- **TypeScript** for type-safe development

This is the authentication layer of the Momentum platform. After successful authentication, users are redirected to the separate dashboard application (`momentum-app`) with a secure JWT token.
