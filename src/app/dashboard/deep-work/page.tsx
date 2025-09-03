"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"
import { useUser } from "@stackframe/stack"

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

export default function DeepWork() {
  const user = useUser({ or: "redirect" })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      {/* 3D Sphere Container */}
      <div className="relative z-10 w-full h-screen flex items-center justify-center">
        {/* Welcome overlay */}
        <div className="absolute top-4 left-4 md:top-8 md:left-8 z-20">
          <h1 className="text-xl md:text-2xl font-light text-slate-100 mb-2">
            Deep Work Mode
          </h1>
          <p className="text-sm text-slate-400">
            Focus with our immersive visualization
          </p>
        </div>

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
    </div>
  )
}