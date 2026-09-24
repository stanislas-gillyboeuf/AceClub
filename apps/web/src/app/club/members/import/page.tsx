"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Download, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useClubTags } from "@/hooks/use-club-tag-queries"
import { useBulkImportClubMembers } from "@/hooks/use-club-member-mutations"
import { useClubAdminContext } from "@/lib/club-admin-context"
import { autoMapColumns, IMPORT_FIELD_LABELS, isMappingUsable, type ImportField } from "@/lib/import/columns"
import type { RawImportRow } from "@/lib/import/decode"
import { downloadTextFile } from "@/lib/import/download"
import { chunkByHousehold, findNewTags, mapImportRows, type MappedImportRow } from "@/lib/import/map-rows"
import { readImportFile } from "@/lib/import/read-file"
import { buildRejectsCsv, mergeApiSkips, type RejectedRow } from "@/lib/import/rejects"
import { buildTemplateCsv } from "@/lib/import/template"
import type { BulkImportRow } from "@/types/club-admin"

const MAX_BATCH_SIZE = 2000

interface ImportResult {
  created: number
  updated: number
  households: number
  rejects: RejectedRow[]
  warnings: { sourceRow: number; message: string }[]
}

type ValidRow = { row: BulkImportRow; sourceRow: number; warnings?: string[] }

