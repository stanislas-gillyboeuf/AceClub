"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useTarifGridAuditLog } from "@/hooks/use-tarif-grid-queries"
import type { TarifAuditLogEntry } from "@/types/tarif-grid"

const ACTION_LABELS: Record<TarifAuditLogEntry["action"], string> = {
  created: "Grille créée",
  updated: "Grille modifiée",
  activated: "Grille activée",
  archived: "Grille archivée",
  duplicated: "Grille dupliquée",
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

interface TarifGridAuditLogProps {
  gridId: string
}

export function TarifGridAuditLog({ gridId }: TarifGridAuditLogProps) {
  const { data, isLoading } = useTarifGridAuditLog(gridId)
  const logs = data?.logs ?? []

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Historique</h2>
        <p className="text-sm text-muted-foreground">Qui a modifié cette grille, et quand.</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune activité enregistrée.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start justify-between gap-3 border-b pb-2 text-sm last:border-0 last:pb-0">
              <div>
                <p className="font-medium">
                  {ACTION_LABELS[log.action]} <span className="font-normal text-muted-foreground">par {log.actorName}</span>
                </p>
                {log.summary ? <p className="text-muted-foreground">{log.summary}</p> : null}
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{formatDate(log.createdAt)}</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
