"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useCreateNotificationSchedule,
  useDeleteNotificationSchedule,
  useUpdateNotificationSchedule,
} from "@/hooks/use-admin-mutations"
import type {
  NotificationSchedule,
  NotificationTemplateSummary,
} from "@/types/admin"
import { CRON_PRESETS, NOTIFICATION_TYPE_LABELS } from "./notification-types"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  templates: NotificationTemplateSummary[]
  schedule: NotificationSchedule | null
}

const DEFAULT_FORM = {
  templateId: "",
  name: "",
  cronExpression: "0 19 * * *",
  timezone: "UTC",
  audienceType: "all" as "all" | "user_ids",
  audienceUserIds: "",
  defaultVariables: "{}",
  isActive: true,
}

export function ScheduleDialog({ open, onOpenChange, templates, schedule }: Props) {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [jsonError, setJsonError] = useState<string | null>(null)

  const createMutation = useCreateNotificationSchedule()
  const updateMutation = useUpdateNotificationSchedule()
  const deleteMutation = useDeleteNotificationSchedule()

  useEffect(() => {
    if (!open) return
    if (schedule) {
      setForm({
        templateId: schedule.templateId,
        name: schedule.name,
        cronExpression: schedule.cronExpression,
        timezone: schedule.timezone,
        audienceType: schedule.audience.type,
        audienceUserIds:
          schedule.audience.type === "user_ids"
            ? schedule.audience.userIds.join(", ")
            : "",
        defaultVariables: JSON.stringify(schedule.defaultVariables, null, 2),
        isActive: schedule.isActive,
      })
    } else {
      setForm(DEFAULT_FORM)
    }
    setJsonError(null)
  }, [open, schedule])

  const handleSubmit = () => {
    let defaultVariables: Record<string, string>
    try {
      defaultVariables = JSON.parse(form.defaultVariables || "{}")
    } catch {
      setJsonError("JSON invalide")
      return
    }
    setJsonError(null)

    const audience =
      form.audienceType === "all"
        ? ({ type: "all" } as const)
        : ({
            type: "user_ids" as const,
            userIds: form.audienceUserIds
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          })

    if (audience.type === "user_ids" && audience.userIds.length === 0) {
      setJsonError("Au moins un userId requis")
      return
    }

    if (schedule) {
      updateMutation.mutate(
        {
          id: schedule.id,
          name: form.name,
          cronExpression: form.cronExpression,
          timezone: form.timezone,
          audience,
          defaultVariables,
          isActive: form.isActive,
        },
        { onSuccess: () => onOpenChange(false) },
      )
    } else {
      createMutation.mutate(
        {
          templateId: form.templateId,
          name: form.name,
          cronExpression: form.cronExpression,
          timezone: form.timezone,
          audience,
          defaultVariables,
          isActive: form.isActive,
        },
        { onSuccess: () => onOpenChange(false) },
      )
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {schedule ? "Modifier la planification" : "Nouvelle planification"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label>Template</Label>
            <Select
              value={form.templateId}
              onValueChange={(v) => setForm({ ...form, templateId: v })}
              disabled={!!schedule}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir un template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {NOTIFICATION_TYPE_LABELS[t.type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Nom (libellé admin)</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Rappel hebdomadaire streak"
            />
          </div>

          <div>
            <Label>Expression cron</Label>
            <Input
              value={form.cronExpression}
              onChange={(e) => setForm({ ...form, cronExpression: e.target.value })}
              placeholder="0 19 * * *"
            />
            <div className="mt-2 flex flex-wrap gap-1">
              {CRON_PRESETS.map((p) => (
                <Button
                  key={p.value}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setForm({ ...form, cronExpression: p.value })}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label>Timezone</Label>
            <Input
              value={form.timezone}
              onChange={(e) => setForm({ ...form, timezone: e.target.value })}
              placeholder="UTC"
            />
          </div>

          <div>
            <Label>Audience</Label>
            <Select
              value={form.audienceType}
              onValueChange={(v) =>
                setForm({ ...form, audienceType: v as "all" | "user_ids" })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les utilisateurs</SelectItem>
                <SelectItem value="user_ids">Utilisateurs spécifiques</SelectItem>
              </SelectContent>
            </Select>
            {form.audienceType === "user_ids" && (
              <Textarea
                className="mt-2"
                value={form.audienceUserIds}
                onChange={(e) =>
                  setForm({ ...form, audienceUserIds: e.target.value })
                }
                rows={2}
                placeholder="userId1, userId2, userId3"
              />
            )}
          </div>

          <div>
            <Label>Variables par défaut (JSON)</Label>
            <Textarea
              value={form.defaultVariables}
              onChange={(e) => setForm({ ...form, defaultVariables: e.target.value })}
              rows={3}
              placeholder='{"userName": "Joueur"}'
              className="font-mono text-xs"
            />
            {jsonError && (
              <p className="mt-1 text-xs text-destructive">{jsonError}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={form.isActive}
              onCheckedChange={(v) => setForm({ ...form, isActive: v })}
            />
            <Label>Actif</Label>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <div>
            {schedule && (
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm("Supprimer cette planification ?")) {
                    deleteMutation.mutate(
                      { id: schedule.id },
                      { onSuccess: () => onOpenChange(false) },
                    )
                  }
                }}
                disabled={deleteMutation.isPending}
              >
                Supprimer
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending || !form.templateId || !form.name.trim()}
            >
              {isPending
                ? "Enregistrement…"
                : schedule
                  ? "Modifier"
                  : "Créer"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
