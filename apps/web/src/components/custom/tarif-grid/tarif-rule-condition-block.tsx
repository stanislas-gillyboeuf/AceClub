"use client"

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ClubTag, TarifAgeCategory, TarifCondition, TarifConditionType } from "@/types/tarif-grid"
import { TarifRuleCommunePicker } from "./tarif-rule-commune-picker"

const CONDITION_TYPE_LABELS: Record<TarifConditionType, string> = {
  age_category: "Catégorie d'âge",
  age_range: "Tranche d'âge",
  commune: "Commune de résidence",
  household_rank: "Rang dans le foyer",
  lessons_count: "Nombre de cours",
  license_elsewhere: "Licence ailleurs",
  tag: "Statut / tag",
  membership_type: "Nouvel adhérent / renouvellement",
  registration_after: "Date d'inscription",
}

function defaultConditionForType(type: TarifConditionType): TarifCondition {
  switch (type) {
    case "age_category":
      return { type, categoryIds: [] }
    case "age_range":
      return { type, minAge: 0, maxAge: 99 }
    case "commune":
      return { type, mode: "in", communeInseeCodes: [] }
    case "household_rank":
      return { type, minRank: 2, maxRank: 2 }
    case "lessons_count":
      return { type, operator: "gte", value: 1 }
    case "license_elsewhere":
      return { type, value: true }
    case "tag":
      return { type, tagIds: [] }
    case "membership_type":
      return { type, value: "new" }
    case "registration_after":
      return { type, monthDay: "01-01" }
  }
}

interface ConditionRowProps {
  condition: TarifCondition
  ageCategories: TarifAgeCategory[]
  tags: ClubTag[]
  onChange: (condition: TarifCondition) => void
}

function ConditionRow({ condition, ageCategories, tags, onChange }: ConditionRowProps) {
  switch (condition.type) {
    case "age_category":
      return (
        <div className="flex flex-wrap gap-1.5">
          {ageCategories.map((cat) => {
            const checked = condition.categoryIds.includes(cat.id)
            return (
              <label
                key={cat.id}
                className="flex items-center gap-1.5 rounded-md border px-2 py-1 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(v) =>
                    onChange({
                      ...condition,
                      categoryIds: v
                        ? [...condition.categoryIds, cat.id]
                        : condition.categoryIds.filter((id) => id !== cat.id),
                    })
                  }
                />
                {cat.name}
              </label>
            )
          })}
        </div>
      )
    case "age_range":
      return (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            className="w-24"
            value={condition.minAge}
            onChange={(e) => onChange({ ...condition, minAge: Number(e.target.value) })}
          />
          <span className="text-sm text-muted-foreground">à</span>
          <Input
            type="number"
            min={0}
            className="w-24"
            value={condition.maxAge}
            onChange={(e) => onChange({ ...condition, maxAge: Number(e.target.value) })}
          />
          <span className="text-sm text-muted-foreground">ans</span>
        </div>
      )
    case "commune":
      return (
        <div className="space-y-2">
          <Select value={condition.mode} onValueChange={(v) => onChange({ ...condition, mode: v as "in" | "not_in" })}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in">Résident de ces communes</SelectItem>
              <SelectItem value="not_in">Hors de ces communes</SelectItem>
            </SelectContent>
          </Select>
          <TarifRuleCommunePicker
            selectedCodes={condition.communeInseeCodes}
            onChange={(codes) => onChange({ ...condition, communeInseeCodes: codes })}
          />
        </div>
      )
    case "household_rank":
      return (
        <Select
          value={condition.maxRank === undefined ? `${condition.minRank}+` : String(condition.minRank)}
          onValueChange={(v) =>
            v.endsWith("+")
              ? onChange({ ...condition, minRank: Number(v.replace("+", "")), maxRank: undefined })
              : onChange({ ...condition, minRank: Number(v), maxRank: Number(v) })
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2e du foyer</SelectItem>
            <SelectItem value="3">3e du foyer</SelectItem>
            <SelectItem value="4+">4e et plus du foyer</SelectItem>
          </SelectContent>
        </Select>
      )
    case "lessons_count":
      return (
        <div className="flex items-center gap-2">
          <Select
            value={condition.operator}
            onValueChange={(v) => onChange({ ...condition, operator: v as "eq" | "gte" | "lte" })}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="eq">=</SelectItem>
              <SelectItem value="gte">≥</SelectItem>
              <SelectItem value="lte">≤</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number"
            min={0}
            className="w-24"
            value={condition.value}
            onChange={(e) => onChange({ ...condition, value: Number(e.target.value) })}
          />
          <span className="text-sm text-muted-foreground">cours / semaine</span>
        </div>
      )
    case "license_elsewhere":
      return (
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={condition.value}
            onCheckedChange={(v) => onChange({ ...condition, value: !!v })}
          />
          Licencié dans un autre club
        </label>
      )
    case "tag":
      return (
        <div className="flex flex-wrap gap-1.5">
          {tags.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun statut créé pour ce club.</p>
          ) : (
            tags.map((tag) => {
              const checked = condition.tagIds.includes(tag.id)
              return (
                <label
                  key={tag.id}
                  className="flex items-center gap-1.5 rounded-md border px-2 py-1 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(v) =>
                      onChange({
                        ...condition,
                        tagIds: v ? [...condition.tagIds, tag.id] : condition.tagIds.filter((id) => id !== tag.id),
                      })
                    }
                  />
                  {tag.name}
                </label>
              )
            })
          )}
        </div>
      )
    case "membership_type":
      return (
        <Select value={condition.value} onValueChange={(v) => onChange({ ...condition, value: v as "new" | "renewal" })}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">Nouvel adhérent</SelectItem>
            <SelectItem value="renewal">Renouvellement</SelectItem>
          </SelectContent>
        </Select>
      )
    case "registration_after": {
      const [month, day] = condition.monthDay.split("-")
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Inscrit après le</span>
          <Input
            type="number"
            min={1}
            max={31}
            className="w-16"
            value={day}
            onChange={(e) => onChange({ ...condition, monthDay: `${month}-${e.target.value.padStart(2, "0")}` })}
          />
          <span className="text-sm text-muted-foreground">/</span>
          <Input
            type="number"
            min={1}
            max={12}
            className="w-16"
            value={month}
            onChange={(e) => onChange({ ...condition, monthDay: `${e.target.value.padStart(2, "0")}-${day}` })}
          />
        </div>
      )
    }
  }
}

