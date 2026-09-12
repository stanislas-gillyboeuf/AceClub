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
import { useCreateDuesType } from "@/hooks/use-dues-mutations"
import { useMarkDuesPaid, useWaiveDues } from "@/hooks/use-dues-mutations"
import type { DuesAssignment } from "@/types/dues"

interface CreateDuesTypeDialogProps {
  organizationId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateDuesTypeDialog({
  organizationId,
  open,
  onOpenChange,
}: CreateDuesTypeDialogProps) {
  const createDuesType = useCreateDuesType()
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [dueDate, setDueDate] = useState("")

  const isValid = name.trim().length > 0 && Number(amount) > 0

  function handleSubmit() {
    createDuesType.mutate(
      {
        organizationId,
        name,
        amountCents: Math.round(Number(amount) * 100),
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          setName("")
          setAmount("")
          setDueDate("")
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle cotisation</DialogTitle>
          <DialogDescription>
            Créez un type de cotisation, puis assignez-la aux membres concernés.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="dues-name">Nom</Label>
            <Input
              id="dues-name"
              placeholder="Ex : Cotisation annuelle 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dues-amount">Montant (€)</Label>
            <Input
              id="dues-amount"
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dues-due-date">Échéance (optionnel)</Label>
            <Input
              id="dues-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || createDuesType.isPending}>
            {createDuesType.isPending ? "Création..." : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface MarkPaidDialogProps {
  assignment: DuesAssignment | null
  onOpenChange: (open: boolean) => void
}

export function MarkPaidDialog({ assignment, onOpenChange }: MarkPaidDialogProps) {
  const markPaid = useMarkDuesPaid()
  const [paidMethod, setPaidMethod] = useState("")

  function handleSubmit() {
    if (!assignment) return
    markPaid.mutate(
      { assignmentId: assignment.id, paidMethod: paidMethod || undefined },
      { onSuccess: () => { onOpenChange(false); setPaidMethod("") } },
    )
  }

  return (
    <Dialog open={!!assignment} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Marquer comme payé</DialogTitle>
          <DialogDescription>{assignment?.userName}</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="paid-method">Moyen de paiement (optionnel)</Label>
          <Input
            id="paid-method"
            placeholder="Ex : Espèces, Virement..."
            value={paidMethod}
            onChange={(e) => setPaidMethod(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={markPaid.isPending}>
            {markPaid.isPending ? "Enregistrement..." : "Confirmer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface WaiveDialogProps {
  assignment: DuesAssignment | null
  onOpenChange: (open: boolean) => void
}

export function WaiveDialog({ assignment, onOpenChange }: WaiveDialogProps) {
  const waiveDues = useWaiveDues()
  const [notes, setNotes] = useState("")

  function handleSubmit() {
    if (!assignment) return
    waiveDues.mutate(
      { assignmentId: assignment.id, notes: notes || undefined },
      { onSuccess: () => { onOpenChange(false); setNotes("") } },
    )
  }

  return (
    <Dialog open={!!assignment} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exonérer de cotisation</DialogTitle>
          <DialogDescription>{assignment?.userName}</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="waive-notes">Raison (optionnel)</Label>
          <Textarea id="waive-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={waiveDues.isPending}>
            {waiveDues.isPending ? "Enregistrement..." : "Confirmer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
