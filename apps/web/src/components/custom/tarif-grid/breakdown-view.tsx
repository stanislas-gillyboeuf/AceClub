"use client"

import { AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Breakdown } from "@/types/tarif-grid"
import { formatCents } from "./describe-rule"

const MISSING_FIELD_LABELS: Record<string, string> = {
  birthDate: "date de naissance",
  communeInsee: "commune de résidence",
  householdRank: "rang dans le foyer",
  lessonsPerWeek: "nombre de cours par semaine",
  licensedElsewhere: "licence ailleurs",
  tags: "statuts",
  isNew: "nouvel adhérent / renouvellement",
  registrationDate: "date d'inscription",
}

export function describeMissingField(field: string): string {
  if (field.startsWith("ageCategory:")) return "aucune catégorie d'âge ne correspond à cet âge dans la grille"
  return MISSING_FIELD_LABELS[field] ?? field
}

interface BreakdownViewProps {
  breakdown: Breakdown | null
}

export function BreakdownView({ breakdown }: BreakdownViewProps) {
  if (breakdown?.status === "incomplete") {
    return (
      <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          Données manquantes pour calculer ce tarif : {breakdown.missingFields.map(describeMissingField).join(", ")}.
        </div>
      </div>
    )
  }

  if (breakdown?.status === "complete") {
    return (
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
    )
  }

  return <p className="text-sm text-muted-foreground">Renseignez un profil pour voir le calcul.</p>
}
