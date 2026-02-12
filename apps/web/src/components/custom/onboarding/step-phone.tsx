"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StepPhoneProps {
  onComplete: (phoneNumber: string) => void;
  onBack: () => void;
  isLoading: boolean;
  error?: string;
}

export function StepPhone({ onComplete, onBack, isLoading, error }: StepPhoneProps) {
  const [phone, setPhone] = useState("");

  const isValid = phone.replace(/\D/g, "").length >= 8;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Numéro de téléphone</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+33 6 12 34 56 78"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Pour que vos partenaires puissent vous contacter.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} disabled={isLoading} className="flex-1">
            Retour
          </Button>
          <Button
            onClick={() => onComplete(phone)}
            disabled={!isValid || isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : null}
            Terminer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
