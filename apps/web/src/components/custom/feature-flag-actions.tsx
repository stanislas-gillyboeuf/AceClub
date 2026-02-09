"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  useCreateFeatureFlag,
  useDeleteFeatureFlag,
  useSetFeatureFlagOverride,
  useRemoveFeatureFlagOverride,
} from "@/hooks/use-admin-mutations"
import type { FeatureFlag } from "@/types/admin"

export function CreateFeatureFlagDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [key, setKey] = useState("")
  const [enabled, setEnabled] = useState(false)
  const [description, setDescription] = useState("")

  const createMutation = useCreateFeatureFlag()

  const resetForm = () => {
    setKey("")
    setEnabled(false)
    setDescription("")
  }

  const handleSubmit = () => {
    createMutation.mutate(
      {
        key,
        enabled,
        ...(description.trim() && { description: description.trim() }),
      },
      {
        onSuccess: () => {
          resetForm()
          onOpenChange(false)
        },
      },
    )
  }

  const isValidKey = /^[a-z][a-z0-9_]*$/.test(key)
  const canSubmit = key.trim() && isValidKey

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm()
        onOpenChange(v)
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau feature flag</DialogTitle>
          <DialogDescription>
            Cr&eacute;er un nouveau flag de configuration
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="flag-key">Cl&eacute; (snake_case)</Label>
            <Input
              id="flag-key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="restrict_discovery"
              className="font-mono"
            />
            {key && !isValidKey && (
              <p className="text-xs text-destructive">
                La cl&eacute; doit &ecirc;tre en snake_case (lettres minuscules, chiffres, underscores)
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="flag-description">Description</Label>
            <Textarea
              id="flag-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description du flag..."
              rows={2}
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="flag-enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
            <Label htmlFor="flag-enabled">
              Activ&eacute; par d&eacute;faut
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              resetForm()
              onOpenChange(false)
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending || !canSubmit}
          >
            {createMutation.isPending ? "Cr\u00e9ation..." : "Cr\u00e9er"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function DeleteFeatureFlagDialog({
  flag,
  open,
  onOpenChange,
}: {
  flag: FeatureFlag
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const deleteMutation = useDeleteFeatureFlag()

  const handleSubmit = () => {
    deleteMutation.mutate(
      { id: flag.id },
      {
        onSuccess: () => {
          onOpenChange(false)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer le feature flag</DialogTitle>
          <DialogDescription>
            Supprimer d&eacute;finitivement le flag &laquo;{" "}
            <span className="font-mono font-semibold">{flag.key}</span>{" "}
            &raquo; et tous ses overrides ? Cette action est irr&eacute;versible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AddOverrideDialog({
  flag,
  open,
  onOpenChange,
}: {
  flag: FeatureFlag
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [organizationId, setOrganizationId] = useState("")
  const [enabled, setEnabled] = useState(false)

  const setOverrideMutation = useSetFeatureFlagOverride()

  const resetForm = () => {
    setOrganizationId("")
    setEnabled(false)
  }

  const handleSubmit = () => {
    setOverrideMutation.mutate(
      { flagId: flag.id, organizationId, enabled },
      {
        onSuccess: () => {
          resetForm()
          onOpenChange(false)
        },
      },
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm()
        onOpenChange(v)
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un override</DialogTitle>
          <DialogDescription>
            Override pour le flag{" "}
            <span className="font-mono font-semibold">{flag.key}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="override-org-id">ID de l&apos;organisation</Label>
            <Input
              id="override-org-id"
              value={organizationId}
              onChange={(e) => setOrganizationId(e.target.value)}
              placeholder="ID de l'organisation"
              className="font-mono"
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="override-enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
            <Label htmlFor="override-enabled">
              Activ&eacute; pour cette organisation
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              resetForm()
              onOpenChange(false)
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={setOverrideMutation.isPending || !organizationId.trim()}
          >
            {setOverrideMutation.isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function RemoveOverrideButton({
  flagId,
  orgId,
}: {
  flagId: string
  orgId: string
}) {
  const removeMutation = useRemoveFeatureFlagOverride()

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 text-destructive hover:text-destructive"
      onClick={() => removeMutation.mutate({ flagId, orgId })}
      disabled={removeMutation.isPending}
    >
      {removeMutation.isPending ? "..." : "Retirer"}
    </Button>
  )
}
