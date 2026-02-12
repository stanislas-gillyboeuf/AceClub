"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCreateMatchIntent } from "@/hooks/use-match-mutations";
import type { Sport } from "@/types/user";

interface CreateIntentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateIntentDialog({ open, onOpenChange }: CreateIntentDialogProps) {
  const createIntent = useCreateMatchIntent();
  const [sport, setSport] = useState<Sport>("tennis");
  const [type, setType] = useState<"simple" | "double">("simple");
  const [message, setMessage] = useState("");
  const [availableAt, setAvailableAt] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get current location or use defaults
    let latitude = 48.8566;
    let longitude = 2.3522;

    if (navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 }),
        );
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      } catch {
        // Use Paris defaults
      }
    }

    const expiresAt = new Date(availableAt);
    expiresAt.setHours(expiresAt.getHours() + 4);

    await createIntent.mutateAsync({
      sport,
      type,
      message: message || undefined,
      latitude,
      longitude,
      radiusKm: 20,
      availableAt,
      expiresAt: expiresAt.toISOString(),
    });

    onOpenChange(false);
    setMessage("");
    setAvailableAt("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publier ma disponibilité</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Sport</Label>
            <RadioGroup
              value={sport}
              onValueChange={(v) => setSport(v as Sport)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tennis" id="i-tennis" />
                <Label htmlFor="i-tennis">Tennis</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="padel" id="i-padel" />
                <Label htmlFor="i-padel">Padel</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label>Format</Label>
            <RadioGroup
              value={type}
              onValueChange={(v) => setType(v as "simple" | "double")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="simple" id="i-simple" />
                <Label htmlFor="i-simple">Simple</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="double" id="i-double" />
                <Label htmlFor="i-double">Double</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="i-available">Quand ?</Label>
            <Input
              id="i-available"
              type="datetime-local"
              value={availableAt}
              onChange={(e) => setAvailableAt(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="i-message">Message (optionnel)</Label>
            <Textarea
              id="i-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ex: Cherche un partenaire de niveau intermédiaire"
              rows={2}
            />
          </div>
          <Button type="submit" className="w-full" disabled={createIntent.isPending}>
            Publier
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
