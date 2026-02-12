"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { Sport } from "@/types/user";

interface StepSportProps {
  onNext: (sport: Sport) => void;
  onBack: () => void;
  defaultValue?: Sport;
}

export function StepSport({ onNext, onBack, defaultValue }: StepSportProps) {
  const [sport, setSport] = useState<Sport | undefined>(defaultValue);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Votre sport</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={sport}
          onValueChange={(val) => setSport(val as Sport)}
          className="grid grid-cols-2 gap-4"
        >
          <div>
            <RadioGroupItem value="tennis" id="tennis" className="peer sr-only" />
            <Label
              htmlFor="tennis"
              className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <span className="text-2xl">🎾</span>
              <span className="mt-2 font-medium">Tennis</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="padel" id="padel" className="peer sr-only" />
            <Label
              htmlFor="padel"
              className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <span className="text-2xl">🏓</span>
              <span className="mt-2 font-medium">Padel</span>
            </Label>
          </div>
        </RadioGroup>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Retour
          </Button>
          <Button onClick={() => onNext(sport!)} disabled={!sport} className="flex-1">
            Suivant
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
