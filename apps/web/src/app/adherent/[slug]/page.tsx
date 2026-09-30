"use client"

import { use, useState } from "react"
import { Download } from "lucide-react"
import { AdherentLoginForm } from "@/components/custom/adherent/adherent-login-form"
import { BookingWidget } from "@/components/custom/adherent/booking-widget"
import { EventsWidget } from "@/components/custom/adherent/events-widget"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAdherentBookingEnabled, usePublicOrganization } from "@/hooks/use-adherent-queries"
import { siteConfig } from "@/lib/config"

interface AdherentPageProps {
  params: Promise<{ slug: string }>
}

export default function AdherentPage({ params }: AdherentPageProps) {
  const { slug } = use(params)
  const { data: org, isLoading: isOrgLoading, isError: isOrgError } = usePublicOrganization(slug)
  // Shared/public device: never trust a session cookie already sitting in the browser (e.g. left
  // open on a club's reception tablet, or from an admin also logged into the dashboard) — every
  // visit to this page requires signing in again, regardless of any existing Better Auth session.
  const [hasSignedInThisVisit, setHasSignedInThisVisit] = useState(false)

  const isMember = useAdherentBookingEnabled(hasSignedInThisVisit ? org?.id : undefined)

  if (isOrgLoading) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-8 sm:py-12">
        <Skeleton className="h-8 w-40 bg-adh-border/60" />
        <Skeleton className="mt-3 h-10 w-2/3 bg-adh-border/60" />
        <Skeleton className="mt-6 h-40 w-full rounded-2xl bg-adh-border/60" />
      </div>
    )
  }

  if (isOrgError || !org) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="text-2xl font-extrabold text-adh-fg">Club introuvable</h1>
        <p className="mt-2 text-sm text-adh-fg-dim">
          Ce lien ne correspond à aucun club adhérent à Ace Club.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 sm:py-12">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {org.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={org.logo}
              alt={org.name}
              className="h-11 w-11 rounded-full border border-adh-border object-cover"
            />
          )}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-adh-accent-dim">
              Aceclub · {org.name}
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-adh-fg sm:text-4xl">
              Espace adhérent
            </h1>
          </div>
        </div>
        <a
          href={siteConfig.appLinks.ios}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-adh-accent px-4 py-2.5 text-sm font-bold text-adh-accent-foreground transition-transform active:scale-[0.98]"
        >
          <Download className="h-4 w-4" />
          L&apos;app
        </a>
      </header>

      {!hasSignedInThisVisit ? (
        <AdherentLoginForm clubName={org.name} onSignedIn={() => setHasSignedInThisVisit(true)} />
      ) : isMember.isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-2xl bg-adh-border/60" />
          <Skeleton className="h-24 w-full rounded-2xl bg-adh-border/60" />
        </div>
      ) : isMember.isError ? (
        <Card className="rounded-2xl border-adh-border bg-adh-card">
          <CardContent className="py-8 text-center text-sm text-adh-fg-dim">
            Votre compte n&apos;est pas rattaché au club {org.name}. Connectez-vous avec le compte utilisé sur
            l&apos;app pour accéder aux réservations et événements.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {isMember.data?.enabled && <BookingWidget organizationId={org.id} />}
          <EventsWidget organizationId={org.id} />
        </div>
      )}
    </div>
  )
}
