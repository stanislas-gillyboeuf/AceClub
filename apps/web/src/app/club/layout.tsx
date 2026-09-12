"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { useClubAdminAccess } from "@/hooks/use-club-admin-queries"
import { ClubAdminTopNav } from "@/components/custom/club-admin-top-nav"
import { ClubAdminIconRail } from "@/components/custom/club-admin-icon-rail"
import { ClubAdminNavUser } from "@/components/custom/club-admin-nav-user"
import { Providers } from "@/app/providers"

const NAV_ITEMS = [{ title: "Tableau de bord", href: "/club/dashboard" }]

export default function ClubAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="club-admin-theme bg-background text-foreground">
      <Providers>
        <ClubAdminGate>{children}</ClubAdminGate>
      </Providers>
    </div>
  )
}

function ClubAdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data: session, isPending: isSessionPending } = useSession()
  const { data: access, isPending: isAccessPending } = useClubAdminAccess()

  const isPending = isSessionPending || isAccessPending

  useEffect(() => {
    if (isPending) return
    if (!session || access?.access === "none") {
      router.replace("/login")
    }
  }, [session, access, isPending, router])

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!session || access?.access === "none") {
    return null
  }

  const activeOrganizationId = (session.session as { activeOrganizationId?: string })
    ?.activeOrganizationId

  return (
    <div className="flex h-screen">
      <ClubAdminIconRail activeOrganizationId={activeOrganizationId} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4">
          <span className="w-40 text-sm font-bold tracking-tight">Ace Club</span>
          <div className="flex flex-1 justify-center">
            <ClubAdminTopNav items={NAV_ITEMS} />
          </div>
          <div className="flex w-40 justify-end">
            <ClubAdminNavUser
              name={session.user.name}
              email={session.user.email}
              image={session.user.image}
            />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
