"use client"

import Header from "@/components/layout/landing/header"
import HeroContent from "@/components/layout/landing/hero-content"
import ShaderBackground from "@/components/visualization/shaders/shader-background"

export default function ShaderShowcase() {
  return (
    <ShaderBackground>
      <Header />
      <HeroContent />
    </ShaderBackground>
  )
}
