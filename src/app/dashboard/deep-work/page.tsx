"use client"

import dynamic from "next/dynamic"
import { useUser } from "@stackframe/stack"

// Dynamic import to avoid SSR issues with Three.js
// No loading state since component is preloaded during authentication
const Sphere3D = dynamic(() => import("@/components/sphere-3d"), {
  ssr: false,
})

export default function DeepWork() {
  const user = useUser({ or: "redirect" })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      {/* 3D Sphere Container */}
      <div className="relative z-10 w-full h-screen flex items-center justify-center">
        <Sphere3D 
          className="cursor-pointer" 
          width="100vw" 
          height="100vh" 
        />
      </div>
    </div>
  )
}