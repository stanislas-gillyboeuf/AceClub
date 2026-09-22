"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAddClubMember } from "@/hooks/use-club-member-mutations"

interface AddMemberDialogProps {
  organizationId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ClubRole = "member" | "admin" | "coach"

export function AddMemberDialog({ organizationId, open, onOpenChange }: AddMemberDialogProps) {
  const addMember = useAddClubMember()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState<ClubRole>("member")
  const [generatePassword, setGeneratePassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null)

  function reset() {
    setName("")
    setEmail("")
    setPhone("")
    setRole("member")
    setGeneratePassword(false)
    setCopied(false)
    setCreated(null)
  }

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) reset()
    onOpenChange(nextOpen)
  }

  const isValid = name.trim().length > 0 && email.trim().length > 0

  function handleSubmit() {
    if (!isValid) return
    const trimmedEmail = email.trim()
    addMember.mutate(
      { organizationId, name: name.trim(), email: trimmedEmail, phone: phone.trim() || undefined, role, generatePassword },
      {
        onSuccess: (data) => {
          if (data.generatedPassword) {
            setCreated({ email: trimmedEmail, password: data.generatedPassword })
          } else {
            handleClose(false)
          }
        },
      },
    )
  }

  function copyPassword() {
    if (!created) return
    navigator.clipboard.writeText(created.password)
    setCopied(true)
  }

  if (created) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accès créé</DialogTitle>
            <DialogDescription>
              Ce mot de passe ne s&apos;affichera plus jamais — transmets-le maintenant à{" "}
              {created.email}. Un nouveau mot de passe personnel lui sera demandé à la première
              connexion.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label>Mot de passe</Label>
            <div className="flex gap-2">
              <Input readOnly value={created.password} className="font-mono" />
              <Button variant="outline" size="icon" onClick={copyPassword}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => handleClose(false)}>Terminé</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
          <div className="space-y-1.5">
            <Label>Rôle</Label>
            <Select value={role} onValueChange={(v: ClubRole) => setRole(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Membre</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="coach">Coach</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-start gap-2">
            <Checkbox
              id="generate-password"
              checked={generatePassword}
              onCheckedChange={(checked) => setGeneratePassword(checked === true)}
            />
            <Label htmlFor="generate-password" className="font-normal">
              Générer un accès direct (email + mot de passe) pour qu&apos;il/elle puisse se
              connecter immédiatement
            </Label>
          </div>
        </div>

        {addMember.isError ? (
          <p className="text-sm text-destructive">{addMember.error.message}</p>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
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
