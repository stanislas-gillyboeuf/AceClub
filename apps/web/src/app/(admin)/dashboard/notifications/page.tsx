"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  useNotificationSchedules,
  useNotificationTemplates,
} from "@/hooks/use-admin-queries"
import type {
  NotificationSchedule,
  NotificationType,
} from "@/types/admin"
import { NOTIFICATION_TYPE_LABELS } from "./notification-types"
import { TemplateSheet } from "./template-sheet"
import { ScheduleDialog } from "./schedule-dialog"

export default function NotificationsAdminPage() {
  const templatesQuery = useNotificationTemplates()
  const schedulesQuery = useNotificationSchedules()

  const [selectedType, setSelectedType] = useState<NotificationType | null>(null)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<NotificationSchedule | null>(null)

  const templates = templatesQuery.data?.templates ?? []
  const schedules = schedulesQuery.data?.schedules ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">
          Personnalisez les textes envoyés aux utilisateurs et planifiez des envois récurrents.
        </p>
      </div>

      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="schedules">Planifications</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-4">
          {templatesQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {templates.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Aucun template. Lancez le seed{" "}
                  <code>drizzle:seed-notification-templates</code>.
                </p>
              )}
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedType(tpl.type)}
                  className="text-left"
                >
                  <Card className="transition hover:border-foreground/30">
                    <CardContent className="space-y-2 pt-6">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold">
                          {NOTIFICATION_TYPE_LABELS[tpl.type]}
                        </h3>
                        <Badge variant={tpl.isActive ? "default" : "secondary"}>
                          {tpl.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {tpl.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tpl.activeVariantsCount} / {tpl.variantsCount} variante(s) active(s)
                      </p>
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="schedules" className="mt-4">
          <div className="mb-4 flex justify-end">
            <Button
              onClick={() => {
                setEditingSchedule(null)
                setScheduleDialogOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle planification
            </Button>
          </div>

          {schedulesQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : schedules.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucune planification. Créez-en une pour envoyer des notifications récurrentes via trigger.dev.
            </p>
          ) : (
            <div className="space-y-2">
              {schedules.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="w-full text-left"
                  onClick={() => {
                    setEditingSchedule(s)
                    setScheduleDialogOpen(true)
                  }}
                >
                  <Card className="transition hover:border-foreground/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h4 className="font-medium">{s.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {NOTIFICATION_TYPE_LABELS[s.templateType]}
                          </p>
                        </div>
                        <Badge variant={s.isActive ? "default" : "secondary"}>
                          {s.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span>
                          Cron : <code>{s.cronExpression}</code> ({s.timezone})
                        </span>
                        <span>
                          Audience :{" "}
                          {s.audience.type === "all"
                            ? "tous"
                            : `${s.audience.userIds.length} utilisateur(s)`}
                        </span>
                        {s.lastRunAt && (
                          <span>
                            Dernier run : {new Date(s.lastRunAt).toLocaleString("fr-FR")}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <TemplateSheet
        type={selectedType}
        open={!!selectedType}
        onOpenChange={(open) => !open && setSelectedType(null)}
      />

      <ScheduleDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        templates={templates}
        schedule={editingSchedule}
      />
    </div>
  )
}
