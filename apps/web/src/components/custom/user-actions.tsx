"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useBanUser,
  useUnbanUser,
  useSetRole,
  useSetUserPassword,
} from "@/hooks/use-admin-mutations";
import type { User } from "@/types/admin";

// Set Role Dialog
export function SetRoleDialog({
  user,
  open,
  onOpenChange,
}: {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [role, setRole] = useState(user.role);
  const setRoleMutation = useSetRole();

  const handleSubmit = () => {
    setRoleMutation.mutate({ userId: user.id, role }, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Changer le rôle</DialogTitle>
          <DialogDescription>Modifier le rôle de {user.name}</DialogDescription>
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
          <Button onClick={handleSubmit} disabled={setRoleMutation.isPending || role === user.role}>
            {setRoleMutation.isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Ban User Dialog
export function BanUserDialog({
  user,
  open,
  onOpenChange,
}: {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [banReason, setBanReason] = useState("");
  const banMutation = useBanUser();

  const handleSubmit = () => {
    banMutation.mutate(
      { userId: user.id, banReason: banReason || undefined },
      {
        onSuccess: () => {
          setBanReason("");
          onOpenChange(false);
        },
      },
    );
  };

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
          <Button variant="destructive" onClick={handleSubmit} disabled={banMutation.isPending}>
            {banMutation.isPending ? "Bannissement..." : "Bannir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Set Password Dialog
function generatePassword(length = 16) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join("");
}

export function SetPasswordDialog({
  user,
  open,
  onOpenChange,
}: {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const setPasswordMutation = useSetUserPassword();

  const handleGenerate = () => {
    const generated = generatePassword();
    setPassword(generated);
    setCopied(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = () => {
    setPasswordMutation.mutate(
      { userId: user.id, newPassword: password },
      {
        onSuccess: () => {
          onOpenChange(false);
          setPassword("");
          setCopied(false);
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          setPassword("");
          setCopied(false);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Définir le mot de passe</DialogTitle>
          <DialogDescription>
            Définir un mot de passe pour {user.name} ({user.email})
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="flex gap-2">
              <Input
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setCopied(false);
                }}
                placeholder="Entrez ou générez un mot de passe"
              />
              <Button type="button" variant="outline" size="sm" onClick={handleGenerate}>
                Générer
              </Button>
            </div>
          </div>
          {password && (
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-muted px-3 py-2 text-sm font-mono break-all">
                {password}
              </code>
              <Button type="button" variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? "Copié !" : "Copier"}
              </Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={setPasswordMutation.isPending || !password || password.length < 8}
          >
            {setPasswordMutation.isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Unban User Dialog
export function UnbanUserDialog({
  user,
  open,
  onOpenChange,
}: {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const unbanMutation = useUnbanUser();

  const handleSubmit = () => {
    unbanMutation.mutate({ userId: user.id }, { onSuccess: () => onOpenChange(false) });
  };

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
  );
}
