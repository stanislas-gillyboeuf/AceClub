"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Swords, Dumbbell, Check, X, ChevronLeft, Building2, CalendarPlus, Loader2 } from "lucide-react";
import { useSearchUsers, useMe } from "@/hooks/use-user-queries";
import { useMyOrganizations } from "@/hooks/use-org-queries";
import { useCreateMatch } from "@/hooks/use-match-mutations";
import type { SearchUser } from "@/types/user";

type MatchType = "match" | "training";

type Step = "activityType" | "opponent" | "venue" | "dateTime";

const STEPS: Step[] = ["activityType", "opponent", "venue", "dateTime"];

const STEP_TITLES: Record<Step, string> = {
  activityType: "Type d'activité",
  opponent: "Adversaire",
  venue: "Lieu",
  dateTime: "Quand ?",
};

interface TimeSlot {
  hour: number;
  minute: number;
  label: string;
}

const ALL_TIME_SLOTS: TimeSlot[] = (() => {
  const slots: TimeSlot[] = [];
  for (let h = 7; h <= 22; h++) {
    slots.push({ hour: h, minute: 0, label: `${String(h).padStart(2, "0")}:00` });
    if (h < 22) {
      slots.push({ hour: h, minute: 30, label: `${String(h).padStart(2, "0")}:30` });
    }
  }
  return slots;
})();

