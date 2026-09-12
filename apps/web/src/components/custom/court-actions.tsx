"use client"

import { useEffect, useState } from "react"
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
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCreateCourt, useUpdateCourt } from "@/hooks/use-club-court-mutations"
import type {
  Court,
  CourtAccessPolicy,
  CourtCancellationPolicy,
  CourtSport,
  CourtSurface,
} from "@/types/court"

const SLOT_DURATIONS = [30, 45, 60, 90, 120]

interface CourtFormDialogProps {
  organizationId: string
  court?: Court | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CourtFormDialog({ organizationId, court, open, onOpenChange }: CourtFormDialogProps) {
  const createCourt = useCreateCourt()
  const updateCourt = useUpdateCourt()
  const isEditing = !!court

  const [name, setName] = useState("")
  const [sport, setSport] = useState<CourtSport>("tennis")
  const [surface, setSurface] = useState<CourtSurface | "none">("none")
  const [indoor, setIndoor] = useState(false)
  const [accessPolicy, setAccessPolicy] = useState<CourtAccessPolicy>("members_only")
  const [pricePerHour, setPricePerHour] = useState("")
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(60)
  const [cancellationPolicy, setCancellationPolicy] = useState<CourtCancellationPolicy>("anytime")
  const [cancellationWindowHours, setCancellationWindowHours] = useState("")

  useEffect(() => {
    if (!open) return
    setName(court?.name ?? "")
    setSport(court?.sport ?? "tennis")
    setSurface(court?.surface ?? "none")
    setIndoor(court?.indoor ?? false)
    setAccessPolicy(court?.accessPolicy ?? "members_only")
    setPricePerHour(court?.pricePerHour != null ? String(court.pricePerHour) : "")
    setSlotDurationMinutes(court?.slotDurationMinutes ?? 60)
    setCancellationPolicy(court?.cancellationPolicy ?? "anytime")
    setCancellationWindowHours(
      court?.cancellationWindowHours != null ? String(court.cancellationWindowHours) : "",
    )
  }, [open, court])

  const isValid =
    name.trim().length > 0 &&
    (cancellationPolicy !== "window" || Number(cancellationWindowHours) > 0)

  function handleSubmit() {
    const cancellationFields = {
      cancellationPolicy,
      cancellationWindowHours:
        cancellationPolicy === "window" ? Number(cancellationWindowHours) : undefined,
    }

    if (isEditing) {
      updateCourt.mutate(
        {
          courtId: court.id,
          name,
          sport,
          surface: surface === "none" ? undefined : surface,
          indoor,
          accessPolicy,
          pricePerHour: pricePerHour ? Number(pricePerHour) : null,
          slotDurationMinutes,
          ...cancellationFields,
        },
        { onSuccess: () => onOpenChange(false) },
      )
    } else {
      createCourt.mutate(
        {
          organizationId,
          name,
          sport,
          surface: surface === "none" ? undefined : surface,
          indoor,
          accessPolicy,
          pricePerHour: pricePerHour ? Number(pricePerHour) : undefined,
          slotDurationMinutes,
          ...cancellationFields,
        },
        { onSuccess: () => onOpenChange(false) },
      )
    }
  }

  const isPending = createCourt.isPending || updateCourt.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifier le court" : "Nouveau court"}</DialogTitle>
          <DialogDescription>
            Ces réglages sont aussi utilisés par l&apos;application mobile.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="court-name">Nom</Label>
            <Input id="court-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Sport</Label>
              <Select value={sport} onValueChange={(v: CourtSport) => setSport(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tennis">Tennis</SelectItem>
                  <SelectItem value="padel">Padel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Surface</Label>
              <Select value={surface} onValueChange={(v: CourtSurface | "none") => setSurface(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Non précisée</SelectItem>
                  <SelectItem value="clay">Terre battue</SelectItem>
                  <SelectItem value="hard">Dur</SelectItem>
                  <SelectItem value="grass">Gazon</SelectItem>
                  <SelectItem value="carpet">Moquette</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="court-indoor">Couvert</Label>
            <Switch id="court-indoor" checked={indoor} onCheckedChange={setIndoor} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Accès</Label>
              <Select
                value={accessPolicy}
                onValueChange={(v: CourtAccessPolicy) => setAccessPolicy(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="members_only">Membres uniquement</SelectItem>
                  <SelectItem value="open">Ouvert à tous</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Durée du créneau</Label>
              <Select
                value={String(slotDurationMinutes)}
                onValueChange={(v) => setSlotDurationMinutes(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SLOT_DURATIONS.map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="court-price">Prix par heure (€, optionnel)</Label>
            <Input
              id="court-price"
              type="number"
              min={0}
              value={pricePerHour}
              onChange={(e) => setPricePerHour(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Politique d&apos;annulation</Label>
              <Select
                value={cancellationPolicy}
                onValueChange={(v: CourtCancellationPolicy) => setCancellationPolicy(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="anytime">À tout moment</SelectItem>
                  <SelectItem value="window">Délai minimum</SelectItem>
                  <SelectItem value="disabled">Non autorisée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {cancellationPolicy === "window" ? (
              <div className="space-y-1.5">
                <Label htmlFor="cancel-window">Délai (heures)</Label>
                <Input
                  id="cancel-window"
                  type="number"
                  min={1}
                  value={cancellationWindowHours}
                  onChange={(e) => setCancellationWindowHours(e.target.value)}
                />
              </div>
            ) : null}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isPending}>
            {isPending ? "Enregistrement..." : isEditing ? "Enregistrer" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
