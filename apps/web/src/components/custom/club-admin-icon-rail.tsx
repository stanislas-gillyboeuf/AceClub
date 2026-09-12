"use client"

import { TooltipProvider } from "@/components/ui/tooltip"
import { ClubAdminOrgSwitcher } from "@/components/custom/club-admin-org-switcher"

interface ClubAdminIconRailProps {
  activeOrganizationId?: string
}

/** Thin vertical rail of icon-only quick actions — not the primary nav, that's the top bar. */
export function ClubAdminIconRail({ activeOrganizationId }: ClubAdminIconRailProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <aside className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-border py-4">
        <ClubAdminOrgSwitcher activeOrganizationId={activeOrganizationId} />
      </aside>
    </TooltipProvider>
  )
}
