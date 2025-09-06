"use client"

import Header from "@/components/features/landing/header"
import HeroContent from "@/components/features/landing/hero-content"
import ShaderBackground from "@/components/visualization/shaders/shader-background"

export default function ShaderShowcase() {
  return (
    <ShaderBackground>
      <Header />
      <HeroContent />
    </ShaderBackground>
  )
}
