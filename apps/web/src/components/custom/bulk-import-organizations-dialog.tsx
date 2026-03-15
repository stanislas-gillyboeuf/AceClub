"use client"

import { useState, useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  useBulkImportOrganizations,
  type FFTClub,
} from "@/hooks/use-bulk-import-organizations"

const PREVIEW_LIMIT = 10

export function BulkImportOrganizationsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [jsonInput, setJsonInput] = useState("")
  const { status, progress, total, errors, result, startImport, cancel, reset } =
    useBulkImportOrganizations()

  const parsed = useMemo(() => {
    if (!jsonInput.trim()) return { clubs: null, error: null }
    try {
      const data = JSON.parse(jsonInput)
      const clubs: FFTClub[] = Array.isArray(data) ? data : data?.resultat ?? data?.clubs
      if (!Array.isArray(clubs)) return { clubs: null, error: "Le JSON doit être un tableau de clubs" }
      if (clubs.length === 0) return { clubs: null, error: "Le tableau est vide" }
      const invalid = clubs.findIndex((c) => !c.nom || !c.clubId || c.lat == null || c.lng == null)
      if (invalid !== -1)
        return {
          clubs: null,
          error: `Club invalide à l'index ${invalid}: nom, clubId, lat et lng sont requis`,
        }
      return { clubs, error: null }
    } catch {
      return { clubs: null, error: "JSON invalide" }
    }
  }, [jsonInput])

  const handleClose = () => {
    if (status === "importing") return
    if (status === "complete") {
      queryClient.invalidateQueries({ queryKey: ["admin-organizations"] })
    }
    setJsonInput("")
    reset()
    onOpenChange(false)
  }

  const handleImport = () => {
    if (parsed.clubs) {
      startImport(parsed.clubs)
    }
  }

  const progressPercent =
    progress && total > 0 ? Math.round(((progress.index + 1) / total) * 100) : 0

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import FFT</DialogTitle>
          <DialogDescription>
            Importer des clubs de tennis depuis un JSON FFT
          </DialogDescription>
        </DialogHeader>

        {status === "idle" && (
          <>
            <div className="grid gap-4 py-4 flex-1 overflow-auto">
              <div className="grid gap-2">
                <Label htmlFor="json-input">JSON des clubs</Label>
                <Textarea
                  id="json-input"
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder={'[\n  { "nom": "...", "clubId": "...", "lat": 48.8, "lng": 2.3, ... }\n]'}
                  rows={8}
                  className="font-mono text-sm"
                />
                {parsed.error && (
                  <p className="text-xs text-destructive">{parsed.error}</p>
                )}
              </div>

              {parsed.clubs && (
                <div className="grid gap-2">
                  <Label>{parsed.clubs.length} clubs trouv&eacute;s</Label>
                  <div className="rounded-md border overflow-auto max-h-[200px]">
                    <table className="w-full text-sm">
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium">Nom</th>
                          <th className="px-3 py-2 text-left font-medium">Ville</th>
                          <th className="px-3 py-2 text-left font-medium">Lat</th>
                          <th className="px-3 py-2 text-left font-medium">Lng</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsed.clubs.slice(0, PREVIEW_LIMIT).map((club, i) => (
                          <tr key={i} className="border-t">
                            <td className="px-3 py-1.5 truncate max-w-[200px]">
                              {club.nom}
                            </td>
                            <td className="px-3 py-1.5">{club.ville ?? "-"}</td>
                            <td className="px-3 py-1.5 font-mono text-xs">
                              {club.lat.toFixed(4)}
                            </td>
                            <td className="px-3 py-1.5 font-mono text-xs">
                              {club.lng.toFixed(4)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {parsed.clubs.length > PREVIEW_LIMIT && (
                      <p className="px-3 py-2 text-xs text-muted-foreground border-t">
                        ... et {parsed.clubs.length - PREVIEW_LIMIT} autres clubs
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button
                onClick={handleImport}
                disabled={!parsed.clubs}
              >
                Importer {parsed.clubs?.length ?? 0} clubs
              </Button>
            </DialogFooter>
          </>
        )}

        {status === "importing" && (
          <>
            <div className="grid gap-4 py-4 flex-1 overflow-auto">
              <div className="grid gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span>
                    {progress
                      ? `${progress.index + 1} / ${total}`
                      : `0 / ${total}`}
                  </span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {progress && (
                <div className="text-sm text-muted-foreground">
                  En cours : <span className="font-medium text-foreground">{progress.nom}</span>
                  {progress.address && (
                    <span className="block text-xs mt-0.5">{progress.address}</span>
                  )}
                </div>
              )}

              <div className="flex gap-4 text-sm">
                <span className="text-green-600">
                  {progress?.created ?? 0} cr&eacute;&eacute;s
                </span>
                {(progress?.errors ?? 0) > 0 && (
                  <span className="text-destructive">
                    {progress?.errors} erreurs
                  </span>
                )}
              </div>

              {errors.length > 0 && (
                <div className="rounded-md border overflow-auto max-h-[150px]">
                  <div className="p-2 space-y-1">
                    {errors.map((err, i) => (
                      <p key={i} className="text-xs text-destructive">
                        [{err.clubId}] {err.nom} : {err.error}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={cancel}>
                Annuler l&apos;import
              </Button>
            </DialogFooter>
          </>
        )}

        {(status === "complete" || status === "error") && (
          <>
            <div className="grid gap-4 py-4 flex-1 overflow-auto">
              {result && (
                <div className="grid gap-2">
                  <p className="text-lg font-semibold">Import termin&eacute;</p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-600 font-medium">
                      {result.created} cr&eacute;&eacute;s
                    </span>
                    {result.errors > 0 && (
                      <span className="text-destructive font-medium">
                        {result.errors} erreurs
                      </span>
                    )}
                  </div>
                </div>
              )}

              {status === "error" && !result && (
                <p className="text-sm text-destructive">
                  Une erreur est survenue lors de l&apos;import
                </p>
              )}

              {errors.length > 0 && (
                <div className="grid gap-2">
                  <Label>Erreurs ({errors.length})</Label>
                  <div className="rounded-md border overflow-auto max-h-[200px]">
                    <div className="p-2 space-y-1">
                      {errors.map((err, i) => (
                        <p key={i} className="text-xs text-destructive">
                          [{err.clubId}] {err.nom} : {err.error}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>Fermer</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
