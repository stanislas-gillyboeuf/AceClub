"use client"

import { BookingGridCell } from "./booking-grid-cell"
import type { AdminBoardCourt, AdminBoardHourCell } from "@/types/court"

interface BookingGridProps {
  courts: AdminBoardCourt[]
  onCellClick: (court: AdminBoardCourt, cell: AdminBoardHourCell) => void
}

export function BookingGrid({ courts, onCellClick }: BookingGridProps) {
  if (courts.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-[#0A0F06]/50">
        Aucun court disponible pour ce sport.
      </div>
    )
  }

  const hours = courts[0]?.hours.map((h) => h.hour) ?? []
  const gridTemplateColumns = `160px repeat(${hours.length}, minmax(64px, 1fr))`

  return (
    <div className="overflow-x-auto">
      <div className="min-w-fit">
        <div className="grid gap-1 pb-1" style={{ gridTemplateColumns }}>
          <div />
          {hours.map((hour) => (
            <div key={hour} className="text-center text-[11px] font-bold text-[#0A0F06]/40">
              {hour}h
            </div>
          ))}
        </div>

        {courts.map((court) => (
          <div
            key={court.id}
            className="grid items-center gap-1 border-t border-black/5 py-1.5"
            style={{ gridTemplateColumns }}
          >
            <div className="truncate pr-2 text-sm font-bold text-[#0A0F06]">{court.name}</div>
            {court.hours.map((cell) => (
              <BookingGridCell key={cell.hour} cell={cell} onClick={() => onCellClick(court, cell)} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
