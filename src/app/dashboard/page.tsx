"use client"

import { useUser } from "@stackframe/stack"
import { CONTAINER_WIDTHS, SPACING } from "@/constants/layout"

export default function Dashboard() {
  const user = useUser({ or: "redirect" })
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-6 md:p-8">
      <div className={`${CONTAINER_WIDTHS.dashboard} mx-auto`}>
      </div>
    </div>
  )
}