"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { DataTable } from "@/components/custom/data-table"
import { challengeTemplateColumns } from "@/components/custom/challenge-templates-columns"
import { useChallengeTemplates } from "@/hooks/use-admin-queries"
import {
  useCreateChallengeTemplate,
  useUpdateChallengeTemplate,
  useDeleteChallengeTemplate,
  useAssignChallengeTemplateNow,
} from "@/hooks/use-admin-mutations"
import type { ChallengeTemplate } from "@/types/admin"

const EMPTY_FORM = {
  code: "",
  type: "quantitative" as "quantitative" | "social" | "performance",
  difficulty: "easy" as "easy" | "medium" | "hard",
  titleFr: "",
  titleEn: "",
  descriptionFr: "",
  descriptionEn: "",
  targetValue: 1,
  acesReward: 100,
  minLevel: 1,
  maxLevel: null as number | null,
  isActive: true,
}

export default function ChallengesPage() {
  const [page, setPage] = useState(0)
  const [filterType, setFilterType] = useState<string | undefined>()
  const { data, isLoading } = useChallengeTemplates({
    type: filterType,
    limit: 20,
    offset: page * 20,
  })

  const createMutation = useCreateChallengeTemplate()
  const updateMutation = useUpdateChallengeTemplate()
  const deleteMutation = useDeleteChallengeTemplate()
  const assignNowMutation = useAssignChallengeTemplateNow()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmAssignOpen, setConfirmAssignOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ChallengeTemplate | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const openCreate = () => {
    setEditingTemplate(null)
    setForm(EMPTY_FORM)
    assignNowMutation.reset()
    setDialogOpen(true)
  }

  const openEdit = (template: ChallengeTemplate) => {
    setEditingTemplate(template)
    assignNowMutation.reset()
    setForm({
      code: template.code,
      type: template.type,
      difficulty: template.difficulty,
      titleFr: template.titleFr,
      titleEn: template.titleEn,
      descriptionFr: template.descriptionFr,
      descriptionEn: template.descriptionEn,
      targetValue: template.targetValue,
      acesReward: template.acesReward,
      minLevel: template.minLevel,
      maxLevel: template.maxLevel,
      isActive: template.isActive,
    })
    setDialogOpen(true)
  }

  const handleSubmit = () => {
    if (editingTemplate) {
      const { code: _code, ...updates } = form
      updateMutation.mutate(
        { id: editingTemplate.id, ...updates },
        { onSuccess: () => setDialogOpen(false) },
      )
    } else {
      createMutation.mutate(form, {
        onSuccess: () => setDialogOpen(false),
      })
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Defis</h1>
          <p className="text-muted-foreground">
            Gerer les modeles de defis hebdomadaires. La distribution
            automatique aux joueurs a lieu chaque lundi matin. Pour un defi
            cree en milieu de semaine, utilise &laquo; Distribuer maintenant
            &raquo; dans l&apos;ecran d&apos;edition.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={filterType ?? "all"}
            onValueChange={(v) => {
              setFilterType(v === "all" ? undefined : v)
              setPage(0)
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="quantitative">Quantitatif</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau defi
          </Button>
        </div>
      </div>

      <DataTable
        columns={challengeTemplateColumns}
        data={data?.templates ?? []}
        isLoading={isLoading}
        onRowClick={openEdit}
        pagination={{
          pageIndex: page,
          pageSize: 20,
          total: data?.total ?? 0,
          onPageChange: setPage,
        }}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Modifier le defi" : "Nouveau defi"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Code</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  disabled={!!editingTemplate}
                  placeholder="play_5_matches"
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as typeof form.type })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quantitative">Quantitatif</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Difficulte</Label>
                <Select
                  value={form.difficulty}
                  onValueChange={(v) => setForm({ ...form, difficulty: v as typeof form.difficulty })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Facile</SelectItem>
                    <SelectItem value="medium">Moyen</SelectItem>
                    <SelectItem value="hard">Difficile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                />
                <Label>Actif</Label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Titre FR</Label>
                <Input
                  value={form.titleFr}
                  onChange={(e) => setForm({ ...form, titleFr: e.target.value })}
                />
              </div>
              <div>
                <Label>Titre EN</Label>
                <Input
                  value={form.titleEn}
                  onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Description FR</Label>
                <Input
                  value={form.descriptionFr}
                  onChange={(e) => setForm({ ...form, descriptionFr: e.target.value })}
                />
              </div>
              <div>
                <Label>Description EN</Label>
                <Input
                  value={form.descriptionEn}
                  onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label>Cible</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.targetValue}
                  onChange={(e) => setForm({ ...form, targetValue: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <Label>Aces</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.acesReward}
                  onChange={(e) => setForm({ ...form, acesReward: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Niveau min</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.minLevel}
                  onChange={(e) => setForm({ ...form, minLevel: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <Label>Niveau max</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.maxLevel ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, maxLevel: e.target.value ? parseInt(e.target.value) : null })
                  }
                  placeholder="Illimite"
                />
              </div>
            </div>
          </div>

          {assignNowMutation.data && (
            <p className="text-sm text-muted-foreground" role="status">
              Distribue a {assignNowMutation.data.assignedCount} joueur(s).
              Ignore : {assignNowMutation.data.skippedCount}.
            </p>
          )}
          {assignNowMutation.error && (
            <p className="text-sm text-destructive" role="status">
              {assignNowMutation.error instanceof Error
                ? assignNowMutation.error.message
                : "Echec de la distribution"}
            </p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            {editingTemplate && editingTemplate.isActive && (
              <Button
                variant="secondary"
                onClick={() => setConfirmAssignOpen(true)}
                disabled={assignNowMutation.isPending}
              >
                {assignNowMutation.isPending ? "Distribution..." : "Distribuer maintenant"}
              </Button>
            )}
            {editingTemplate && (
              <Button
                variant="destructive"
                onClick={() => {
                  deleteMutation.mutate(
                    { id: editingTemplate.id },
                    { onSuccess: () => setDialogOpen(false) },
                  )
                }}
                disabled={deleteMutation.isPending}
              >
                Desactiver
              </Button>
            )}
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Enregistrement..." : editingTemplate ? "Modifier" : "Creer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmAssignOpen} onOpenChange={setConfirmAssignOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Distribuer ce defi maintenant ?</AlertDialogTitle>
            <AlertDialogDescription>
              Tous les joueurs eligibles recevront ce defi pour la semaine en
              cours et une notification push. Les joueurs deja servis cette
              semaine pour ce defi seront ignores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!editingTemplate) return
                assignNowMutation.mutate({ id: editingTemplate.id })
              }}
            >
              Distribuer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
