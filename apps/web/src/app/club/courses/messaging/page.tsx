"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useCourseMessagingSettings, useClubGroups } from "@/hooks/use-course-messaging-queries"
import { useUpdateCourseMessagingSettings, useArchiveGroup } from "@/hooks/use-course-messaging-mutations"
import { useClubAdminContext } from "@/lib/club-admin-context"

export default function ClubCourseMessagingPage() {
  const { organizationId } = useClubAdminContext()
  const { data: settings } = useCourseMessagingSettings(organizationId)
  const { data: groups } = useClubGroups(organizationId)
  const updateSettings = useUpdateCourseMessagingSettings()
  const archiveGroup = useArchiveGroup(organizationId)

  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    if (settings) setEnabled(settings.enabled)
  }, [settings])

  function handleToggle(checked: boolean) {
    setEnabled(checked)
    updateSettings.mutate({ organizationId, enabled: checked })
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">Messagerie des cours</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Chaque cours a un groupe de discussion qui se synchronise automatiquement avec les
        inscriptions. Les adhérents peuvent aussi créer des groupes manuels.
      </p>

      <div className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Groupes de cours automatiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="course-messaging-enabled" className="flex-1 font-normal">
                Créer automatiquement un groupe de discussion pour chaque nouveau cours
              </Label>
              <Switch id="course-messaging-enabled" checked={enabled} onCheckedChange={handleToggle} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Groupes du club</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(groups ?? []).map((group) => (
                  <TableRow key={group.id}>
                    <TableCell>{group.courseName ?? group.name ?? "Groupe sans nom"}</TableCell>
                    <TableCell>
                      <Badge variant={group.courseId ? "default" : "secondary"}>
                        {group.courseId ? "Cours" : "Manuel"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {group.isArchived ? (
                        <Badge variant="outline">Archivé</Badge>
                      ) : group.announcementsOnly ? (
                        <Badge variant="outline">Annonces seulement</Badge>
                      ) : (
                        <Badge variant="outline">Actif</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={archiveGroup.isPending}
                        onClick={() =>
                          archiveGroup.mutate({ conversationId: group.id, isArchived: !group.isArchived })
                        }
                      >
                        {group.isArchived ? "Réactiver" : "Archiver"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(groups ?? []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                      Aucun groupe pour le moment.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
