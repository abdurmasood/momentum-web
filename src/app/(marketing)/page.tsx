"use client"

import { useRouter } from "next/navigation"
import { Navigation, HeroSection } from "@/components/marketing"

export default function LandingPage() {
  const router = useRouter()

  const handleCTAClick = () => {
    // Navigate to signup page when CTA is clicked
    router.push('/signup')
  }

  return (
    <>
      <Navigation />
      <HeroSection onCTAClick={handleCTAClick} />
    </>
  )
}
