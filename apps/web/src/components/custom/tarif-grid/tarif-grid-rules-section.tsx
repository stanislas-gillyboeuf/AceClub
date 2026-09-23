"use client"

import { useState } from "react"
import { ArrowDown, ArrowUp, Copy, Plus, Trash2 } from "lucide-react"
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
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  useDeleteRule,
  useDuplicateRule,
  useReorderRules,
  useToggleRule,
} from "@/hooks/use-tarif-grid-mutations"
import type { ClubTag, TarifAdditionalLine, TarifAgeCategory, TarifGridWarning, TarifRule } from "@/types/tarif-grid"
import { describeRule } from "./describe-rule"
import { TarifGridWarnings } from "./tarif-grid-warnings"
import { TarifRuleDrawer } from "./tarif-rule-drawer"

interface TarifGridRulesSectionProps {
  gridId: string
  rules: TarifRule[]
  ageCategories: TarifAgeCategory[]
  additionalLines: TarifAdditionalLine[]
  tags: ClubTag[]
  warnings: TarifGridWarning[]
}

export function TarifGridRulesSection({
  gridId,
  rules,
  ageCategories,
  additionalLines,
  tags,
  warnings,
}: TarifGridRulesSectionProps) {
  const toggleRule = useToggleRule()
  const reorderRules = useReorderRules()
  const duplicateRule = useDuplicateRule()
  const deleteRule = useDeleteRule()

  const [editingRule, setEditingRule] = useState<TarifRule | null | "new">(null)
  const [deletingRule, setDeletingRule] = useState<TarifRule | null>(null)

  const tagNameById = new Map(tags.map((t) => [t.id, t.name]))
  const sorted = [...rules].sort((a, b) => a.sortOrder - b.sortOrder)

  function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= sorted.length) return
    const reordered = [...sorted]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    reorderRules.mutate({ gridId, orderedRuleIds: reordered.map((r) => r.id) })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <h2 className="text-lg font-semibold">Réductions & majorations</h2>
          <p className="text-sm text-muted-foreground">Chaque règle combine des conditions (ET) et un effet.</p>
        </div>
        <Button size="sm" onClick={() => setEditingRule("new")}>
          <Plus className="mr-1.5 h-4 w-4" />
          Nouvelle règle
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <TarifGridWarnings warnings={warnings.filter((w) => w.code.startsWith("rule_"))} />
        {sorted.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Aucune règle configurée.</p>
        ) : (
          sorted.map((rule, index) => (
            <div
              key={rule.id}
              className="flex items-start justify-between gap-3 rounded-md border p-3"
            >
              <div className="flex-1 cursor-pointer" onClick={() => setEditingRule(rule)}>
                <p className={`text-sm font-medium ${rule.isActive ? "" : "text-muted-foreground line-through"}`}>
                  {rule.name}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {describeRule(rule, { ageCategories, additionalLines, tagNameById })}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => move(index, -1)} disabled={index === 0}>
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => move(index, 1)}
                  disabled={index === sorted.length - 1}
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
                <Switch
                  checked={rule.isActive}
                  onCheckedChange={(checked) => toggleRule.mutate({ gridId, ruleId: rule.id, isActive: checked })}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => duplicateRule.mutate({ gridId, ruleId: rule.id })}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeletingRule(rule)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>

      <TarifRuleDrawer
        gridId={gridId}
        rule={editingRule === "new" ? null : editingRule}
        open={editingRule !== null}
        onOpenChange={(open) => !open && setEditingRule(null)}
        ageCategories={ageCategories}
        additionalLines={additionalLines}
        tags={tags}
      />

      <AlertDialog open={!!deletingRule} onOpenChange={(open) => !open && setDeletingRule(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette règle ?</AlertDialogTitle>
            <AlertDialogDescription>
              Supprime « {deletingRule?.name} ». Cette action est irréversible sur cette version de la grille.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingRule) deleteRule.mutate({ gridId, ruleId: deletingRule.id })
                setDeletingRule(null)
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
