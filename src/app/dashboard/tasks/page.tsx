"use client"

import { DashboardPageWrapper } from "@/components/features/dashboard/dashboard-page-wrapper"
import { CONTAINER_WIDTHS } from "@/constants/layout"

export default function Tasks() {
  return (
    <DashboardPageWrapper containerWidth={CONTAINER_WIDTHS.tasks}>
      {/* Tasks content goes here */}
      <div>
        {/* Add tasks content here */}
      </div>
    </DashboardPageWrapper>
  )
}