"use client"

import { useMemo, useState } from "react"
import { AlertTriangle, Download, FileText, Mail } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BreakdownView, describeMissingField } from "@/components/custom/tarif-grid/breakdown-view"
import { formatCents } from "@/components/custom/tarif-grid/describe-rule"
import { useMemberCotisations } from "@/hooks/use-member-cotisation-queries"
import {
  useDownloadCotisationReceipt,
  useMarkCotisationPaid,
  useSendCotisationReminder,
  useWaiveCotisation,
} from "@/hooks/use-member-cotisation-mutations"
import { useTarifGrids } from "@/hooks/use-tarif-grid-queries"
import { useClubAdminContext } from "@/lib/club-admin-context"
import type { MemberCotisation, MemberCotisationStatus } from "@/types/member-cotisation"

const STATUS_LABELS: Record<MemberCotisationStatus, string> = {
  not_generated: "Non émise",
  pending: "En attente",
  paid: "Payée",
  waived: "Exonérée",
}

const STATUS_STYLES: Record<MemberCotisationStatus, string> = {
  not_generated: "bg-muted text-muted-foreground hover:bg-muted",
  pending: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  paid: "bg-green-100 text-green-800 hover:bg-green-100",
  waived: "",
}

function errorMessage(error: unknown): string | null {
  return error instanceof Error ? error.message : null
}

