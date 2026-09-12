import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface AvatarStackPerson {
  id: string
  name: string
  image?: string | null
}

interface AvatarStackProps {
  people: AvatarStackPerson[]
  max?: number
  size?: "sm" | "md"
  className?: string
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

/** Stacked, slightly overlapping circular avatars — the "who's in this group" pattern. */
export function AvatarStack({ people, max = 4, size = "sm", className }: AvatarStackProps) {
  const visible = people.slice(0, max)
  const overflow = people.length - visible.length
  const sizeClass = size === "sm" ? "h-7 w-7" : "h-9 w-9"

  return (
    <div className={cn("flex items-center", className)}>
      {visible.map((person) => (
        <Avatar
          key={person.id}
          className={cn(sizeClass, "-ml-2 ring-2 ring-card first:ml-0")}
        >
          {person.image ? <AvatarImage src={person.image} alt={person.name} /> : null}
          <AvatarFallback className="text-xs">{initials(person.name)}</AvatarFallback>
        </Avatar>
      ))}
      {overflow > 0 ? (
        <div
          className={cn(
            sizeClass,
            "-ml-2 flex items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground ring-2 ring-card",
          )}
        >
          +{overflow}
        </div>
      ) : null}
    </div>
  )
}
