"use client"

import { DashboardPageWrapper } from "@/components/features/dashboard/dashboard-page-wrapper"
import { CONTAINER_WIDTHS } from "@/constants/layout"

export default function Chat() {
  return (
    <DashboardPageWrapper containerWidth={CONTAINER_WIDTHS.chat}>
      {/* Chat content goes here */}
      <div>
        {/* Add chat content here */}
      </div>
    </DashboardPageWrapper>
  )
}