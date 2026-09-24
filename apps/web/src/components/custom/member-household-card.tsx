"use client"

import { useMemo, useState } from "react"
import { Trash2, UserMinus } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  useCreateHousehold,
  useDeleteHousehold,
  useSetMemberHousehold,
  useUpdateHousehold,
} from "@/hooks/use-household-mutations"
import { useHouseholdDetail, useHouseholds } from "@/hooks/use-household-queries"
import { useMemberCotisations } from "@/hooks/use-member-cotisation-queries"
import { useTarifGrids } from "@/hooks/use-tarif-grid-queries"
import type { HouseholdRankSource } from "@/types/household"

const NO_PAYER = "none"

const RANK_SOURCE_LABELS: Record<HouseholdRankSource, string> = {
  computed: "calculé",
  frozen: "figé à l'émission",
  override: "forcé",
}

function ordinal(rank: number) {
  return rank === 1 ? "1er" : `${rank}e`
}

interface MemberHouseholdCardProps {
  organizationId: string
  userId: string
  householdId: string | null
  isFullAdmin: boolean
}

export function MemberHouseholdCard({ organizationId, userId, householdId, isFullAdmin }: MemberHouseholdCardProps) {
  const { data: householdsData } = useHouseholds(organizationId)
  const { data: detail } = useHouseholdDetail(organizationId, householdId)
  const createHousehold = useCreateHousehold()
  const updateHousehold = useUpdateHousehold()
  const deleteHousehold = useDeleteHousehold()
  const setMemberHousehold = useSetMemberHousehold()

  const [newName, setNewName] = useState("")
  const [newContactEmail, setNewContactEmail] = useState("")
  const [nameDraft, setNameDraft] = useState<string | null>(null)
  const [emailDraft, setEmailDraft] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // The computed rank is read from the same list the Cotisations tab shows, so the two never disagree.
  const { data: gridsData } = useTarifGrids(organizationId)
  const latestSeason = useMemo(() => {
    const seasons = [...new Set((gridsData?.grids ?? []).map((g) => g.seasonLabel))].sort().reverse()
    return seasons[0]
  }, [gridsData])
  const { data: cotisationsData } = useMemberCotisations(organizationId, latestSeason)
  const myCotisation = cotisationsData?.members.find((m) => m.userId === userId)

  const households = householdsData?.households ?? []
  const household = detail?.household ?? null

  const reportError = (err: unknown) => setError(err instanceof Error ? err.message : "Une erreur est survenue")
  const run = (action: () => Promise<unknown>) => {
    setError(null)
    action().catch(reportError)
  }

  const attach = (id: string | null) =>
    run(() => setMemberHousehold.mutateAsync({ organizationId, userId, householdId: id }))

  const handleCreate = () =>
    run(async () => {
      await createHousehold.mutateAsync({
        organizationId,
        name: newName.trim(),
        contactEmail: newContactEmail.trim() || null,
        memberUserIds: [userId],
      })
      setNewName("")
      setNewContactEmail("")
    })

  const saveDetails = () => {
    if (!household) return
    const name = (nameDraft ?? household.name).trim()
    const email = (emailDraft ?? household.contactEmail ?? "").trim()
    run(async () => {
      await updateHousehold.mutateAsync({
        organizationId,
        householdId: household.id,
        name,
        contactEmail: email || null,
      })
      setNameDraft(null)
      setEmailDraft(null)
    })
  }

  const detailsChanged =
    !!household &&
    ((nameDraft !== null && nameDraft.trim() !== household.name) ||
      (emailDraft !== null && emailDraft.trim() !== (household.contactEmail ?? "")))

  const busy =
    createHousehold.isPending ||
    updateHousehold.isPending ||
    deleteHousehold.isPending ||
    setMemberHousehold.isPending

  return (
    <Card>
      <CardHeader>
        <CardTitle>Foyer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {myCotisation && myCotisation.householdRank !== null ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Rang dans le foyer :</span>
            <span className="font-medium">{ordinal(myCotisation.householdRank)}</span>
            {myCotisation.householdRankSource ? (
              <Badge variant="secondary">{RANK_SOURCE_LABELS[myCotisation.householdRankSource]}</Badge>
            ) : null}
          </div>
        ) : null}

        {!householdId || !household ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ce membre n&apos;est dans aucun foyer : il est compté seul (rang 1, aucune remise famille).
            </p>
            {isFullAdmin ? (
              <>
                {households.length > 0 ? (
                  <div className="space-y-1.5">
                    <Label>Rejoindre un foyer existant</Label>
                    <Select value="" onValueChange={(id) => attach(id)} disabled={busy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un foyer" />
                      </SelectTrigger>
                      <SelectContent>
                        {households.map((h) => (
                          <SelectItem key={h.id} value={h.id}>
                            {h.name} ({h.memberCount})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
                <div className="space-y-2 rounded-md border p-3">
                  <Label>Créer un foyer avec ce membre</Label>
                  <Input placeholder="Nom du foyer (ex : Famille Martin)" value={newName} onChange={(e) => setNewName(e.target.value)} />
                  <Input
                    type="email"
                    placeholder="Email de contact (optionnel)"
                    value={newContactEmail}
                    onChange={(e) => setNewContactEmail(e.target.value)}
                  />
                  <Button size="sm" onClick={handleCreate} disabled={busy || newName.trim().length === 0}>
                    {createHousehold.isPending ? "Création..." : "Créer le foyer"}
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="household-name">Nom du foyer</Label>
              <Input
                id="household-name"
                value={nameDraft ?? household.name}
                onChange={(e) => setNameDraft(e.target.value)}
                disabled={!isFullAdmin}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="household-email">Email de contact</Label>
              <Input
                id="household-email"
                type="email"
                placeholder="Utilisé pour les membres sans email"
                value={emailDraft ?? household.contactEmail ?? ""}
                onChange={(e) => setEmailDraft(e.target.value)}
                disabled={!isFullAdmin}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Responsable payeur</Label>
              <Select
                value={household.payerUserId ?? NO_PAYER}
                onValueChange={(v) =>
                  run(() =>
                    updateHousehold.mutateAsync({
                      organizationId,
                      householdId: household.id,
                      payerUserId: v === NO_PAYER ? null : v,
                    }),
                  )
                }
                disabled={!isFullAdmin || busy}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_PAYER}>Aucun</SelectItem>
                  {(detail?.members ?? []).map((m) => (
                    <SelectItem key={m.userId} value={m.userId}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Membres du foyer</Label>
              <ul className="space-y-1 text-sm">
                {(detail?.members ?? []).map((m) => (
                  <li key={m.userId} className="flex items-center justify-between gap-2">
                    <span className={m.userId === userId ? "font-medium" : undefined}>{m.name}</span>
                    <span className="flex items-center gap-1.5">
                      {m.isPayer ? <Badge>Payeur</Badge> : null}
                      {m.householdRankOverride !== null ? (
                        <Badge variant="secondary">forcé : {ordinal(m.householdRankOverride)}</Badge>
                      ) : null}
                      {!m.isAdherent ? <Badge variant="outline">Non-adhérent</Badge> : null}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {isFullAdmin ? (
              <div className="flex flex-wrap gap-2">
                {detailsChanged ? (
                  <Button size="sm" onClick={saveDetails} disabled={busy}>
                    {updateHousehold.isPending ? "Enregistrement..." : "Enregistrer le foyer"}
                  </Button>
                ) : null}
                <Button size="sm" variant="outline" onClick={() => attach(null)} disabled={busy}>
                  <UserMinus className="mr-1.5 h-4 w-4" />
                  Retirer du foyer
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost" disabled={busy}>
                      <Trash2 className="mr-1.5 h-4 w-4" />
                      Supprimer le foyer
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer ce foyer ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        « {household.name} » est supprimé. Ses membres sont conservés, sans foyer : les rangs
                        seront recalculés (les rangs déjà figés à l&apos;émission restent inchangés).
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          run(() => deleteHousehold.mutateAsync({ organizationId, householdId: household.id }))
                        }
                      >
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
