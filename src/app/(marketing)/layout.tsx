import type React from "react"

/**
 * Marketing layout for public-facing pages
 * Simple layout without dashboard components like sidebar
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      {children}
    </div>
  )
}