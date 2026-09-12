"use client"

import { cn } from "@/lib/utils"
import type { CourtSport } from "@/types/court"

interface SportToggleProps {
  sport: CourtSport
  onChange: (sport: CourtSport) => void
}

export function SportToggle({ sport, onChange }: SportToggleProps) {
  return (
    <div className="inline-flex rounded-full border border-black/10 bg-[#F1F1F1] p-1">
      {(["tennis", "padel"] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-bold capitalize transition-colors",
            sport === value ? "bg-[#D4FF3D] text-[#0A0F06]" : "text-[#0A0F06]/50",
          )}
        >
          {value}
        </button>
      ))}
    </div>
  )
}