export default function ClubMembersImportPage() {
  const router = useRouter()
  const { organizationId } = useClubAdminContext()
  const bulkImport = useBulkImportClubMembers()
  const { data: tagsData } = useClubTags(organizationId)

  const [step, setStep] = useState<1 | 2 | 3>(1)
  // Existing base by default: imported members must not all pay the entry fee as "new".
  const [memberKind, setMemberKind] = useState<"existing" | "new">("existing")
  const [fileName, setFileName] = useState("")
  const [fileError, setFileError] = useState<string | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [rawRows, setRawRows] = useState<RawImportRow[]>([])
  const [mapping, setMapping] = useState<Record<string, ImportField>>({})
  const [result, setResult] = useState<ImportResult | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setFileError(null)

    try {
      const table = await readImportFile(file)
      if (table.headers.length === 0 || table.rows.length === 0) {
        setFileError("Ce fichier ne contient aucune ligne à importer.")
        return
      }
      setFileName(file.name)
      setHeaders(table.headers)
      setRawRows(table.rows)
      setMapping(autoMapColumns(table.headers))
      setStep(2)
    } catch (error) {
      setFileError(error instanceof Error ? error.message : "Impossible de lire ce fichier.")
    }
  }

  const mappedRows = useMemo(() => mapImportRows(rawRows, mapping), [rawRows, mapping])
  const validRows = mappedRows.filter((r): r is MappedImportRow & { row: BulkImportRow } => r.row !== null)
  const invalidRows = mappedRows.filter((r) => r.row === null)
  const warningCount = mappedRows.filter((r) => r.warnings?.length).length
  const newTags = useMemo(
    () =>
      findNewTags(
        validRows.map((r) => r.row),
        (tagsData?.tags ?? []).map((tag) => tag.name),
      ),
    [validRows, tagsData],
  )

  const mappingUsable = isMappingUsable(mapping)

  function downloadRejects(rejects: RejectedRow[]) {
    downloadTextFile("lignes-rejetees.csv", buildRejectsCsv(headers, rawRows, rejects))
  }

  const frontRejects: RejectedRow[] = invalidRows.map((r) => ({
    sourceRow: r.sourceRow,
    reason: r.reason ?? "Ligne ignorée",
  }))

  async function handleConfirm() {
    setImportError(null)
    const items: ValidRow[] = validRows.map((r) => ({ row: r.row, sourceRow: r.sourceRow, warnings: r.warnings }))
    const batches = chunkByHousehold(items, MAX_BATCH_SIZE)

    const total: ImportResult = { created: 0, updated: 0, households: 0, rejects: [...frontRejects], warnings: [] }
    for (const batch of batches) {
      const batchSourceRows = batch.map((item) => item.sourceRow)
      try {
        const response = await bulkImport.mutateAsync({
          organizationId,
          rows: batch.map((item) => item.row),
          isNewMember: memberKind === "new",
        })
        total.created += response.created
        total.updated += response.updated
        total.households += response.households ?? 0
        total.rejects.push(...mergeApiSkips(batchSourceRows, response.skipped))
        for (const warning of response.warnings ?? []) {
          total.warnings.push({ sourceRow: batchSourceRows[warning.row] ?? warning.row, message: warning.message })
        }
      } catch (error) {
        setImportError(
          `${error instanceof Error ? error.message : "L'import a échoué"} — ${total.created + total.updated} ligne(s) déjà importée(s) avant l'erreur.`,
        )
        setResult(total)
        return
      }
    }
    setResult(total)
    setStep(3)
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => router.push("/club/members")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour aux membres
      </Button>

      <h1 className="text-3xl font-bold tracking-tight">Importer des membres</h1>

      {step === 1 ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>1. Choisir le fichier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border p-10 text-center hover:bg-accent">
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm font-medium">Choisir un fichier .csv ou .xlsx</span>
              <span className="text-xs text-muted-foreground">
                Nom et email ou date de naissance, puis en option : téléphone, commune, licence, foyer,
                statuts… Les colonnes sont reconnues automatiquement.
              </span>
              <input
                type="file"
                accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            {fileError ? <p className="text-sm text-destructive">{fileError}</p> : null}
            <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
              <span>
                Un enfant sans email ? Indiquez sa date de naissance et l&apos;email du responsable : les
                membres qui partagent le même responsable forment un foyer.
              </span>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => downloadTextFile("modele-import-membres.csv", buildTemplateCsv())}
              >
                <Download className="mr-2 h-4 w-4" />
                Télécharger le modèle
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>2. Associer les colonnes de {fileName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Les colonnes ont été associées automatiquement : corrigez-les si besoin.
            </p>
            {headers.map((header) => (
              <div key={header} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{header}</p>
                  <p className="text-xs text-muted-foreground">
                    ex : {rawRows[0]?.cells[header] || "—"}
                  </p>
                </div>
                <Select
                  value={mapping[header] ?? "ignore"}
                  onValueChange={(value: ImportField) =>
                    setMapping((prev) => ({ ...prev, [header]: value }))
                  }
                >
                  <SelectTrigger className="w-72">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(IMPORT_FIELD_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}

            <div className="flex items-center justify-between pt-2">
              {!mappingUsable ? (
                <p className="text-sm text-destructive">
                  Associez une colonne au nom (ou prénom + nom) et une colonne à l&apos;email ou à la date de
                  naissance pour continuer.
                </p>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Changer de fichier
                </Button>
                <Button disabled={!mappingUsable} onClick={() => setStep(3)}>
                  Continuer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 3 && !result ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>3. Vérifier avant import</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
              <Badge>{validRows.length} ligne(s) valide(s)</Badge>
              {invalidRows.length > 0 ? (
                <Badge variant="destructive">{invalidRows.length} ligne(s) ignorée(s)</Badge>
              ) : null}
              {warningCount > 0 ? (
                <Badge variant="secondary">{warningCount} ligne(s) avec un avertissement</Badge>
              ) : null}
              {frontRejects.length > 0 ? (
                <Button variant="outline" size="sm" onClick={() => downloadRejects(frontRejects)}>
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger les lignes rejetées
                </Button>
              ) : null}
            </div>

            {newTags.length > 0 ? (
              <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                {newTags.length} statut(s) seront créés dans le club : {newTags.join(", ")}.
              </p>
            ) : null}

            <div className="mb-4 max-w-sm space-y-1.5">
              <Label>Ces personnes sont…</Label>
              <Select value={memberKind} onValueChange={(v) => setMemberKind(v as "existing" | "new")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="existing">Des adhérents existants (déjà inscrits au club)</SelectItem>
                  <SelectItem value="new">Des nouveaux adhérents (paient le droit d&apos;entrée)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Appliqué uniquement aux personnes créées par cet import.
              </p>
            </div>

            <div className="max-h-96 overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ligne</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Naissance</TableHead>
                    <TableHead>Commune</TableHead>
                    <TableHead>Licencié ailleurs</TableHead>
                    <TableHead>Foyer</TableHead>
                    <TableHead>Statuts</TableHead>
                    <TableHead>Résultat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappedRows.map((mappedRow) => (
                    <TableRow key={mappedRow.sourceRow}>
                      <TableCell className="text-muted-foreground">{mappedRow.sourceRow}</TableCell>
                      <TableCell>{mappedRow.row?.name ?? "—"}</TableCell>
                      <TableCell>{mappedRow.row?.email ?? (mappedRow.row ? "Sans email" : "—")}</TableCell>
                      <TableCell>{mappedRow.row?.dateOfBirth ?? "—"}</TableCell>
                      <TableCell>
                        {mappedRow.row
                          ? [mappedRow.row.postalCode, mappedRow.row.city].filter(Boolean).join(" ") || "—"
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {mappedRow.row?.licensedElsewhere === undefined
                          ? "—"
                          : mappedRow.row.licensedElsewhere
                            ? "Oui"
                            : "Non"}
                      </TableCell>
                      <TableCell>{mappedRow.row?.householdKey ?? "—"}</TableCell>
                      <TableCell>{mappedRow.row?.tags?.join(", ") ?? "—"}</TableCell>
                      <TableCell>
                        {mappedRow.row ? (
                          mappedRow.warnings?.length ? (
                            <div className="space-y-1">
                              <Badge variant="outline">OK</Badge>
                              {mappedRow.warnings.map((warning) => (
                                <p key={warning} className="text-xs text-amber-700">
                                  {warning}
                                </p>
                              ))}
                            </div>
                          ) : (
                            <Badge variant="outline">OK</Badge>
                          )
                        ) : (
                          <Badge variant="destructive">{mappedRow.reason}</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {importError ? <p className="mt-4 text-sm text-destructive">{importError}</p> : null}

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                Retour
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={validRows.length === 0 || bulkImport.isPending}
              >
                {bulkImport.isPending ? "Import en cours..." : `Importer ${validRows.length} membre(s)`}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {result ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{importError ? "Import interrompu" : "Import terminé"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {importError ? <p className="text-sm text-destructive">{importError}</p> : null}
            <p className="text-sm">
              {result.created} membre(s) créé(s), {result.updated} déjà existant(s) mis à jour
              {result.households > 0 ? `, ${result.households} foyer(s)` : ""}
              {result.rejects.length > 0 ? `, ${result.rejects.length} ligne(s) rejetée(s)` : ""}.
            </p>
            {result.warnings.length > 0 ? (
              <ul className="max-h-40 list-disc space-y-1 overflow-auto pl-5 text-xs text-amber-700">
                {result.warnings.map((warning, i) => (
                  <li key={i}>
                    Ligne {warning.sourceRow} : {warning.message}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {result.rejects.length > 0 ? (
                <Button variant="outline" onClick={() => downloadRejects(result.rejects)}>
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger les lignes rejetées
                </Button>
              ) : null}
              <Button onClick={() => router.push("/club/members")}>Voir les membres</Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
