"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useCreateRule, useUpdateRule } from "@/hooks/use-tarif-grid-mutations"
import type {
  ClubTag,
  TarifAdditionalLine,
  TarifAgeCategory,
  TarifCondition,
  TarifRule,
  TarifRuleEffectType,
  TarifRuleTargetType,
} from "@/types/tarif-grid"
import { TarifRuleConditionBlock } from "./tarif-rule-condition-block"

const EFFECT_LABELS: Record<TarifRuleEffectType, string> = {
  percent_discount: "% de réduction",
  fixed_discount: "Montant fixe de réduction",
  surcharge_amount: "Majoration (montant)",
  surcharge_percent: "Majoration (%)",
  fixed_price: "Prix fixe",
}

const TARGET_LABELS: Record<TarifRuleTargetType, string> = {
  membership: "Adhésion",
  lessons: "Cours",
  license: "Licence",
  additional_line: "Une ligne additionnelle",
  total_excluding_license: "Total hors licence",
}

interface TarifRuleDrawerProps {
  gridId: string
  rule: TarifRule | null // null = create mode
  open: boolean
  onOpenChange: (open: boolean) => void
  ageCategories: TarifAgeCategory[]
  additionalLines: TarifAdditionalLine[]
  tags: ClubTag[]
}

export function TarifRuleDrawer({
  gridId,
  rule,
  open,
  onOpenChange,
  ageCategories,
  additionalLines,
  tags,
}: TarifRuleDrawerProps) {
  const createRule = useCreateRule()
  const updateRule = useUpdateRule()
  const isPending = createRule.isPending || updateRule.isPending

  const [name, setName] = useState("")
  const [conditions, setConditions] = useState<TarifCondition[]>([])
  const [effectType, setEffectType] = useState<TarifRuleEffectType>("percent_discount")
  const [effectValueInput, setEffectValueInput] = useState("")
  const [targetType, setTargetType] = useState<TarifRuleTargetType>("membership")
  const [targetAdditionalLineId, setTargetAdditionalLineId] = useState<string>("")
  const [exclusivityGroup, setExclusivityGroup] = useState("")

  useEffect(() => {
    if (!open) return
    setName(rule?.name ?? "")
    setConditions(rule?.conditions ?? [])
    setEffectType(rule?.effectType ?? "percent_discount")
    setEffectValueInput(
      rule ? (rule.effectType.includes("percent") ? String(rule.effectValue / 100) : String(rule.effectValue / 100)) : "",
    )
    setTargetType(rule?.targetType ?? "membership")
    setTargetAdditionalLineId(rule?.targetAdditionalLineId ?? "")
    setExclusivityGroup(rule?.exclusivityGroup ?? "")
  }, [open, rule])

  const isPercent = effectType === "percent_discount" || effectType === "surcharge_percent"
  const isValid =
    name.trim().length > 0 &&
    effectValueInput.trim().length > 0 &&
    !Number.isNaN(Number(effectValueInput)) &&
    (targetType !== "additional_line" || !!targetAdditionalLineId)

  function handleSubmit() {
    // Percent effects are stored in basis points (1000 = 10.00%); amount effects in cents.
    const effectValue = isPercent
      ? Math.round(Number(effectValueInput) * 100)
      : Math.round(Number(effectValueInput) * 100)

    const payload = {
      name: name.trim(),
      conditions,
      effectType,
      effectValue,
      targetType,
      targetAdditionalLineId: targetType === "additional_line" ? targetAdditionalLineId : undefined,
      exclusivityGroup: exclusivityGroup.trim() || undefined,
    }

    if (rule) {
      updateRule.mutate(
        { gridId, ruleId: rule.id, ...payload },
        { onSuccess: () => onOpenChange(false) },
      )
    } else {
      createRule.mutate(
        { gridId, ...payload },
        { onSuccess: () => onOpenChange(false) },
      )
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{rule ? "Modifier la règle" : "Nouvelle règle"}</SheetTitle>
          <SheetDescription>
            Une règle = conditions (toutes doivent être remplies) + effet appliqué sur une ligne.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="rule-name">Nom de la règle</Label>
            <Input
              id="rule-name"
              placeholder="Ex : Résident Rennes"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Conditions (toutes requises)</Label>
            <TarifRuleConditionBlock
              conditions={conditions}
              ageCategories={ageCategories}
              tags={tags}
              onChange={setConditions}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Effet</Label>
              <Select value={effectType} onValueChange={(v) => setEffectType(v as TarifRuleEffectType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EFFECT_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rule-value">{isPercent ? "Valeur (%)" : "Valeur (€)"}</Label>
              <Input
                id="rule-value"
                type="number"
                step={isPercent ? "0.1" : "0.01"}
                value={effectValueInput}
                onChange={(e) => setEffectValueInput(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Cible</Label>
              <Select value={targetType} onValueChange={(v) => setTargetType(v as TarifRuleTargetType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TARGET_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {targetType === "license" ? (
                <p className="text-xs text-amber-600">
                  La licence FFT est reversée à la fédération — une réduction dessus reste à la charge du club.
                </p>
              ) : null}
            </div>
            {targetType === "additional_line" ? (
              <div className="space-y-1.5">
                <Label>Ligne additionnelle</Label>
                <Select value={targetAdditionalLineId} onValueChange={setTargetAdditionalLineId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    {additionalLines.map((line) => (
                      <SelectItem key={line.id} value={line.id}>
                        {line.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rule-exclusivity">Groupe d'exclusivité (optionnel)</Label>
            <Input
              id="rule-exclusivity"
              placeholder="Ex : statut_social"
              value={exclusivityGroup}
              onChange={(e) => setExclusivityGroup(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              En mode "cumuler", deux règles du même groupe ne se cumulent jamais — seule la plus avantageuse
              s'applique.
            </p>
          </div>
        </div>

        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isPending}>
            {isPending ? "Enregistrement..." : rule ? "Enregistrer" : "Créer la règle"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