interface TarifRuleConditionBlockProps {
  conditions: TarifCondition[]
  ageCategories: TarifAgeCategory[]
  tags: ClubTag[]
  onChange: (conditions: TarifCondition[]) => void
}

/** Repeatable list of typed condition blocks — AND implicit between entries. Deliberately NOT a
 * generic query builder: one dedicated form per condition type (switched on `condition.type`). */
export function TarifRuleConditionBlock({ conditions, ageCategories, tags, onChange }: TarifRuleConditionBlockProps) {
  function updateAt(index: number, condition: TarifCondition) {
    onChange(conditions.map((c, i) => (i === index ? condition : c)))
  }

  function removeAt(index: number) {
    onChange(conditions.filter((_, i) => i !== index))
  }

  function addCondition(type: TarifConditionType) {
    onChange([...conditions, defaultConditionForType(type)])
  }

  return (
    <div className="space-y-3">
      {conditions.map((condition, index) => (
        <div key={index} className="space-y-1.5 rounded-md border p-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">{CONDITION_TYPE_LABELS[condition.type]}</Label>
            <Button variant="ghost" size="sm" onClick={() => removeAt(index)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <ConditionRow condition={condition} ageCategories={ageCategories} tags={tags} onChange={(c) => updateAt(index, c)} />
          {index < conditions.length - 1 ? <p className="pt-1 text-xs text-muted-foreground">ET</p> : null}
        </div>
      ))}

      <Select onValueChange={(v) => addCondition(v as TarifConditionType)} value="">
        <SelectTrigger className="w-64">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Plus className="h-3.5 w-3.5" />
            Ajouter une condition
          </span>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(CONDITION_TYPE_LABELS).map(([type, label]) => (
            <SelectItem key={type} value={type}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
