"use client"

import dynamic from "next/dynamic"
import { DashboardPageWrapper } from "@/components/features/dashboard/dashboard-page-wrapper"

// Dynamic import to avoid SSR issues with Three.js
// No loading state since component is preloaded during authentication
const Sphere3D = dynamic(() => import("@/components/visualization/3d/sphere-3d"), {
  ssr: false,
})

export default function DeepWork() {
  return (
    <DashboardPageWrapper fullScreen>
      {/* 3D Sphere Container */}
      <div className="relative z-10 w-full h-screen flex items-center justify-center">
        <Sphere3D 
          className="cursor-pointer" 
          width="100vw" 
          height="100vh" 
        />
      </div>
    </DashboardPageWrapper>
  )
}