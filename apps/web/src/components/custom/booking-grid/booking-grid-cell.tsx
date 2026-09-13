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

  if (cell.kind === "admin_block") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex h-14 flex-col items-center justify-center rounded-md border border-black/10 px-1 text-center text-[#6B6B6B] transition-transform hover:scale-[1.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #E4E4E4, #E4E4E4 6px, #EFEFEF 6px, #EFEFEF 12px)",
        }}
      >
        <span className="text-[11px] font-bold leading-tight">{cell.bookedByLabel}</span>
        <span className="text-[10px] text-[#6B6B6B]/80">{cell.hour}h</span>
      </button>
    )
  }

  if (cell.kind === "course") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex h-14 flex-col items-center justify-center rounded-md border border-[#5B8DEF]/40 bg-[#E9F0FF] px-1 text-center text-[#0A0F06] transition-transform hover:scale-[1.03]"
      >
        <span className="text-[11px] font-bold leading-tight">{cell.coachName ?? "Cours"}</span>
        <span className="text-[10px] text-[#0A0F06]/60">{cell.hour}h</span>
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
