"use client"

import { createContext, useContext } from "react"
import type { ClubAdminAccess, ClubAdminRole } from "@/hooks/use-club-admin-queries"

interface ClubAdminContextValue {
  organizationId: string
  access: ClubAdminAccess
  role: ClubAdminRole
}

const ClubAdminContext = createContext<ClubAdminContextValue | null>(null)

export function ClubAdminProvider({
  value,
  children,
}: {
  value: ClubAdminContextValue
  children: React.ReactNode
}) {
  return <ClubAdminContext.Provider value={value}>{children}</ClubAdminContext.Provider>
}

/** Available on every page under /club — organization + access level, resolved once in the layout. */
export function useClubAdminContext() {
  const context = useContext(ClubAdminContext)
  if (!context) {
    throw new Error("useClubAdminContext must be used within the /club layout")
  }
  return context
}
