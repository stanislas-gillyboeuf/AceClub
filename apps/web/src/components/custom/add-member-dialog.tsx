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
import { useAddClubMember } from "@/hooks/use-club-member-mutations"

interface AddMemberDialogProps {
  organizationId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddMemberDialog({ organizationId, open, onOpenChange }: AddMemberDialogProps) {
  const addMember = useAddClubMember()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  function reset() {
    setName("")
    setEmail("")
    setPhone("")
  }

  const isValid = name.trim().length > 0 && email.trim().length > 0

  function handleSubmit() {
    if (!isValid) return
    addMember.mutate(
      { organizationId, name: name.trim(), email: email.trim(), phone: phone.trim() || undefined },
      { onSuccess: () => { onOpenChange(false); reset() } },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un membre</DialogTitle>
          <DialogDescription>
            Crée directement l&apos;adhésion — utile pour un membre qui n&apos;a pas encore
            l&apos;application.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="member-name">Nom</Label>
            <Input id="member-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="member-email">Email</Label>
            <Input
              id="member-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="member-phone">Téléphone (optionnel)</Label>
            <Input id="member-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>

        {addMember.isError ? (
          <p className="text-sm text-destructive">{addMember.error.message}</p>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || addMember.isPending}>
            {addMember.isPending ? "Ajout..." : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
