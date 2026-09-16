"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CreateSubscriptionTypeDialog } from "@/components/custom/create-subscription-type-dialog"
import { useSubscriptionTypes } from "@/hooks/use-club-subscription-queries"
import { useClubAdminContext } from "@/lib/club-admin-context"

function formatAmount(amountCents: number) {
  return (amountCents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })
}

export default function ClubSubscriptionsPage() {
  const { organizationId } = useClubAdminContext()
  const { data: types, isLoading } = useSubscriptionTypes(organizationId)
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Abonnements</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau type d&apos;abonnement
        </Button>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Les types définis ici sont attribuables à un membre depuis sa fiche.
      </p>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
        ) : !types?.length ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Aucun type d&apos;abonnement créé pour le moment.
            </CardContent>
          </Card>
        ) : (
          types.map((type) => (
            <Card key={type.id}>
              <CardHeader>
                <CardTitle className="text-base">{type.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {type.priceCents != null ? formatAmount(type.priceCents) : "Prix libre"}
                  {type.durationDays ? ` · ${type.durationDays} jours` : " · Sans date de fin fixe"}
                </p>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      <CreateSubscriptionTypeDialog
        organizationId={organizationId}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  )
}
