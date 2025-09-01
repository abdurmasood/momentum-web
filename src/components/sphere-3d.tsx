"use client"

import React, { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { MathUtils, Mesh } from "three"
import { vertexShader } from "@/shaders/sphere/vertex"
import { fragmentShader } from "@/shaders/sphere/fragment"

interface BlobProps {
  className?: string
}

const Blob: React.FC<BlobProps> = () => {
  const meshRef = useRef<Mesh>(null!)

  const uniforms = useMemo(
    () => ({
      u_intensity: {
        value: 0.15,
      },
      u_time: {
        value: 0.0,
      },
    }),
    []
  )

  useFrame((state) => {
    const { clock } = state
    if (!meshRef.current?.material) return

    // Update time uniform for continuous animation
    const material = meshRef.current.material as any
    material.uniforms.u_time.value = 0.4 * clock.getElapsedTime()

    // Fixed intensity value - no hover interactions
    material.uniforms.u_intensity.value = 0.15
  })

  return (
    <mesh
      ref={meshRef}
      position={[0, 0, 0]}
      scale={0.8}
    >
      <icosahedronGeometry args={[2, 20]} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
        wireframe={false}
      />
    </mesh>
  )
}

interface Sphere3DProps {
  className?: string
  width?: string | number
  height?: string | number
}

const Sphere3D: React.FC<Sphere3DProps> = ({ 
  className = "", 
  width = "100vw", 
  height = "100vh" 
}) => {
  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <Canvas 
        camera={{ position: [0.0, 0.0, 8.0] }}
        style={{ background: "transparent", pointerEvents: "none" }}
      >
        <Blob />
        <OrbitControls 
          enablePan={false}
          enableZoom={false}
          enableRotate={false}
          autoRotate={false}
        />
      </Canvas>
    </div>
  )
}

export default Sphere3D