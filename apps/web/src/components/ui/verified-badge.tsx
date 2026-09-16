import { BadgeCheck } from "lucide-react"
import { cn } from "@/lib/utils"

interface VerifiedBadgeProps {
  className?: string
}

export function VerifiedBadge({ className }: VerifiedBadgeProps) {
  return (
    <span title="Niveau vérifié par le club" className="inline-flex">
      <BadgeCheck className={cn("h-4 w-4 shrink-0 text-emerald-600", className)} />
    </span>
  )
}
