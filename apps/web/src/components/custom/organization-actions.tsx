"use client"

import { useState, useEffect, useRef } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  useCreateOrganization,
  useUpdateOrganization,
  useDeleteOrganization,
  useCreateInvitation,
  useUploadOrganizationLogo,
} from "@/hooks/use-admin-mutations"
import type { Organization } from "@/types/admin"

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function isValidJson(str: string): boolean {
  if (!str.trim()) return true
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

// Create Organization Dialog
export function CreateOrganizationDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [slugManual, setSlugManual] = useState(false)
  const [metadata, setMetadata] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const createMutation = useCreateOrganization()
  const uploadLogoMutation = useUploadOrganizationLogo()
  const updateMutation = useUpdateOrganization()

  useEffect(() => {
    if (!slugManual) {
      setSlug(slugify(name))
    }
  }, [name, slugManual])

  useEffect(() => {
    if (logoFile) {
      const url = URL.createObjectURL(logoFile)
      setLogoPreview(url)
      return () => URL.revokeObjectURL(url)
    }
    setLogoPreview(null)
  }, [logoFile])

  const resetForm = () => {
    setName("")
    setSlug("")
    setSlugManual(false)
    setMetadata("")
    setLogoFile(null)
    setLogoPreview(null)
  }

  const handleSubmit = async () => {
    const parsedMetadata = metadata.trim()
      ? JSON.parse(metadata)
      : undefined

    const result = await createMutation.mutateAsync({
      name,
      slug,
      metadata: parsedMetadata,
    })

    const orgId = (result as { id?: string })?.id
    if (logoFile && orgId) {
      const uploadResult = await uploadLogoMutation.mutateAsync({
        image: logoFile,
        organizationId: orgId,
      })
      await updateMutation.mutateAsync({
        organizationId: orgId,
        data: { logo: uploadResult.logoUrl },
      })
    }

    resetForm()
    onOpenChange(false)
  }

  const isPending =
    createMutation.isPending ||
    uploadLogoMutation.isPending ||
    updateMutation.isPending
  const canSubmit = name.trim() && slug.trim() && isValidJson(metadata)

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
          <DialogTitle>Nouvelle organisation</DialogTitle>
          <DialogDescription>
            Cr&eacute;er une nouvelle organisation sur la plateforme
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="org-name">Nom</Label>
            <Input
              id="org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mon organisation"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="org-slug">Slug</Label>
            <Input
              id="org-slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value)
                setSlugManual(true)
              }}
              placeholder="mon-organisation"
            />
          </div>
          <div className="grid gap-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                {logoPreview ? (
                  <AvatarImage src={logoPreview} alt="Preview" />
                ) : null}
                <AvatarFallback className="text-xs">
                  {name ? getInitials(name) : "?"}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Choisir un fichier
              </Button>
              {logoFile && (
                <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {logoFile.name}
                </span>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                className="hidden"
                onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="org-metadata">Metadata (JSON)</Label>
            <Textarea
              id="org-metadata"
              value={metadata}
              onChange={(e) => setMetadata(e.target.value)}
              placeholder='{"key": "value"}'
              rows={3}
              className="font-mono text-sm"
            />
            {metadata && !isValidJson(metadata) && (
              <p className="text-xs text-destructive">JSON invalide</p>
            )}
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
          <Button onClick={handleSubmit} disabled={isPending || !canSubmit}>
            {isPending ? "Cr\u00e9ation..." : "Cr\u00e9er"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Edit Organization Dialog
export function EditOrganizationDialog({
  organization: org,
  open,
  onOpenChange,
}: {
  organization: Organization
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [name, setName] = useState(org.name)
  const [slug, setSlug] = useState(org.slug)
  const [metadata, setMetadata] = useState(() => {
    if (!org.metadata) return ""
    try {
      return JSON.stringify(JSON.parse(org.metadata), null, 2)
    } catch {
      return org.metadata
    }
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateMutation = useUpdateOrganization()
  const uploadLogoMutation = useUploadOrganizationLogo()

  useEffect(() => {
    if (open) {
      setName(org.name)
      setSlug(org.slug)
      setMetadata(() => {
        if (!org.metadata) return ""
        try {
          return JSON.stringify(JSON.parse(org.metadata), null, 2)
        } catch {
          return org.metadata
        }
      })
      setLogoFile(null)
      setLogoPreview(null)
    }
  }, [open, org])

  useEffect(() => {
    if (logoFile) {
      const url = URL.createObjectURL(logoFile)
      setLogoPreview(url)
      return () => URL.revokeObjectURL(url)
    }
    setLogoPreview(null)
  }, [logoFile])

  const handleSubmit = async () => {
    let logoUrl: string | undefined

    if (logoFile) {
      const uploadResult = await uploadLogoMutation.mutateAsync({
        image: logoFile,
        organizationId: org.id,
      })
      logoUrl = uploadResult.logoUrl
    }

    const parsedMetadata = metadata.trim()
      ? JSON.parse(metadata)
      : undefined

    await updateMutation.mutateAsync({
      organizationId: org.id,
      data: {
        name,
        slug,
        ...(logoUrl && { logo: logoUrl }),
        ...(parsedMetadata !== undefined && { metadata: parsedMetadata }),
      },
    })

    onOpenChange(false)
  }

  const isPending = updateMutation.isPending || uploadLogoMutation.isPending
  const canSubmit = name.trim() && slug.trim() && isValidJson(metadata)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier l&apos;organisation</DialogTitle>
          <DialogDescription>
            Modifier les informations de {org.name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-org-name">Nom</Label>
            <Input
              id="edit-org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-org-slug">Slug</Label>
            <Input
              id="edit-org-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={logoPreview ?? org.logo ?? undefined}
                  alt={org.name}
                />
                <AvatarFallback className="text-xs">
                  {getInitials(org.name)}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Changer le logo
              </Button>
              {logoFile && (
                <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {logoFile.name}
                </span>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                className="hidden"
                onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-org-metadata">Metadata (JSON)</Label>
            <Textarea
              id="edit-org-metadata"
              value={metadata}
              onChange={(e) => setMetadata(e.target.value)}
              placeholder='{"key": "value"}'
              rows={4}
              className="font-mono text-sm"
            />
            {metadata && !isValidJson(metadata) && (
              <p className="text-xs text-destructive">JSON invalide</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !canSubmit}>
            {isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Delete Organization Dialog
export function DeleteOrganizationDialog({
  organization: org,
  open,
  onOpenChange,
  onDeleted,
}: {
  organization: Organization
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}) {
  const deleteMutation = useDeleteOrganization()

  const handleSubmit = () => {
    deleteMutation.mutate(
      { organizationId: org.id },
      {
        onSuccess: () => {
          onOpenChange(false)
          onDeleted?.()
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer l&apos;organisation</DialogTitle>
          <DialogDescription>
            Supprimer d&eacute;finitivement &laquo; {org.name} &raquo; et tous
            ses membres et invitations ? Cette action est irr&eacute;versible.
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

// Create Invitation Dialog
export function CreateInvitationDialog({
  organizationId,
  open,
  onOpenChange,
}: {
  organizationId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("member")
  const createInvitationMutation = useCreateInvitation()

  const handleSubmit = () => {
    createInvitationMutation.mutate(
      { organizationId, email, role },
      {
        onSuccess: () => {
          setEmail("")
          setRole("member")
          onOpenChange(false)
        },
      },
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setEmail("")
          setRole("member")
        }
        onOpenChange(v)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inviter un membre</DialogTitle>
          <DialogDescription>
            Envoyer une invitation par email
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemple.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="invite-role">R&ocirc;le</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setEmail("")
              setRole("member")
              onOpenChange(false)
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createInvitationMutation.isPending || !email.trim()}
          >
            {createInvitationMutation.isPending ? "Envoi..." : "Envoyer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
