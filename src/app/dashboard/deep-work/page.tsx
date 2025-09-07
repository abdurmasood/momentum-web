"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Enhanced loading component for better UX
const Sphere3DLoading = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="text-center">
      <div className="animate-pulse mb-4">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400/30 via-purple-500/30 to-pink-500/30 mx-auto" />
      </div>
      <p className="text-sm text-muted-foreground">Loading 3D Experience...</p>
    </div>
  </div>
);

// Dynamic import with no SSR for Three.js compatibility
const Sphere3D = dynamic(() => import("@/components/visualization/3d/sphere-3d"), {
  ssr: false,
  loading: Sphere3DLoading,
});

export default function DeepWorkPage() {
  return (
    <div className="relative w-full h-screen overflow-hidden flex items-center justify-center">
      {/* Use calc to account for max sidebar width, sphere stays centered */}
      <div 
        className="absolute"
        style={{
          width: 'calc(100vw - 16rem)', // Account for expanded sidebar
          height: '100vh',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <Suspense fallback={<Sphere3DLoading />}>
          <Sphere3D 
            className="cursor-pointer" 
            width="100%" 
            height="100%" 
          />
        </Suspense>
      </div>
    </div>
  );
}