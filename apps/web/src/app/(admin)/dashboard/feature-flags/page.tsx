"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useFeatureFlags } from "@/hooks/use-admin-queries"
import { useUpdateFeatureFlag } from "@/hooks/use-admin-mutations"
import {
  CreateFeatureFlagDialog,
  DeleteFeatureFlagDialog,
  AddOverrideDialog,
  RemoveOverrideButton,
} from "@/components/custom/feature-flag-actions"
import type { FeatureFlag } from "@/types/admin"

export default function FeatureFlagsPage() {
  const { data, isLoading } = useFeatureFlags()
  const updateMutation = useUpdateFeatureFlag()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteFlag, setDeleteFlag] = useState<FeatureFlag | null>(null)
  const [overrideFlag, setOverrideFlag] = useState<FeatureFlag | null>(null)

  const handleToggle = (flag: FeatureFlag) => {
    updateMutation.mutate({ id: flag.id, enabled: !flag.enabled })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-tight">Feature Flags</h1>
          <p className="text-muted-foreground">
            G&eacute;rer les flags de configuration de la plateforme
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau flag
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : !data?.featureFlags?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              Aucun feature flag configur&eacute;
            </p>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Cr&eacute;er le premier flag
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.featureFlags.map((flag) => (
            <Card key={flag.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={flag.enabled}
                      onCheckedChange={() => handleToggle(flag)}
                      disabled={updateMutation.isPending}
                    />
                    <div>
                      <CardTitle className="text-base font-mono">
                        {flag.key}
                      </CardTitle>
                      {flag.description && (
                        <CardDescription className="mt-0.5">
                          {flag.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={flag.enabled ? "default" : "secondary"}>
                      {flag.enabled ? "Actif" : "Inactif"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteFlag(flag)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">
                      Overrides par organisation
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOverrideFlag(flag)}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Ajouter
                    </Button>
                  </div>

                  {flag.overrides.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Organisation</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className="w-[80px]" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {flag.overrides.map((override) => (
                          <TableRow key={override.id}>
                            <TableCell className="font-medium">
                              {override.organizationName ?? override.organizationId}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  override.enabled ? "default" : "secondary"
                                }
                              >
                                {override.enabled ? "Actif" : "Inactif"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <RemoveOverrideButton
                                flagId={flag.id}
                                orgId={override.organizationId}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Aucun override &mdash; la valeur globale s&apos;applique
                      partout
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateFeatureFlagDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {deleteFlag && (
        <DeleteFeatureFlagDialog
          flag={deleteFlag}
          open={!!deleteFlag}
          onOpenChange={(v) => {
            if (!v) setDeleteFlag(null)
          }}
        />
      )}

      {overrideFlag && (
        <AddOverrideDialog
          flag={overrideFlag}
          open={!!overrideFlag}
          onOpenChange={(v) => {
            if (!v) setOverrideFlag(null)
          }}
        />
      )}
    </div>
  )
}
