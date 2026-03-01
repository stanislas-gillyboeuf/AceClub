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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useAdminCreateEvent,
  useAdminUpdateEventStatus,
  useAdminDeleteEvent,
} from "@/hooks/use-admin-mutations"
import type { AdminEvent } from "@/types/admin"

export function CreateEventDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [address, setAddress] = useState("")
  const [maxParticipants, setMaxParticipants] = useState("")
  const [isFree, setIsFree] = useState(true)
  const [price, setPrice] = useState("")
  const [paymentLink, setPaymentLink] = useState("")
  const [visibility, setVisibility] = useState<"public" | "organization">("public")
  const [organizationId, setOrganizationId] = useState("")

  const createMutation = useAdminCreateEvent()

  const resetForm = () => {
    setName("")
    setDescription("")
    setStartDate("")
    setEndDate("")
    setAddress("")
    setMaxParticipants("")
    setIsFree(true)
    setPrice("")
    setPaymentLink("")
    setVisibility("public")
    setOrganizationId("")
  }

  const handleSubmit = async () => {
    await createMutation.mutateAsync({
      name,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      ...(description.trim() && { description: description.trim() }),
      ...(address.trim() && { address: address.trim() }),
      ...(maxParticipants && { maxParticipants: Number(maxParticipants) }),
      isFree,
      ...(!isFree && price && { price: Number(price) }),
      ...(!isFree && paymentLink.trim() && { paymentLink: paymentLink.trim() }),
      visibility,
      ...(organizationId.trim() && { organizationId: organizationId.trim() }),
    })

    resetForm()
    onOpenChange(false)
  }

  const canSubmit = name.trim() && startDate && endDate

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm()
        onOpenChange(v)
      }}
    >
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvel &eacute;v&eacute;nement</DialogTitle>
          <DialogDescription>
            Cr&eacute;er un nouvel &eacute;v&eacute;nement sur la plateforme
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="event-name">Nom *</Label>
            <Input
              id="event-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tournoi de tennis"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="event-description">Description</Label>
            <Textarea
              id="event-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de l'&eacute;v&eacute;nement..."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="event-start">D&eacute;but *</Label>
              <Input
                id="event-start"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-end">Fin *</Label>
              <Input
                id="event-end"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="event-address">Adresse</Label>
            <Input
              id="event-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Rue du Tennis, 75001 Paris"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="event-max">Participants max</Label>
            <Input
              id="event-max"
              type="number"
              min="1"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
              placeholder="Illimit&eacute;"
            />
          </div>
          <div className="grid gap-2">
            <Label>Tarification</Label>
            <Select
              value={isFree ? "free" : "paid"}
              onValueChange={(v) => setIsFree(v === "free")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Gratuit</SelectItem>
                <SelectItem value="paid">Payant</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {!isFree && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="event-price">Prix (centimes)</Label>
                <Input
                  id="event-price"
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="1000 = 10.00&euro;"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event-payment-link">Lien de paiement</Label>
                <Input
                  id="event-payment-link"
                  type="url"
                  value={paymentLink}
                  onChange={(e) => setPaymentLink(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </>
          )}
          <div className="grid gap-2">
            <Label>Visibilit&eacute;</Label>
            <Select value={visibility} onValueChange={(v) => setVisibility(v as "public" | "organization")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="organization">Organisation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="event-org-id">ID Organisation (optionnel)</Label>
            <Input
              id="event-org-id"
              value={organizationId}
              onChange={(e) => setOrganizationId(e.target.value)}
              placeholder="ID de l'organisation"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              resetForm()
              onOpenChange(false)
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending || !canSubmit}
          >
            {createMutation.isPending ? "Cr\u00e9ation..." : "Cr\u00e9er"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function UpdateEventStatusDialog({
  event,
  open,
  onOpenChange,
  onDelete,
}: {
  event: AdminEvent
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete?: () => void
}) {
  const [status, setStatus] = useState(event.status)
  const updateMutation = useAdminUpdateEventStatus()

  const handleSubmit = () => {
    updateMutation.mutate(
      { eventId: event.id, status },
      {
        onSuccess: () => onOpenChange(false),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le statut</DialogTitle>
          <DialogDescription>
            Changer le statut de &laquo; {event.name} &raquo;
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Nouveau statut</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as AdminEvent["status"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="presale">Pr&eacute;vente</SelectItem>
                <SelectItem value="on_sale">En vente</SelectItem>
                <SelectItem value="completed">Termin&eacute;</SelectItem>
                <SelectItem value="full">Complet</SelectItem>
                <SelectItem value="cancelled">Annul&eacute;</SelectItem>
                <SelectItem value="archived">Archiv&eacute;</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="flex items-center justify-between sm:justify-between">
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                onOpenChange(false)
                onDelete()
              }}
            >
              Supprimer
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={updateMutation.isPending || status === event.status}
            >
              {updateMutation.isPending ? "Mise \u00e0 jour..." : "Mettre \u00e0 jour"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function DeleteEventDialog({
  event,
  open,
  onOpenChange,
}: {
  event: AdminEvent
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const deleteMutation = useAdminDeleteEvent()

  const handleSubmit = () => {
    deleteMutation.mutate(
      { eventId: event.id },
      {
        onSuccess: () => onOpenChange(false),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer l&apos;&eacute;v&eacute;nement</DialogTitle>
          <DialogDescription>
            Supprimer d&eacute;finitivement &laquo; {event.name} &raquo; ?
            Cette action est irr&eacute;versible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
