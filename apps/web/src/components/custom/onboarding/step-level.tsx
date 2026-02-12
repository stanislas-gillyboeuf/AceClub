"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TENNIS_LEVELS, PADEL_LEVELS, type Sport } from "@/types/user";

interface StepLevelProps {
  sport: Sport;
  onNext: (level: string) => void;
  onBack: () => void;
  defaultValue?: string;
}

export function StepLevel({ sport, onNext, onBack, defaultValue }: StepLevelProps) {
  const [level, setLevel] = useState<string | undefined>(defaultValue);
  const levels = sport === "tennis" ? TENNIS_LEVELS : PADEL_LEVELS;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Votre niveau en {sport === "tennis" ? "tennis" : "padel"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-60">
          <RadioGroup value={level} onValueChange={setLevel} className="space-y-2 pr-4">
            {levels.map((l) => (
              <div key={l} className="flex items-center space-x-2">
                <RadioGroupItem value={l} id={`level-${l}`} />
                <Label htmlFor={`level-${l}`} className="cursor-pointer">
                  {l}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </ScrollArea>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Retour
          </Button>
          <Button onClick={() => onNext(level!)} disabled={!level} className="flex-1">
            Suivant
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
