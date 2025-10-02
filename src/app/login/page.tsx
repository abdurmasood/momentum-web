import { AuthLayout } from "@/components/marketing/auth/auth-layout"
import { LoginForm } from "@/components/marketing/auth/login-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In | Momentum",
  description: "Sign in to your Momentum account"
}

/**
 * Login page - allows users to authenticate
 * Redirects to dashboard after successful authentication
 */
export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to your dashboard"
    >
      <LoginForm />
    </AuthLayout>
  )
}