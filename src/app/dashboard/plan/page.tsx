"use client"

import { DashboardPageWrapper } from "@/components/features/dashboard/dashboard-page-wrapper"
import { CONTAINER_WIDTHS } from "@/constants/layout"
import { VercelV0Chat } from "@/components/features/chat/v0-ai-chat"

export default function Plan() {
  return (
    <DashboardPageWrapper containerWidth={CONTAINER_WIDTHS.plan}>
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <VercelV0Chat />
      </div>
    </DashboardPageWrapper>
  )
}