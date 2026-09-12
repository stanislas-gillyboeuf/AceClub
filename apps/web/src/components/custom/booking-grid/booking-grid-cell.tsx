"use client"

import { cn } from "@/lib/utils"
import type { AdminBoardHourCell } from "@/types/court"

interface BookingGridCellProps {
  cell: AdminBoardHourCell
  onClick: () => void
}

/**
 * Deliberately styled with explicit literal colors (not the shared bg-primary/bg-card
 * tokens) — this grid adapts the real mobile booking screen's look, isolated from the
 * SugarCRM shell around it.
 */
export function BookingGridCell({ cell, onClick }: BookingGridCellProps) {
  if (cell.status === "past") {
    return (
      <div className="flex h-14 items-center justify-center rounded-md bg-[#F1F1F1] text-xs text-[#B0B0B0]">
        {cell.hour}h
      </div>
    )
  }

  if (cell.status === "free") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex h-14 items-center justify-center rounded-md bg-[#D4FF3D] text-sm font-bold text-[#0A0F06] transition-transform hover:scale-[1.03]"
      >
        {cell.hour}h
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-14 flex-col items-center justify-center rounded-md border px-1 text-center transition-transform hover:scale-[1.03]",
        cell.bookedAsClub
          ? "border-[#F5A524]/40 bg-[#FFF4E0] text-[#0A0F06]"
          : "border-black/10 bg-white text-[#0A0F06]",
      )}
    >
      <span className="text-[11px] font-bold leading-tight">{cell.bookedByLabel}</span>
      <span className="text-[10px] text-[#0A0F06]/60">{cell.hour}h</span>
    </button>
  )
}
