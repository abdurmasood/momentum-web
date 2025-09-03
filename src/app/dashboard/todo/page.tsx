"use client"

import { DashboardPageWrapper } from "@/components/dashboard-page-wrapper"
import { CONTAINER_WIDTHS } from "@/constants/layout"

export default function Todo() {
  return (
    <DashboardPageWrapper containerWidth={CONTAINER_WIDTHS.todo}>
      <div>
        {/* Todo content goes here */}
      </div>
    </DashboardPageWrapper>
  )
}