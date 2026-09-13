import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { CoachBadge } from "@/types/club-dashboard"

const BADGE_COLORS = ["bg-blue-500", "bg-rose-500", "bg-amber-500", "bg-emerald-500", "bg-violet-500"]

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("")
}

/** Overlapping coach avatars, each with a small numbered badge (courses today) — the "who's
 * active this week" pattern from the reference dashboard's top banner. */
export function CoachBadgeRow({ coaches }: { coaches: CoachBadge[] }) {
  if (coaches.length === 0) return null

  return (
    <div className="flex items-center">
      {coaches.map((coach, i) => (
        <div key={coach.userId} className={cn("relative", i > 0 && "-ml-3")}>
          <Avatar className="h-11 w-11 ring-2 ring-card">
            {coach.image ? <AvatarImage src={coach.image} alt={coach.name} /> : null}
            <AvatarFallback className="text-sm">{initials(coach.name)}</AvatarFallback>
          </Avatar>
          <div
            className={cn(
              "absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-white ring-2 ring-card",
              BADGE_COLORS[i % BADGE_COLORS.length],
            )}
          >
            {coach.coursesToday}
          </div>
        </div>
      ))}
    </div>
  )
}
