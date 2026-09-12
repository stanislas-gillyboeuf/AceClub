"use client"

import { Building2, Check } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useClubOrganizations } from "@/hooks/use-club-admin-queries"
import { useSetActiveClubOrganization } from "@/hooks/use-club-admin-mutations"
import { cn } from "@/lib/utils"

interface ClubAdminOrgSwitcherProps {
  activeOrganizationId?: string
}

/** Only renders once the user actually belongs to more than one club. */
export function ClubAdminOrgSwitcher({ activeOrganizationId }: ClubAdminOrgSwitcherProps) {
  const { data: organizations } = useClubOrganizations()
  const setActive = useSetActiveClubOrganization()

  if (!organizations || organizations.length < 2) return null

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label="Changer de club"
            >
              <Building2 className="h-4 w-4" />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="right">Changer de club</TooltipContent>
      </Tooltip>
      <PopoverContent side="right" align="start" className="w-64 p-1">
        {organizations.map((org) => (
          <button
            key={org.id}
            type="button"
            disabled={setActive.isPending}
            onClick={() => setActive.mutate(org.slug)}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50",
              org.id === activeOrganizationId && "font-medium",
            )}
          >
            {org.name}
            {org.id === activeOrganizationId ? <Check className="h-4 w-4" /> : null}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
