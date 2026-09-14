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
import { useCreateEvent } from "@/hooks/use-event-mutations"
import type { EventVisibility } from "@/types/event"

interface CreateEventDialogProps {
  organizationId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateEventDialog({ organizationId, open, onOpenChange }: CreateEventDialogProps) {
  const createEvent = useCreateEvent()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [address, setAddress] = useState("")
  const [maxParticipants, setMaxParticipants] = useState("")
  const [visibility, setVisibility] = useState<EventVisibility>("organization")
  const [isFree, setIsFree] = useState(true)
  const [price, setPrice] = useState("")
  const [paymentLink, setPaymentLink] = useState("")

  function reset() {
    setName("")
    setDescription("")
    setStartDate("")
    setEndDate("")
    setAddress("")
    setMaxParticipants("")
    setVisibility("organization")
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
    createEvent.mutate(
      {
        organizationId,
        name: name.trim(),
        description: description.trim() || undefined,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        address: address.trim() || undefined,
        maxParticipants: maxParticipants ? Number(maxParticipants) : undefined,
        isFree,
        price: isFree ? undefined : Math.round(Number(price) * 100),
        paymentLink: isFree ? undefined : paymentLink.trim(),
        visibility,
      },
      { onSuccess: () => { onOpenChange(false); reset() } },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvel événement</DialogTitle>
          <DialogDescription>
            Visible et inscriptible immédiatement depuis l&apos;application mobile.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="event-name">Nom</Label>
            <Input id="event-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="event-description">Description</Label>
            <Textarea
              id="event-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="event-start">Début</Label>
              <Input
                id="event-start"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="event-end">Fin</Label>
              <Input
                id="event-end"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="event-address">Lieu (optionnel)</Label>
            <Input id="event-address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="event-capacity">Places (optionnel)</Label>
              <Input
                id="event-capacity"
                type="number"
                min={1}
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Visibilité</Label>
              <Select value={visibility} onValueChange={(v: EventVisibility) => setVisibility(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="organization">Membres du club</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="event-free">Gratuit</Label>
            <Switch id="event-free" checked={isFree} onCheckedChange={setIsFree} />
          </div>

          {!isFree ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="event-price">Prix (€)</Label>
                <Input
                  id="event-price"
                  type="number"
                  min={0}
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="event-payment-link">Lien de paiement</Label>
                <Input
                  id="event-payment-link"
                  value={paymentLink}
                  onChange={(e) => setPaymentLink(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          ) : null}
        </div>

        {createEvent.isError ? (
          <p className="text-sm text-destructive">{createEvent.error.message}</p>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || createEvent.isPending}>
            {createEvent.isPending ? "Création..." : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
