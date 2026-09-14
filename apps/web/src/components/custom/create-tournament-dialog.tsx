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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCreateTournament } from "@/hooks/use-tournament-mutations"
import type { TournamentSport } from "@/types/tournament"

const DRAW_SIZES = [4, 8, 16, 32, 64] as const

interface CreateTournamentDialogProps {
  organizationId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateTournamentDialog({
  organizationId,
  open,
  onOpenChange,
}: CreateTournamentDialogProps) {
  const createTournament = useCreateTournament()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [address, setAddress] = useState("")
  const [sport, setSport] = useState<TournamentSport>("tennis")
  const [drawSize, setDrawSize] = useState(8)
  const [isFree, setIsFree] = useState(true)
  const [price, setPrice] = useState("")
  const [paymentLink, setPaymentLink] = useState("")

  function reset() {
    setName("")
    setDescription("")
    setStartDate("")
    setEndDate("")
    setAddress("")
    setSport("tennis")
    setDrawSize(8)
    setIsFree(true)
    setPrice("")
    setPaymentLink("")
  }

  const isValid =
    name.trim().length > 0 &&
    !!startDate &&
    !!endDate &&
    new Date(endDate) >= new Date(startDate) &&
    (isFree || paymentLink.trim().length > 0)

  function handleSubmit() {
    if (!isValid) return
    createTournament.mutate(
      {
        organizationId,
        name: name.trim(),
        description: description.trim() || undefined,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        address: address.trim() || undefined,
        maxParticipants: drawSize,
        isFree,
        price: isFree ? undefined : Math.round(Number(price) * 100),
        paymentLink: isFree ? undefined : paymentLink.trim(),
        visibility: "organization",
        sport,
        drawSize,
      },
      { onSuccess: () => { onOpenChange(false); reset() } },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouveau tournoi</DialogTitle>
          <DialogDescription>
            Crée un événement inscriptible depuis l&apos;app, avec un tableau à générer une fois
            les inscriptions prêtes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="tournament-name">Nom</Label>
            <Input id="tournament-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tournament-description">Description</Label>
            <Textarea
              id="tournament-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="tournament-start">Début</Label>
              <Input
                id="tournament-start"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tournament-end">Fin</Label>
              <Input
                id="tournament-end"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tournament-address">Lieu (optionnel)</Label>
            <Input
              id="tournament-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Sport</Label>
              <Select value={sport} onValueChange={(v: TournamentSport) => setSport(v)}>
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
              <Label>Taille du tableau</Label>
              <Select value={String(drawSize)} onValueChange={(v) => setDrawSize(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DRAW_SIZES.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size} joueurs
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="tournament-free">Gratuit</Label>
            <Switch id="tournament-free" checked={isFree} onCheckedChange={setIsFree} />
          </div>

          {!isFree ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="tournament-price">Prix (€)</Label>
                <Input
                  id="tournament-price"
                  type="number"
                  min={0}
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tournament-payment-link">Lien de paiement</Label>
                <Input
                  id="tournament-payment-link"
                  value={paymentLink}
                  onChange={(e) => setPaymentLink(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          ) : null}
        </div>

        {createTournament.isError ? (
          <p className="text-sm text-destructive">{createTournament.error.message}</p>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || createTournament.isPending}>
            {createTournament.isPending ? "Création..." : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
