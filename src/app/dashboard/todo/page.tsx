"use client"

import { DashboardPageWrapper } from "@/components/dashboard-page-wrapper"
import { CONTAINER_WIDTHS } from "@/constants/layout"
import { VercelV0Chat } from "@/components/ui/v0-ai-chat"

export default function Todo() {
  return (
    <DashboardPageWrapper containerWidth={CONTAINER_WIDTHS.todo}>
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <VercelV0Chat />
      </div>
    </DashboardPageWrapper>
  )
}