export default function NewMatchPage() {
  const router = useRouter();
  const createMatch = useCreateMatch();
  const { data: me } = useMe();

  const [currentStep, setCurrentStep] = useState<Step>("activityType");
  const [matchType, setMatchType] = useState<MatchType | null>(null);
  const [opponent, setOpponent] = useState<SearchUser | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [matchDate, setMatchDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  });
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: searchData } = useSearchUsers(searchQuery);
  const { data: organizations } = useMyOrganizations();
  const searchResults = searchData?.users ?? [];
  const orgs = organizations ?? [];

  const stepIndex = STEPS.indexOf(currentStep);

  const selectedVenue = orgs.find((o) => o.id === selectedVenueId) ?? null;

  const availableSlots = useMemo(() => {
    const now = new Date();
    const minimumDate = new Date(now.getTime() + 60 * 60 * 1000); // +1h
    const today = now.toISOString().split("T")[0];
    const isToday = matchDate === today;

    return ALL_TIME_SLOTS.filter((slot) => {
      if (!isToday) return true;
      const slotDate = new Date(`${matchDate}T${String(slot.hour).padStart(2, "0")}:${String(slot.minute).padStart(2, "0")}:00`);
      return slotDate >= minimumDate;
    });
  }, [matchDate]);

  const canContinue = (() => {
    switch (currentStep) {
      case "activityType":
        return matchType !== null;
      case "opponent":
        return opponent !== null;
      case "venue":
        return true;
      case "dateTime":
        return selectedSlot !== null;
    }
  })();

  function goBack() {
    const idx = STEPS.indexOf(currentStep);
    if (idx > 0) setCurrentStep(STEPS[idx - 1]);
  }

  function goNext() {
    const idx = STEPS.indexOf(currentStep);
    if (idx < STEPS.length - 1) setCurrentStep(STEPS[idx + 1]);
  }

  async function handleCreate() {
    if (!opponent || !selectedSlot || !me) return;
    setErrorMessage(null);

    const scheduledAt = new Date(
      `${matchDate}T${String(selectedSlot.hour).padStart(2, "0")}:${String(selectedSlot.minute).padStart(2, "0")}:00`,
    ).toISOString();

    try {
      await createMatch.mutateAsync({
        createdBy: me.id,
        status: "scheduled",
        type: matchType ?? "match",
        createdAt: new Date().toISOString(),
        scheduledAt,
        participants: [
          { userId: me.id, side: "home" },
          { userId: opponent.id, side: "away" },
        ],
      });

      router.push("/app/matches");
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "Une erreur est survenue");
    }
  }

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        {currentStep !== "activityType" && (
          <button type="button" onClick={goBack} className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="size-5" />
          </button>
        )}
        <h1 className="flex-1 text-center text-sm font-semibold">{STEP_TITLES[currentStep]}</h1>
        <button type="button" onClick={() => router.back()} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="size-5" />
        </button>
      </div>

      {/* Progress indicator */}
      <div className="flex gap-2 px-5 pt-4">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i <= stepIndex ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
        {currentStep === "activityType" && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold">Quel type de rencontre ?</h2>
            <div className="grid grid-cols-2 gap-4">
              <ActivityTile
                type="match"
                label="Match"
                icon={<Swords className="size-8" />}
                selected={matchType === "match"}
                onSelect={() => setMatchType("match")}
              />
              <ActivityTile
                type="training"
                label="Entraînement"
                icon={<Dumbbell className="size-8" />}
                selected={matchType === "training"}
                onSelect={() => setMatchType("training")}
              />
            </div>
          </div>
        )}

        {currentStep === "opponent" && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold">Contre qui ?</h2>

            {opponent ? (
              <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
                <Avatar className="size-10">
                  <AvatarImage src={opponent.image ?? undefined} />
                  <AvatarFallback className="text-sm">{opponent.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{opponent.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{opponent.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpponent(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <Command className="rounded-xl border">
                <CommandInput
                  placeholder="Rechercher un adversaire..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  <CommandEmpty>Aucun joueur trouvé.</CommandEmpty>
                  <CommandGroup>
                    {searchResults.map((user) => (
                      <CommandItem
                        key={user.id}
                        onSelect={() => {
                          setOpponent(user);
                          setSearchQuery("");
                        }}
                      >
                        <Avatar className="size-8 mr-2">
                          <AvatarImage src={user.image ?? undefined} />
                          <AvatarFallback className="text-[10px]">{user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            )}
          </div>
        )}

        {currentStep === "venue" && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold">Où jouer ?</h2>

            {orgs.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <Building2 className="size-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Aucun club trouvé</p>
                <p className="text-xs text-muted-foreground/70">Le lieu sera déterminé automatiquement</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orgs.map((org) => (
                  <VenueTile
                    key={org.id}
                    name={org.name}
                    logo={org.logo}
                    selected={selectedVenueId === org.id}
                    onSelect={() => setSelectedVenueId(selectedVenueId === org.id ? null : org.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {currentStep === "dateTime" && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold">Quand jouer ?</h2>

            {/* Date picker */}
            <div className="rounded-xl border bg-card p-3">
              <label className="text-sm font-medium text-muted-foreground">Date</label>
              <input
                type="date"
                value={matchDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => {
                  setMatchDate(e.target.value);
                  if (selectedSlot && !availableSlots.some((s) => s.hour === selectedSlot.hour && s.minute === selectedSlot.minute)) {
                    setSelectedSlot(null);
                  }
                }}
                className="mt-1 w-full rounded-lg border-0 bg-transparent text-sm font-medium focus:outline-none"
              />
            </div>

            {/* Time slot grid */}
            <div className="space-y-2.5">
              <p className="text-sm font-medium text-muted-foreground">Heure</p>

              {availableSlots.length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground/70">
                  Aucun créneau disponible pour cette date
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedSlot?.hour === slot.hour && selectedSlot?.minute === slot.minute;
                    return (
                      <button
                        key={slot.label}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`rounded-lg border py-2.5 text-sm font-medium transition-all ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-foreground hover:border-primary/40"
                        }`}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom buttons (sticky) */}
      <div className="border-t bg-background px-5 pb-6 pt-3 space-y-3">
        {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}

        {currentStep === "dateTime" ? (
          <Button onClick={handleCreate} disabled={!canContinue || createMatch.isPending} className="w-full gap-2">
            {createMatch.isPending ? <Loader2 className="size-4 animate-spin" /> : <CalendarPlus className="size-4" />}
            Planifier le match
          </Button>
        ) : (
          <Button onClick={goNext} disabled={!canContinue} className="w-full">
            Continuer
          </Button>
        )}

        {currentStep === "activityType" ? (
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Annuler
          </button>
        ) : (
          <button
            type="button"
            onClick={goBack}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Retour
          </button>
        )}
      </div>

      {/* Loading overlay */}
      {createMatch.isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="rounded-xl bg-background p-6 shadow-lg">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        </div>
      )}
    </div>
  );
}

// --- Activity Tile ---

function ActivityTile({
  label,
  icon,
  selected,
  onSelect,
}: {
  type: MatchType;
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex flex-col items-center gap-4 rounded-2xl border-2 bg-card py-7 transition-all ${
        selected
          ? "border-primary shadow-[0_3px_12px_rgba(33,135,77,0.12)] scale-[1.02]"
          : "border-border hover:border-primary/30"
      }`}
    >
      {/* Icon circle */}
      <div
        className={`flex size-20 items-center justify-center rounded-full transition-colors ${
          selected ? "bg-primary/15 text-primary" : "bg-primary/5 text-muted-foreground"
        }`}
      >
        {icon}
      </div>

      {/* Label */}
      <span className={`text-base font-semibold transition-colors ${selected ? "text-primary" : "text-foreground"}`}>
        {label}
      </span>

      {/* Checkmark */}
      {selected && (
        <div className="absolute top-2.5 right-2.5 flex size-6 items-center justify-center rounded-full bg-primary">
          <Check className="size-3.5 text-primary-foreground" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

// --- Venue Tile ---

function VenueTile({
  name,
  logo,
  selected,
  onSelect,
}: {
  name: string;
  logo: string | null;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3.5 rounded-xl border p-3.5 text-left transition-all ${
        selected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30"
      }`}
    >
      {/* Logo */}
      {logo ? (
        <img src={logo} alt={name} className="size-11 rounded-lg object-cover" />
      ) : (
        <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10">
          <Building2 className="size-4 text-primary" />
        </div>
      )}

      {/* Name */}
      <span className="flex-1 truncate text-sm font-medium">{name}</span>

      {/* Checkmark */}
      {selected && <Check className="size-5 text-primary" />}
    </button>
  );
}
