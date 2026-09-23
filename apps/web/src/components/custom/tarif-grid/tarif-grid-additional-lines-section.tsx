"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  useCreateAdditionalLine,
  useDeleteAdditionalLine,
  useUpdateAdditionalLine,
} from "@/hooks/use-tarif-grid-mutations"
import type { ClubTag, TarifAdditionalLine, TarifAgeCategory, TarifCondition } from "@/types/tarif-grid"
import { formatCents } from "./describe-rule"
import { TarifRuleConditionBlock } from "./tarif-rule-condition-block"

interface TarifGridAdditionalLinesSectionProps {
  gridId: string
  additionalLines: TarifAdditionalLine[]
  ageCategories: TarifAgeCategory[]
  tags: ClubTag[]
}

export function TarifGridAdditionalLinesSection({
  gridId,
  additionalLines,
  ageCategories,
  tags,
}: TarifGridAdditionalLinesSectionProps) {
  const createLine = useCreateAdditionalLine()
  const updateLine = useUpdateAdditionalLine()
  const deleteLine = useDeleteAdditionalLine()

  const [adding, setAdding] = useState(false)
  const [name, setName] = useState("")
  const [amountInput, setAmountInput] = useState("")
  const [conditions, setConditions] = useState<TarifCondition[]>([])
  const [deletingLine, setDeletingLine] = useState<TarifAdditionalLine | null>(null)

  function resetForm() {
    setName("")
    setAmountInput("")
    setConditions([])
    setAdding(false)
  }

  function submit() {
    const amountCents = Math.max(0, Math.round(Number.parseFloat(amountInput.replace(",", ".")) * 100 || 0))
    createLine.mutate(
      { gridId, name: name.trim(), amountCents, conditions },
      { onSuccess: resetForm },
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <h2 className="text-lg font-semibold">Lignes additionnelles</h2>
          <p className="text-sm text-muted-foreground">Ex : droit d&apos;entrée, badge d&apos;accès.</p>
        </div>
        {!adding ? (
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Ajouter une ligne
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {additionalLines.length === 0 && !adding ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Aucune ligne additionnelle.</p>
        ) : (
          additionalLines.map((line) => (
            <div key={line.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
              <div>
                <p className={`text-sm font-medium ${line.isActive ? "" : "text-muted-foreground line-through"}`}>
                  {line.name} — {formatCents(line.amountCents)}
                </p>
                {line.conditions.length > 0 ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">{line.conditions.length} condition(s)</p>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={line.isActive}
                  onCheckedChange={(checked) =>
                    updateLine.mutate({ gridId, additionalLineId: line.id, isActive: checked })
                  }
                />
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeletingLine(line)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}

        {adding ? (
          <div className="space-y-3 rounded-md border p-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nom</Label>
                <Input placeholder="Ex : Droit d'entrée" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Montant (€)</Label>
                <Input type="number" min={0} step="0.01" value={amountInput} onChange={(e) => setAmountInput(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Conditions (optionnel)</Label>
              <TarifRuleConditionBlock
                conditions={conditions}
                ageCategories={ageCategories}
                tags={tags}
                onChange={setConditions}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={resetForm}>
                Annuler
              </Button>
              <Button size="sm" onClick={submit} disabled={!name.trim() || createLine.isPending}>
                {createLine.isPending ? "Ajout..." : "Ajouter"}
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>

      <AlertDialog open={!!deletingLine} onOpenChange={(open) => !open && setDeletingLine(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette ligne ?</AlertDialogTitle>
            <AlertDialogDescription>Supprime « {deletingLine?.name} ». Action irréversible sur cette version.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingLine) deleteLine.mutate({ gridId, additionalLineId: deletingLine.id })
                setDeletingLine(null)
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
