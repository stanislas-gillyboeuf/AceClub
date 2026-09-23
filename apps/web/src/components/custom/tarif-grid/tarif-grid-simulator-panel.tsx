"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Bookmark, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useClubTags } from "@/hooks/use-club-tag-queries"
import { useSimulateTarifGrid } from "@/hooks/use-tarif-grid-mutations"
import type { Breakdown, ClubTag, MemberPricingProfile } from "@/types/tarif-grid"
import { TarifRuleCommunePicker } from "./tarif-rule-commune-picker"
import { formatCents } from "./describe-rule"

const MISSING_FIELD_LABELS: Record<string, string> = {
  birthDate: "date de naissance",
  communeInsee: "commune de résidence",
  householdRank: "rang dans le foyer",
  lessonsPerWeek: "nombre de cours par semaine",
  licensedElsewhere: "licence ailleurs",
  tags: "statuts",
  registrationDate: "date d'inscription",
}

function describeMissingField(field: string): string {
  if (field.startsWith("ageCategory:")) return "aucune catégorie d'âge ne correspond à cet âge dans la grille"
  return MISSING_FIELD_LABELS[field] ?? field
}

interface SavedProfile {
  name: string
  profile: MemberPricingProfile
}

function storageKey(organizationId: string) {
  return `tarif-grid-simulator-profiles:${organizationId}`
}

