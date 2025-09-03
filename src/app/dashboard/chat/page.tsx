"use client"

import { useUser } from "@stackframe/stack"

export default function Chat() {
  const user = useUser({ or: "redirect" })
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
      </div>
    </div>
  )
}