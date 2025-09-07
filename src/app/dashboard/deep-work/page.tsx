"use client";

import dynamic from "next/dynamic";

// Dynamic import with no SSR for Three.js compatibility
const Sphere3D = dynamic(() => import("@/components/visualization/3d/sphere-3d"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-pulse">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 via-accent/20 to-muted/20" />
      </div>
    </div>
  ),
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
        <Sphere3D 
          className="cursor-pointer" 
          width="100%" 
          height="100%" 
        />
      </div>
    </div>
  );
}