function readSavedProfiles(organizationId: string): SavedProfile[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(storageKey(organizationId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeSavedProfiles(organizationId: string, profiles: SavedProfile[]) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(storageKey(organizationId), JSON.stringify(profiles))
  } catch {
    // best-effort only
  }
}

const HOUSEHOLD_OPTIONS = [
  { value: "1", label: "1er du foyer" },
  { value: "2", label: "2e du foyer" },
  { value: "3", label: "3e du foyer" },
  { value: "4", label: "4e et plus du foyer" },
]

interface TarifGridSimulatorPanelProps {
  organizationId: string
  gridId: string
  gridVersion: number
}

export function TarifGridSimulatorPanel({ organizationId, gridId, gridVersion }: TarifGridSimulatorPanelProps) {
  const { data: tagsData } = useClubTags(organizationId)
  const tags: ClubTag[] = tagsData?.tags ?? []
  const simulate = useSimulateTarifGrid()

  const [profile, setProfile] = useState<MemberPricingProfile>({})
  const [breakdown, setBreakdown] = useState<Breakdown | null>(null)
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([])
  const [savingName, setSavingName] = useState(false)
  const [newProfileName, setNewProfileName] = useState("")

  useEffect(() => {
    setSavedProfiles(readSavedProfiles(organizationId))
  }, [organizationId])

  useEffect(() => {
    const timeout = setTimeout(() => {
      simulate.mutate(
        { gridId, profile },
        { onSuccess: (data) => setBreakdown(data), onError: () => setBreakdown(null) },
      )
    }, 300)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridId, gridVersion, JSON.stringify(profile)])

  function update<K extends keyof MemberPricingProfile>(field: K, value: MemberPricingProfile[K]) {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  function saveProfile() {
    if (!newProfileName.trim()) return
    const next = [...savedProfiles, { name: newProfileName.trim(), profile }]
    setSavedProfiles(next)
    writeSavedProfiles(organizationId, next)
    setNewProfileName("")
    setSavingName(false)
  }

  function loadProfile(saved: SavedProfile) {
    setProfile(saved.profile)
  }

  function removeProfile(name: string) {
    const next = savedProfiles.filter((p) => p.name !== name)
    setSavedProfiles(next)
    writeSavedProfiles(organizationId, next)
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <h2 className="text-lg font-semibold">Simulateur</h2>
        <p className="text-sm text-muted-foreground">Testez un profil fictif, le calcul se met à jour en direct.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="sim-birth-date">Date de naissance</Label>
          <Input
            id="sim-birth-date"
            type="date"
            value={profile.birthDate ?? ""}
            onChange={(e) => update("birthDate", e.target.value || undefined)}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Commune de résidence</Label>
          <TarifRuleCommunePicker
            selectedCodes={profile.communeInsee ? [profile.communeInsee] : []}
            onChange={(codes) => update("communeInsee", codes[0])}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Rang dans le foyer</Label>
          <Select
            value={profile.householdRank ? String(profile.householdRank) : ""}
            onValueChange={(v) => update("householdRank", Number(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Non renseigné" />
            </SelectTrigger>
            <SelectContent>
              {HOUSEHOLD_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sim-lessons">Nombre de cours / semaine</Label>
          <Input
            id="sim-lessons"
            type="number"
            min={0}
            value={profile.lessonsPerWeek ?? ""}
            onChange={(e) => update("lessonsPerWeek", e.target.value === "" ? undefined : Number(e.target.value))}
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={!!profile.licensedElsewhere}
            onCheckedChange={(v) => update("licensedElsewhere", !!v)}
          />
          Licencié dans un autre club
        </label>

        <div className="space-y-1.5">
          <Label>Statuts</Label>
          <div className="flex flex-wrap gap-1.5">
            {tags.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun statut créé pour ce club.</p>
            ) : (
              tags.map((tag) => {
                const checked = (profile.tags ?? []).includes(tag.id)
                return (
                  <label
                    key={tag.id}
                    className="flex items-center gap-1.5 rounded-md border px-2 py-1 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) =>
                        update(
                          "tags",
                          v ? [...(profile.tags ?? []), tag.id] : (profile.tags ?? []).filter((id) => id !== tag.id),
                        )
                      }
                    />
                    {tag.name}
                  </label>
                )
              })
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Statut d&apos;adhésion</Label>
          <Select
            value={profile.isNew === undefined ? "" : profile.isNew ? "new" : "renewal"}
            onValueChange={(v) => update("isNew", v === "new")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Non renseigné" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Nouvel adhérent</SelectItem>
              <SelectItem value="renewal">Renouvellement</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border-t pt-4">
          {breakdown?.status === "incomplete" ? (
            <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                Données manquantes pour calculer ce tarif :{" "}
                {breakdown.missingFields.map(describeMissingField).join(", ")}.
              </div>
            </div>
          ) : breakdown?.status === "complete" ? (
            <div className="space-y-3">
              <div className="space-y-1">
                {breakdown.lines.map((line) => (
                  <div key={line.key} className="flex justify-between text-sm">
                    <span>{line.label}</span>
                    <span className="font-medium tabular-nums">{formatCents(line.finalAmountCents)}</span>
                  </div>
                ))}
              </div>

              {breakdown.appliedRules.length > 0 ? (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Règles appliquées</p>
                  {breakdown.appliedRules.map((rule) => (
                    <div key={rule.ruleId} className="flex justify-between text-xs text-muted-foreground">
                      <span>{rule.ruleName}</span>
                      <span className="tabular-nums">{formatCents(rule.amountCents)}</span>
                    </div>
                  ))}
                </div>
              ) : null}

              {breakdown.skippedRules.length > 0 ? (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Règles écartées</p>
                  {breakdown.skippedRules.map((rule) => (
                    <p key={rule.ruleId} className="text-xs italic text-muted-foreground">
                      {rule.ruleName} — {rule.reason}
                    </p>
                  ))}
                </div>
              ) : null}

              {breakdown.capApplied ? (
                <Badge variant="secondary" className="text-xs">
                  Plafond de réduction appliqué
                </Badge>
              ) : null}

              <div className="flex items-center justify-between border-t pt-2">
                <span className="font-medium">Total</span>
                <span className="text-xl font-bold tabular-nums">{formatCents(breakdown.totalCents)}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Renseignez un profil pour voir le calcul.</p>
          )}
        </div>

        <div className="space-y-2 border-t pt-4">
          <p className="text-xs font-medium text-muted-foreground">Profils sauvegardés</p>
          {savedProfiles.map((saved) => (
            <div key={saved.name} className="flex items-center justify-between gap-2 text-sm">
              <button type="button" className="text-left hover:underline" onClick={() => loadProfile(saved)}>
                {saved.name}
              </button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeProfile(saved.name)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}

          {savingName ? (
            <div className="flex items-center gap-2">
              <Input
                autoFocus
                placeholder="Ex : Famille Martin"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveProfile()}
              />
              <Button size="sm" onClick={saveProfile} disabled={!newProfileName.trim()}>
                OK
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setSavingName(true)}>
              <Bookmark className="mr-1.5 h-3.5 w-3.5" />
              Enregistrer ce profil
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
