"use client"

import { use } from "react"
import { Download } from "lucide-react"
import { AdherentLoginForm } from "@/components/custom/adherent/adherent-login-form"
import { EventsWidget } from "@/components/custom/adherent/events-widget"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAdherentBookingEnabled, usePublicOrganization } from "@/hooks/use-adherent-queries"
import { siteConfig } from "@/lib/config"
import { useSession } from "@/lib/auth-client"

interface AdherentPageProps {
  params: Promise<{ slug: string }>
}

export default function AdherentPage({ params }: AdherentPageProps) {
  const { slug } = use(params)
  const { data: org, isLoading: isOrgLoading, isError: isOrgError } = usePublicOrganization(slug)
  const { data: session, isPending: isSessionPending, refetch: refetchSession } = useSession()

  const isMember = useAdherentBookingEnabled(session ? org?.id : undefined)

  if (isOrgLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-6 h-40 w-full" />
      </div>
    )
  }

  if (isOrgError || !org) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Club introuvable</h1>
        <p className="mt-2 text-mkt-fg/70">
          Ce lien ne correspond à aucun club adhérent à Ace Club.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <header className="mb-8 flex items-center gap-4">
        {org.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={org.logo} alt={org.name} className="h-14 w-14 rounded-full object-cover" />
        )}
        <div>
          <h1 className="text-2xl font-semibold">{org.name}</h1>
          <p className="text-sm text-mkt-fg/70">Espace adhérent</p>
        </div>
      </header>

      <Card className="mb-8">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
          <p className="text-sm text-mkt-fg/80">
            Pour une meilleure expérience, réservez vos créneaux et suivez vos événements depuis l&apos;app Ace Club.
          </p>
          <Button asChild size="sm">
            <a href={siteConfig.appLinks.ios} target="_blank" rel="noopener noreferrer">
              <Download className="mr-2 h-4 w-4" />
              Télécharger l&apos;app
            </a>
          </Button>
        </CardContent>
      </Card>

      {isSessionPending ? (
        <Skeleton className="h-64 w-full" />
      ) : !session ? (
        <AdherentLoginForm clubName={org.name} onSignedIn={() => refetchSession()} />
      ) : isMember.isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : isMember.isError ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-mkt-fg/70">
            Votre compte n&apos;est pas rattaché au club {org.name}. Connectez-vous avec le compte utilisé sur
            l&apos;app pour accéder aux réservations et événements.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* TODO: BookingWidget, ajouté séparément — s'insère ici, après la sonde d'appartenance
              (isMember, ci-dessus) et avant/à côté de la section Événements. Ne rend que si
              isMember.data?.enabled est true. */}
          <EventsWidget organizationId={org.id} />
        </div>
      )}
    </div>
  )
}
