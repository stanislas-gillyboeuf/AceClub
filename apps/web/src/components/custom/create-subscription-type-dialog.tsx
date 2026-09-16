"use client"

import { useState } from "react"
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
import { useCreateSubscriptionType } from "@/hooks/use-club-subscription-mutations"

interface CreateSubscriptionTypeDialogProps {
  organizationId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateSubscriptionTypeDialog({
  organizationId,
  open,
  onOpenChange,
}: CreateSubscriptionTypeDialogProps) {
  const createType = useCreateSubscriptionType()

  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [durationDays, setDurationDays] = useState("")

  function reset() {
    setName("")
    setPrice("")
    setDurationDays("")
  }

  const isValid = name.trim().length > 0

  function handleSubmit() {
    if (!isValid) return
    createType.mutate(
      {
        organizationId,
        name: name.trim(),
        priceCents: price ? Math.round(Number(price) * 100) : undefined,
        durationDays: durationDays ? Number(durationDays) : undefined,
      },
      { onSuccess: () => { onOpenChange(false); reset() } },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau type d&apos;abonnement</DialogTitle>
          <DialogDescription>
            Laisse la durée vide pour un abonnement sans date de fin fixe (géré manuellement).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="subscription-name">Nom</Label>
            <Input id="subscription-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="subscription-price">Prix (€, optionnel)</Label>
              <Input
                id="subscription-price"
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subscription-duration">Durée (jours, optionnel)</Label>
              <Input
                id="subscription-duration"
                type="number"
                min={1}
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
              />
            </div>
          </div>
        </div>

        {createType.isError ? (
          <p className="text-sm text-destructive">{createType.error.message}</p>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || createType.isPending}>
            {createType.isPending ? "Création..." : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
