"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

interface DaySelectorProps {
  date: string
  onChange: (date: string) => void
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function shiftDate(dateKey: string, deltaDays: number): string {
  const d = new Date(`${dateKey}T00:00:00`)
  d.setDate(d.getDate() + deltaDays)
  return toDateKey(d)
}

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
})

export function DaySelector({ date, onChange }: DaySelectorProps) {
  const label = dateFormatter.format(new Date(`${date}T00:00:00`))

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(shiftDate(date, -1))}
        className="flex h-8 w-8 items-center justify-center rounded-full text-[#0A0F06] hover:bg-[#F1F1F1]"
        aria-label="Jour précédent"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="min-w-40 text-center text-sm font-bold capitalize text-[#0A0F06]">
        {label}
      </span>
      <button
        type="button"
        onClick={() => onChange(shiftDate(date, 1))}
        className="flex h-8 w-8 items-center justify-center rounded-full text-[#0A0F06] hover:bg-[#F1F1F1]"
        aria-label="Jour suivant"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onChange(toDateKey(new Date()))}
        className="ml-2 rounded-full border border-black/10 px-3 py-1 text-xs font-bold text-[#0A0F06] hover:bg-[#F1F1F1]"
      >
        Aujourd&apos;hui
      </button>
    </div>
  )
}
