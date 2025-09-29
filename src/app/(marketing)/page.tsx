"use client"

import { Navigation, HeroSection } from "@/components/marketing"

export default function LandingPage() {
  const handleCTAClick = () => {
    // Navigate to signup page when CTA is clicked
    window.location.href = '/signup'
  }

  return (
    <>
      <Navigation />
      <HeroSection onCTAClick={handleCTAClick} />
    </>
  )
}
