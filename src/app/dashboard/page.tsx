"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"
import ShaderBackground from "@/components/shader-background"

// Dynamic import to avoid SSR issues with Three.js
const Sphere3D = dynamic(() => import("@/components/sphere-3d"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="animate-pulse">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-50" />
      </div>
    </div>
  ),
})

export default function Dashboard() {
  return (
    <ShaderBackground>
      {/* 3D Sphere Container */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <Suspense 
          fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-pulse">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 opacity-60" />
              </div>
            </div>
          }
        >
          <Sphere3D 
            className="cursor-pointer" 
            width="100vw" 
            height="100vh" 
          />
        </Suspense>
      </div>
    </ShaderBackground>
  )
}