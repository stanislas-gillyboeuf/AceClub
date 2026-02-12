"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StepWelcomeProps {
  onNext: () => void;
}

export function StepWelcome({ onNext }: StepWelcomeProps) {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Bienvenue sur AceClub !</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-muted-foreground">
          Trouvez des partenaires de tennis et de padel, suivez vos matchs et progressez ensemble.
        </p>
        <p className="text-sm text-muted-foreground">
          Configurons votre profil en quelques étapes.
        </p>
        <Button onClick={onNext} className="w-full">
          C&apos;est parti
        </Button>
      </CardContent>
    </Card>
  );
}
