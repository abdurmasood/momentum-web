"use client"

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Hook to preload dashboard routes and components during authentication
 * Improves perceived performance by loading assets while user is signing in
 */
export function usePreloadDashboard() {
  const router = useRouter()
  const hasPreloaded = useRef(false)

  useEffect(() => {
    // Only preload once per session
    if (hasPreloaded.current) return
    hasPreloaded.current = true

    const startPreloading = async () => {
      try {
        console.log('🚀 Starting dashboard preload...')

        // Use requestIdleCallback for non-blocking preloading
        const schedulePreload = (callback: () => void) => {
          if ('requestIdleCallback' in window) {
            requestIdleCallback(callback, { timeout: 2000 })
          } else {
            // Fallback for browsers without requestIdleCallback
            setTimeout(callback, 0)
          }
        }

        // 1. Prefetch dashboard routes
        schedulePreload(() => {
          Promise.all([
            router.prefetch('/dashboard'),
            router.prefetch('/dashboard/deep-work'),
            router.prefetch('/dashboard/plan'),
            router.prefetch('/dashboard/tasks')
          ]).then(() => {
            console.log('✅ Dashboard routes prefetched')
          }).catch(error => {
            console.warn('⚠️ Route prefetch error:', error)
          })
        })

        // 2. Preload heavy components
        schedulePreload(() => {
          Promise.all([
            // Preload Three.js Sphere3D component
            import('@/components/visualization/3d/sphere-3d').then(() => {
              console.log('✅ Sphere3D component preloaded')
            }),
            // Preload new dashboard sidebar
            import('@/components/app-sidebar').then(() => {
              console.log('✅ Dashboard sidebar preloaded')
            }),
            // Preload loading skeleton
            import('@/components/visualization/3d/sphere-3d-loading-skeleton').then(() => {
              console.log('✅ Loading skeleton preloaded')
            })
          ]).catch(error => {
            console.warn('⚠️ Component preload error:', error)
          })
        })

        // 3. Preload Three.js dependencies (if not already loaded)
        schedulePreload(() => {
          Promise.all([
            import('@react-three/fiber'),
            import('@react-three/drei'),
            import('three')
          ]).then(() => {
            console.log('✅ Three.js dependencies preloaded')
          }).catch(error => {
            console.warn('⚠️ Three.js preload error:', error)
          })
        })

        // 4. Preload dashboard icon components for immediate rendering
        schedulePreload(() => {
          Promise.all([
            import('@/components/icons/clock-icon'),
            import('@/components/icons/message-square-icon'),
            import('@/components/icons/sparkles-icon'),
            import('@/components/icons/telescope-icon'),
            import('@/components/icons/logout-icon')
          ]).then(() => {
            console.log('✅ Dashboard icons preloaded')
          }).catch(error => {
            console.warn('⚠️ Icon preload error:', error)
          })
        })

        console.log('🎯 Dashboard preloading initiated')
      } catch (error) {
        console.error('❌ Preloading error:', error)
      }
    }

    // Start preloading when browser is idle to avoid blocking auth UI
    let cleanupId: number
    
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      cleanupId = requestIdleCallback(startPreloading, { timeout: 1000 })
    } else {
      // Fallback for browsers without requestIdleCallback
      cleanupId = setTimeout(startPreloading, 100) as unknown as number
    }

    return () => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        cancelIdleCallback(cleanupId)
      } else {
        clearTimeout(cleanupId)
      }
    }
  }, [router])

  return { hasStartedPreloading: hasPreloaded.current }
}