export function MemberCotisationTabContent() {
  const { organizationId } = useClubAdminContext()
  const { data: gridsData } = useTarifGrids(organizationId)

  const seasons = useMemo(() => {
    const set = new Set((gridsData?.grids ?? []).map((g) => g.seasonLabel))
    return [...set].sort().reverse()
  }, [gridsData])

  const [selectedSeason, setSelectedSeason] = useState<string | undefined>(undefined)
  const effectiveSeason = selectedSeason ?? seasons[0]

  const { data, isLoading } = useMemberCotisations(organizationId, effectiveSeason)

  const markPaid = useMarkCotisationPaid()
  const waive = useWaiveCotisation()
  const sendReminder = useSendCotisationReminder()
  const downloadReceipt = useDownloadCotisationReceipt()

  const [detailMember, setDetailMember] = useState<MemberCotisation | null>(null)
  const [paidTarget, setPaidTarget] = useState<MemberCotisation | null>(null)
  const [paidMethod, setPaidMethod] = useState("")
  const [waiveTarget, setWaiveTarget] = useState<MemberCotisation | null>(null)
  const [waiveNotes, setWaiveNotes] = useState("")

  const actionError =
    errorMessage(markPaid.error) ??
    errorMessage(waive.error) ??
    errorMessage(sendReminder.error) ??
    errorMessage(downloadReceipt.error)

  if (!effectiveSeason) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Aucune grille tarifaire configurée. Créez-en une dans l&apos;onglet Grille tarifaire pour calculer la
          cotisation de chaque adhérent.
        </CardContent>
      </Card>
    )
  }

  const members = data?.members ?? []
  const everyoneIncomplete = members.length > 0 && members.every((m) => m.breakdown.status === "incomplete")

  function confirmPaid() {
    if (!paidTarget) return
    markPaid.mutate({
      organizationId,
      userId: paidTarget.userId,
      seasonLabel: effectiveSeason!,
      paidMethod: paidMethod.trim() || undefined,
    })
    setPaidTarget(null)
    setPaidMethod("")
  }

  function confirmWaive() {
    if (!waiveTarget) return
    waive.mutate({
      organizationId,
      userId: waiveTarget.userId,
      seasonLabel: effectiveSeason!,
      notes: waiveNotes.trim() || undefined,
    })
    setWaiveTarget(null)
    setWaiveNotes("")
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Prix calculé automatiquement pour chaque adhérent d&apos;après la grille tarifaire active.
        </p>
        <Select value={effectiveSeason} onValueChange={setSelectedSeason}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {seasons.map((season) => (
              <SelectItem key={season} value={season}>
                {season}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {actionError ? (
        <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>{actionError}</div>
        </div>
      ) : null}

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : data?.gridId === null ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Aucune grille tarifaire active pour cette saison. Configurez-en une dans l&apos;onglet Grille
            tarifaire.
          </CardContent>
        </Card>
      ) : (
        <>
          {everyoneIncomplete ? (
            <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                Aucun prix n&apos;a pu être calculé : une règle de la grille exige une donnée absente de tous les
                profils adhérents. Ouvrez « Détail » pour voir laquelle, puis complétez les fiches membres.
              </div>
            </div>
          ) : null}

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Adhérent</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                        Aucun adhérent dans ce club.
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((m) => {
                      const incomplete = m.breakdown.status === "incomplete"
                      return (
                        <TableRow key={m.userId}>
                          <TableCell>
                            <div className="font-medium">{m.name}</div>
                            <div className="text-xs text-muted-foreground">{m.email}</div>
                          </TableCell>
                          <TableCell>
                            {incomplete && m.amountCents === null ? (
                              <div className="space-y-1">
                                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                                  Données manquantes
                                </Badge>
                                {m.breakdown.status === "incomplete" ? (
                                  <p className="text-xs text-muted-foreground">
                                    {m.breakdown.missingFields.map(describeMissingField).join(", ")}
                                  </p>
                                ) : null}
                              </div>
                            ) : m.amountCents !== null ? (
                              <span className="font-medium tabular-nums">{formatCents(m.amountCents)}</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={m.status === "waived" ? "secondary" : "default"}
                              className={STATUS_STYLES[m.status]}
                            >
                              {STATUS_LABELS[m.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => setDetailMember(m)}>
                                <FileText className="mr-1.5 h-3.5 w-3.5" />
                                Détail
                              </Button>
                              {m.status === "not_generated" || m.status === "pending" ? (
                                <>
                                  <Button size="sm" disabled={markPaid.isPending} onClick={() => setPaidTarget(m)}>
                                    Marquer payé
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={waive.isPending}
                                    onClick={() => setWaiveTarget(m)}
                                  >
                                    Exonérer
                                  </Button>
                                </>
                              ) : null}
                              {m.status === "pending" ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={sendReminder.isPending}
                                  onClick={() =>
                                    sendReminder.mutate({
                                      organizationId,
                                      userId: m.userId,
                                      seasonLabel: effectiveSeason,
                                    })
                                  }
                                >
                                  <Mail className="mr-1.5 h-3.5 w-3.5" />
                                  Relancer
                                </Button>
                              ) : null}
                              {m.status === "paid" ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={downloadReceipt.isPending}
                                  onClick={() =>
                                    downloadReceipt.mutate({
                                      organizationId,
                                      userId: m.userId,
                                      seasonLabel: effectiveSeason,
                                    })
                                  }
                                >
                                  <Download className="mr-1.5 h-3.5 w-3.5" />
                                  Reçu
                                </Button>
                              ) : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      <Sheet open={!!detailMember} onOpenChange={(open) => !open && setDetailMember(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{detailMember?.name}</SheetTitle>
            <SheetDescription>{detailMember?.email}</SheetDescription>
          </SheetHeader>
          <div className="mt-4 px-4">
            {detailMember ? <BreakdownView breakdown={detailMember.breakdown} /> : null}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={!!paidTarget} onOpenChange={(open) => !open && setPaidTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marquer comme payée</DialogTitle>
            <DialogDescription>
              Cotisation de {paidTarget?.name}
              {paidTarget?.amountCents != null ? ` — ${formatCents(paidTarget.amountCents)}` : ""}. Le montant est
              figé à cette étape.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="cotisation-paid-method">Moyen de paiement (optionnel)</Label>
            <Input
              id="cotisation-paid-method"
              placeholder="Ex : chèque, espèces, virement"
              value={paidMethod}
              onChange={(e) => setPaidMethod(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaidTarget(null)}>
              Annuler
            </Button>
            <Button onClick={confirmPaid}>Confirmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!waiveTarget} onOpenChange={(open) => !open && setWaiveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exonérer cette cotisation ?</AlertDialogTitle>
            <AlertDialogDescription>
              {waiveTarget?.name} ne sera pas facturé(e) pour la saison {effectiveSeason}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="cotisation-waive-notes">Motif (optionnel)</Label>
            <Input
              id="cotisation-waive-notes"
              value={waiveNotes}
              onChange={(e) => setWaiveNotes(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmWaive}>Exonérer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
