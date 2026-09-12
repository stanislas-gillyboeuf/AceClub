"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { useClubAdminAccess } from "@/hooks/use-club-admin-queries"
import { ClubAdminProvider } from "@/lib/club-admin-context"
import { ClubAdminTopNav, type ClubAdminNavItem } from "@/components/custom/club-admin-top-nav"
import { ClubAdminIconRail } from "@/components/custom/club-admin-icon-rail"
import { ClubAdminNavUser } from "@/components/custom/club-admin-nav-user"
import { Providers } from "@/app/providers"

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
  const pathname = usePathname()
  const { data: session, isPending: isSessionPending } = useSession()
  const { data: access, isPending: isAccessPending } = useClubAdminAccess()

  const isPending = isSessionPending || isAccessPending
  const activeOrganizationId = (session?.session as { activeOrganizationId?: string } | undefined)
    ?.activeOrganizationId

  const isAuthorized = !!session && access?.access !== "none" && !!activeOrganizationId
  const isOnboardingRoute = pathname === "/club/onboarding"
  const needsOnboarding = isAuthorized && access?.onboardingCompleted === false

  useEffect(() => {
    if (isPending) return
    if (!isAuthorized) {
      router.replace("/login")
      return
    }
    if (needsOnboarding && !isOnboardingRoute) {
      router.replace("/club/onboarding")
      return
    }
    if (!needsOnboarding && isOnboardingRoute) {
      router.replace("/club/dashboard")
    }
  }, [isAuthorized, isPending, needsOnboarding, isOnboardingRoute, router])

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthorized || !session || !access || !activeOrganizationId) {
    return null
  }

  if (needsOnboarding !== isOnboardingRoute) {
    // A redirect is in flight (see the effect above) — avoid flashing the wrong shell.
    return null
  }

  if (needsOnboarding) {
    return (
      <ClubAdminProvider
        value={{ organizationId: activeOrganizationId, access: access.access, role: access.role! }}
      >
        <div className="flex min-h-screen items-center justify-center p-6">{children}</div>
      </ClubAdminProvider>
    )
  }

  const navItems: ClubAdminNavItem[] = [
    { title: "Tableau de bord", href: "/club/dashboard" },
    { title: "Réservations", href: "/club/bookings" },
    { title: "Membres", href: "/club/members" },
    ...(access.access === "full"
      ? [
          { title: "Cotisations", href: "/club/dues" },
          { title: "Messagerie", href: "/club/messaging" },
        ]
      : []),
  ]

  return (
    <ClubAdminProvider
      value={{ organizationId: activeOrganizationId, access: access.access, role: access.role! }}
    >
      <div className="flex h-screen">
        <ClubAdminIconRail activeOrganizationId={activeOrganizationId} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex items-center justify-between px-6 py-4">
            <span className="w-40 text-sm font-bold tracking-tight">Ace Club</span>
            <div className="flex flex-1 justify-center">
              <ClubAdminTopNav items={navItems} />
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
    </ClubAdminProvider>
  )
}
