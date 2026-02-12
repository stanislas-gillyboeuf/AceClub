"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRequestClub } from "@/hooks/use-org-mutations";

interface RequestClubDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequestClubDialog({ open, onOpenChange }: RequestClubDialogProps) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const requestClub = useRequestClub();
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await requestClub.mutateAsync({ name, city });
      setSuccess(true);
    } catch {
      // handled by mutation
    }
  };

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demande envoyée</DialogTitle>
            <DialogDescription>
              Nous avons bien reçu votre demande. Nous vous contacterons quand votre club sera
              ajouté.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => onOpenChange(false)}>Fermer</Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Proposer un club</DialogTitle>
          <DialogDescription>
            Votre club n&apos;est pas encore sur AceClub ? Proposez-le nous.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="club-name">Nom du club</Label>
            <Input id="club-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="club-city">Ville</Label>
            <Input id="club-city" value={city} onChange={(e) => setCity(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={requestClub.isPending}>
            Envoyer la demande
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
