"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const WEEKDAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"]
const MONTH_LABELS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
]

interface MonthCalendarProps {
  yearMonth: string // "YYYY-MM"
  availableDates: Set<string>
  selectedDate: string | null
  onSelectDate: (date: string) => void
  onMonthChange: (yearMonth: string) => void
  minYearMonth: string
  maxYearMonth: string
  isLoading?: boolean
}

function addMonths(yearMonth: string, delta: number): string {
  const [y, m] = yearMonth.split("-").map(Number)
  const d = new Date(Date.UTC(y, m - 1 + delta, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
}

export function MonthCalendar({
  yearMonth,
  availableDates,
  selectedDate,
  onSelectDate,
  onMonthChange,
  minYearMonth,
  maxYearMonth,
  isLoading,
}: MonthCalendarProps) {
  const [year, month] = yearMonth.split("-").map(Number)
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1))
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  // getUTCDay(): 0=Sunday..6=Saturday — convert to Monday-first index (0=Monday..6=Sunday)
  const leadingBlanks = (firstOfMonth.getUTCDay() + 6) % 7

  const cells: (string | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    }),
  ]

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          disabled={yearMonth <= minYearMonth}
          onClick={() => onMonthChange(addMonths(yearMonth, -1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-medium">
          {MONTH_LABELS[month - 1]} {year}
        </span>
        <Button
          variant="ghost"
          size="icon"
          disabled={yearMonth >= maxYearMonth}
          onClick={() => onMonthChange(addMonths(yearMonth, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-mkt-light-fg-dim">
        {WEEKDAY_LABELS.map((label, i) => (
          <div key={i} className="py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />
          const available = availableDates.has(date)
          const selected = date === selectedDate
          return (
            <button
              key={date}
              type="button"
              disabled={!available || isLoading}
              onClick={() => onSelectDate(date)}
              className={cn(
                "aspect-square rounded-full text-sm transition-colors",
                available
                  ? "cursor-pointer font-medium hover:bg-mkt-accent/20"
                  : "cursor-not-allowed text-mkt-light-fg-dim/40",
                selected && "bg-mkt-accent text-mkt-accent-foreground hover:bg-mkt-accent",
              )}
            >
              {Number(date.slice(-2))}
            </button>
          )
        })}
      </div>
    </div>
  )
}
