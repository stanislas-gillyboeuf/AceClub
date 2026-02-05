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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useBanUser, useUnbanUser, useSetRole } from "@/hooks/use-admin-mutations"
import type { User } from "@/types/admin"

// Set Role Dialog
export function SetRoleDialog({
  user,
  open,
  onOpenChange,
}: {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [role, setRole] = useState(user.role)
  const setRoleMutation = useSetRole()

  const handleSubmit = () => {
    setRoleMutation.mutate(
      { userId: user.id, role },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Changer le rôle</DialogTitle>
          <DialogDescription>
            Modifier le rôle de {user.name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="role">Rôle</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={setRoleMutation.isPending || role === user.role}
          >
            {setRoleMutation.isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Ban User Dialog
export function BanUserDialog({
  user,
  open,
  onOpenChange,
}: {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [banReason, setBanReason] = useState("")
  const banMutation = useBanUser()

  const handleSubmit = () => {
    banMutation.mutate(
      { userId: user.id, banReason: banReason || undefined },
      {
        onSuccess: () => {
          setBanReason("")
          onOpenChange(false)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bannir l&apos;utilisateur</DialogTitle>
          <DialogDescription>
            Bannir {user.name} ({user.email})
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="banReason">Raison (optionnel)</Label>
            <Input
              id="banReason"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Raison du bannissement..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={banMutation.isPending}
          >
            {banMutation.isPending ? "Bannissement..." : "Bannir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Unban User Dialog
export function UnbanUserDialog({
  user,
  open,
  onOpenChange,
}: {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const unbanMutation = useUnbanUser()

  const handleSubmit = () => {
    unbanMutation.mutate(
      { userId: user.id },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Débannir l&apos;utilisateur</DialogTitle>
          <DialogDescription>
            Débannir {user.name} ({user.email}) ?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={unbanMutation.isPending}>
            {unbanMutation.isPending ? "Débannissement..." : "Débannir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
