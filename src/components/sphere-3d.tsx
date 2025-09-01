"use client"

import React, { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Mesh, ShaderMaterial } from "three"
import { vertexShader } from "@/shaders/sphere/vertex"
import { fragmentShader } from "@/shaders/sphere/fragment"

// Animation constants
const ANIMATION_SPEED = 0.4
const SPHERE_INTENSITY = 0.15
const SPHERE_SCALE = 0.8
const CAMERA_DISTANCE = 8.0
const ICOSAHEDRON_RADIUS = 2
const ICOSAHEDRON_DETAIL = 20

interface BlobProps {
  className?: string
}

const Blob: React.FC<BlobProps> = () => {
  const meshRef = useRef<Mesh>(null!)

  const uniforms = useMemo(
    () => ({
      u_intensity: {
        value: SPHERE_INTENSITY,
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

    // Type-safe material casting with proper guard
    const material = meshRef.current.material as ShaderMaterial
    if (!material.uniforms) return

    // Update time uniform for continuous animation
    material.uniforms.u_time.value = ANIMATION_SPEED * clock.getElapsedTime()

    // Fixed intensity value - no hover interactions
    material.uniforms.u_intensity.value = SPHERE_INTENSITY
  })

  return (
    <mesh
      ref={meshRef}
      position={[0, 0, 0]}
      scale={SPHERE_SCALE}
    >
      <icosahedronGeometry args={[ICOSAHEDRON_RADIUS, ICOSAHEDRON_DETAIL]} />
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
        camera={{ position: [0.0, 0.0, CAMERA_DISTANCE] }}
        style={{ background: "transparent", pointerEvents: "none" }}
        dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1}
        performance={{ min: 0.5 }}
      >
        <Blob />
      </Canvas>
    </div>
  )
}

export default Sphere3D