"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Papa from "papaparse"
import { ArrowLeft, Upload } from "lucide-react"
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
import { useBulkImportClubMembers } from "@/hooks/use-club-member-mutations"
import { useClubAdminContext } from "@/lib/club-admin-context"
import { mapClubMemberImportRows, type ClubMemberImportField } from "@/lib/csv-import"
import type { BulkImportRow } from "@/types/club-admin"

const TARGET_FIELD_LABELS: Record<ClubMemberImportField, string> = {
  name: "Nom",
  email: "Email (obligatoire)",
  phone: "Téléphone",
  licenseNumber: "Numéro de licence",
  licenseValidUntil: "Licence valide jusqu'au",
  dateOfBirth: "Date de naissance",
  ignore: "Ignorer cette colonne",
}

export default function ClubMembersImportPage() {
  const router = useRouter()
  const { organizationId } = useClubAdminContext()
  const bulkImport = useBulkImportClubMembers()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [fileName, setFileName] = useState("")
  const [headers, setHeaders] = useState<string[]>([])
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([])
  const [mapping, setMapping] = useState<Record<string, ClubMemberImportField>>({})
  const [result, setResult] = useState<{ created: number; updated: number; skipped: number } | null>(
    null,
  )

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setFileName(file.name)
        setHeaders(results.meta.fields ?? [])
        setRawRows(results.data)
        setStep(2)
      },
    })
  }

  const mappedRows = useMemo(() => mapClubMemberImportRows(rawRows, mapping), [rawRows, mapping])
  const validRows = mappedRows.filter((r): r is { row: BulkImportRow } => r.row !== null)
  const invalidRows = mappedRows.filter((r) => r.row === null)

  const hasEmailMapped = Object.values(mapping).includes("email")
  const hasNameMapped = Object.values(mapping).includes("name")

  async function handleConfirm() {
    const response = await bulkImport.mutateAsync({
      organizationId,
      rows: validRows.map((r) => r.row),
    })
    setResult({
      created: response.created,
      updated: response.updated,
      skipped: response.skipped.length + invalidRows.length,
    })
    setStep(3)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => router.push("/club/members")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour aux membres
      </Button>

      <h1 className="text-3xl font-bold tracking-tight">Importer des membres</h1>

      {step === 1 ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>1. Choisir le fichier CSV</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border p-10 text-center hover:bg-accent">
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm font-medium">Choisir un fichier .csv</span>
              <span className="text-xs text-muted-foreground">
                Colonnes attendues : nom, email et, en option, téléphone / licence / date de
                naissance
              </span>
              <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
            </label>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>2. Associer les colonnes de {fileName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {headers.map((header) => (
              <div key={header} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{header}</p>
                  <p className="text-xs text-muted-foreground">
                    ex : {rawRows[0]?.[header] || "—"}
                  </p>
                </div>
                <Select
                  value={mapping[header] ?? "ignore"}
                  onValueChange={(value: ClubMemberImportField) =>
                    setMapping((prev) => ({ ...prev, [header]: value }))
                  }
                >
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TARGET_FIELD_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}

            <div className="flex items-center justify-between pt-2">
              {!hasEmailMapped || !hasNameMapped ? (
                <p className="text-sm text-destructive">
                  Associez une colonne au nom et une colonne à l'email pour continuer.
                </p>
              ) : (
                <span />
              )}
              <Button disabled={!hasEmailMapped || !hasNameMapped} onClick={() => setStep(3)}>
                Continuer
              </Button>
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
            <div className="mb-4 flex gap-4 text-sm">
              <Badge>{validRows.length} ligne(s) valide(s)</Badge>
              {invalidRows.length > 0 ? (
                <Badge variant="destructive">{invalidRows.length} ligne(s) ignorée(s)</Badge>
              ) : null}
            </div>

            <div className="max-h-96 overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Licence</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappedRows.map((mappedRow, i) => (
                    <TableRow key={i}>
                      <TableCell>{mappedRow.row?.name ?? "—"}</TableCell>
                      <TableCell>{mappedRow.row?.email ?? "—"}</TableCell>
                      <TableCell>{mappedRow.row?.phone ?? "—"}</TableCell>
                      <TableCell>{mappedRow.row?.licenseNumber ?? "—"}</TableCell>
                      <TableCell>
                        {mappedRow.row ? (
                          <Badge variant="outline">OK</Badge>
                        ) : (
                          <Badge variant="destructive">{mappedRow.reason}</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

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
            <CardTitle>Import terminé</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              {result.created} membre(s) créé(s), {result.updated} déjà existant(s) mis à jour
              {result.skipped > 0 ? `, ${result.skipped} ligne(s) ignorée(s)` : ""}.
            </p>
            <Button onClick={() => router.push("/club/members")}>Voir les membres</Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
