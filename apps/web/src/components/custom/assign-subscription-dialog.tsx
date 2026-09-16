"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSubscriptionTypes } from "@/hooks/use-club-subscription-queries"
import { useAssignSubscription } from "@/hooks/use-club-subscription-mutations"

interface AssignSubscriptionDialogProps {
  organizationId: string
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AssignSubscriptionDialog({
  organizationId,
  userId,
  open,
  onOpenChange,
}: AssignSubscriptionDialogProps) {
  const { data: types } = useSubscriptionTypes(organizationId)
  const assignSubscription = useAssignSubscription()

  const [subscriptionTypeId, setSubscriptionTypeId] = useState("")
  const [amountDue, setAmountDue] = useState("")

  function handleSubmit() {
    if (!subscriptionTypeId) return
    assignSubscription.mutate(
      {
        organizationId,
        userId,
        subscriptionTypeId,
        amountDueCents: amountDue ? Math.round(Number(amountDue) * 100) : undefined,
      },
      { onSuccess: () => { onOpenChange(false); setSubscriptionTypeId(""); setAmountDue("") } },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Attribuer un abonnement</DialogTitle>
          <DialogDescription>
            Démarre aujourd&apos;hui. La date de fin est calculée automatiquement si le type a une
            durée fixe.
          </DialogDescription>
        </DialogHeader>

        {types?.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun type d&apos;abonnement pour ce club —{" "}
            <Link href="/club/subscriptions" className="underline">
              en créer un
            </Link>
            .
          </p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Type d&apos;abonnement</Label>
              <Select value={subscriptionTypeId} onValueChange={setSubscriptionTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un type" />
                </SelectTrigger>
                <SelectContent>
                  {types?.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                      {t.priceCents != null ? ` — ${(t.priceCents / 100).toFixed(2)} €` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amount-due">Montant dû (€, optionnel)</Label>
              <Input
                id="amount-due"
                type="number"
                min={0}
                step="0.01"
                value={amountDue}
                onChange={(e) => setAmountDue(e.target.value)}
              />
            </div>
          </div>
        )}

        {assignSubscription.isError ? (
          <p className="text-sm text-destructive">{assignSubscription.error.message}</p>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!subscriptionTypeId || assignSubscription.isPending}
          >
            {assignSubscription.isPending ? "Attribution..." : "Attribuer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
