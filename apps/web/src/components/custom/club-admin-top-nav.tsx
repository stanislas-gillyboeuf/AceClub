"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export interface ClubAdminNavItem {
  title: string
  href: string
}

interface ClubAdminTopNavProps {
  items: ClubAdminNavItem[]
}

/** Horizontal text-tab nav — active tab renders as a solid black pill, no underline. */
export function ClubAdminTopNav({ items }: ClubAdminTopNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors",
              isActive && "bg-primary text-primary-foreground",
            )}
          >
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
