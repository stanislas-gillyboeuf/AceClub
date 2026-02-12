"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useSearchOrganizations } from "@/hooks/use-org-queries";
import { RequestClubDialog } from "./request-club-dialog";

interface StepClubProps {
  onNext: (orgId: string, orgName: string, pin?: string) => void;
  onBack: () => void;
  defaultValue?: string;
}

export function StepClub({ onNext, onBack, defaultValue }: StepClubProps) {
  const [query, setQuery] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<{ id: string; name: string } | null>(
    defaultValue ? { id: defaultValue, name: "" } : null,
  );
  const [pin, setPin] = useState("");
  const [showRequest, setShowRequest] = useState(false);
  const { data: orgs } = useSearchOrganizations(query);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Votre club</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!selectedOrg ? (
          <>
            <Command className="border">
              <CommandInput
                placeholder="Rechercher un club..."
                value={query}
                onValueChange={setQuery}
              />
              <CommandList>
                <CommandEmpty>
                  Aucun club trouvé.{" "}
                  <button
                    type="button"
                    onClick={() => setShowRequest(true)}
                    className="text-primary underline"
                  >
                    Proposer un club
                  </button>
                </CommandEmpty>
                <CommandGroup>
                  {orgs?.map((org) => (
                    <CommandItem
                      key={org.id}
                      onSelect={() => setSelectedOrg({ id: org.id, name: org.name })}
                    >
                      <div>
                        <p className="font-medium">{org.name}</p>
                        {org.address && (
                          <p className="text-xs text-muted-foreground">{org.address}</p>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
            <Button variant="ghost" className="w-full text-sm" onClick={() => setShowRequest(true)}>
              Mon club n&apos;est pas dans la liste
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border p-3">
              <p className="font-medium">{selectedOrg.name || "Club sélectionné"}</p>
              <button
                type="button"
                onClick={() => setSelectedOrg(null)}
                className="text-xs text-muted-foreground underline"
              >
                Changer
              </button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pin">Code PIN du club (optionnel)</Label>
              <Input
                id="pin"
                type="text"
                maxLength={4}
                placeholder="4 chiffres"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              />
              <p className="text-xs text-muted-foreground">
                Demandez le code à votre club pour rejoindre directement.
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Retour
          </Button>
          <Button
            onClick={() => onNext(selectedOrg!.id, selectedOrg!.name, pin || undefined)}
            disabled={!selectedOrg}
            className="flex-1"
          >
            Suivant
          </Button>
        </div>

        <RequestClubDialog open={showRequest} onOpenChange={setShowRequest} />
      </CardContent>
    </Card>
  );
}
