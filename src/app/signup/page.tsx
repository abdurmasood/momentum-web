import { AuthLayout } from "@/components/marketing/auth/auth-layout"
import { SignupForm } from "@/components/marketing/auth/signup-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign Up | Momentum",
  description: "Create your Momentum account"
}

/**
 * Signup page - allows new users to create an account
 * Redirects to dashboard after successful registration
 */
export default function SignupPage() {
  return (
    <AuthLayout
      title="Get started"
      subtitle="Create your account to begin using Momentum"
    >
      <SignupForm />
    </AuthLayout>
  )
}