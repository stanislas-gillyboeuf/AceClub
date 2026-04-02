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
import { DataTable } from "@/components/custom/data-table"
import { badgeColumns } from "@/components/custom/badges-columns"
import { useAdminBadges } from "@/hooks/use-admin-queries"
import {
  useCreateBadge,
  useUpdateBadge,
  useDeleteBadge,
} from "@/hooks/use-admin-mutations"
import type { AdminBadge } from "@/types/admin"

const EMPTY_FORM = {
  code: "",
  category: "achievement" as const,
  nameFr: "",
  nameEn: "",
  descriptionFr: "",
  descriptionEn: "",
  imageUrl: "",
  requiredLevel: null as number | null,
  displayOrder: 0,
  isActive: true,
}

export default function BadgesPage() {
  const { data, isLoading } = useAdminBadges()

  const createMutation = useCreateBadge()
  const updateMutation = useUpdateBadge()
  const deleteMutation = useDeleteBadge()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBadge, setEditingBadge] = useState<AdminBadge | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const openCreate = () => {
    setEditingBadge(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEdit = (badge: AdminBadge) => {
    setEditingBadge(badge)
    setForm({
      code: badge.code,
      category: badge.category,
      nameFr: badge.nameFr,
      nameEn: badge.nameEn,
      descriptionFr: badge.descriptionFr,
      descriptionEn: badge.descriptionEn,
      imageUrl: badge.imageUrl,
      requiredLevel: badge.requiredLevel,
      displayOrder: badge.displayOrder,
      isActive: badge.isActive,
    })
    setDialogOpen(true)
  }

  const handleSubmit = () => {
    if (editingBadge) {
      const { code: _code, ...updates } = form
      updateMutation.mutate(
        { id: editingBadge.id, ...updates },
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
          <h1 className="text-2xl font-bold">Badges</h1>
          <p className="text-muted-foreground">
            Gerer les badges et recompenses
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau badge
        </Button>
      </div>

      <DataTable
        columns={badgeColumns}
        data={data?.badges ?? []}
        isLoading={isLoading}
        onRowClick={openEdit}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBadge ? "Modifier le badge" : "Nouveau badge"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Code</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  disabled={!!editingBadge}
                  placeholder="LEVEL_25"
                />
              </div>
              <div>
                <Label>Categorie</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v as typeof form.category })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="level">Niveau</SelectItem>
                    <SelectItem value="achievement">Accomplissement</SelectItem>
                    <SelectItem value="milestone">Jalon</SelectItem>
                    <SelectItem value="special">Special</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nom FR</Label>
                <Input
                  value={form.nameFr}
                  onChange={(e) => setForm({ ...form, nameFr: e.target.value })}
                />
              </div>
              <div>
                <Label>Nom EN</Label>
                <Input
                  value={form.nameEn}
                  onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
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

            <div>
              <Label>URL de l&apos;image</Label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Niveau requis</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.requiredLevel ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, requiredLevel: e.target.value ? parseInt(e.target.value) : null })
                  }
                  placeholder="Aucun"
                />
              </div>
              <div>
                <Label>Ordre d&apos;affichage</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.displayOrder}
                  onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                />
                <Label>Actif</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            {editingBadge && (
              <Button
                variant="destructive"
                onClick={() => {
                  deleteMutation.mutate(
                    { id: editingBadge.id },
                    { onSuccess: () => setDialogOpen(false) },
                  )
                }}
                disabled={deleteMutation.isPending}
              >
                Desactiver
              </Button>
            )}
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Enregistrement..." : editingBadge ? "Modifier" : "Creer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
