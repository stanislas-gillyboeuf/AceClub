"use client"

import { useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Pencil, Trash2, Plus, X, Eye, EyeOff, MapPin, Lock, LockOpen, RefreshCw, Copy, Check } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTable } from "@/components/custom/data-table"
import {
  EditOrganizationDialog,
  DeleteOrganizationDialog,
  CreateInvitationDialog,
} from "@/components/custom/organization-actions"
import {
  useAdminOrganization,
  useOrganizationMembers,
  useOrganizationInvitations,
} from "@/hooks/use-admin-queries"
import { useCancelInvitation, useUpdateOrganization, useToggleOrganizationPin, useRegenerateOrganizationPin } from "@/hooks/use-admin-mutations"
import type { ColumnDef } from "@tanstack/react-table"
import type { OrganizationMember, Invitation } from "@/types/admin"

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-"
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

const membersColumns: ColumnDef<OrganizationMember>[] = [
  {
    accessorKey: "userName",
    header: "Membre",
    cell: ({ row }) => {
      const m = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={m.userImage ?? undefined} alt={m.userName} />
            <AvatarFallback className="text-xs">
              {getInitials(m.userName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <span className="font-medium">{m.userName}</span>
            <p className="text-xs text-muted-foreground">{m.userEmail}</p>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "role",
    header: "R\u00f4le",
    cell: ({ row }) => {
      const role = row.original.role
      return (
        <Badge variant={role === "owner" ? "default" : "secondary"}>
          {role}
        </Badge>
      )
    },
  },
  {
    accessorKey: "userBanned",
    header: "Statut",
    cell: ({ row }) => {
      const banned = row.original.userBanned
      return (
        <Badge variant={banned ? "destructive" : "outline"}>
          {banned ? "Banni" : "Actif"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date d'ajout",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
]

function getStatusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "accepted":
      return "default"
    case "pending":
      return "outline"
    case "rejected":
      return "destructive"
    case "canceled":
      return "secondary"
    default:
      return "secondary"
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "En attente"
    case "accepted":
      return "Accept\u00e9e"
    case "rejected":
      return "Refus\u00e9e"
    case "canceled":
      return "Annul\u00e9e"
    default:
      return status
  }
}

const PAGE_SIZE = 20

export default function OrganizationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const organizationId = params.organizationId as string
  const [membersPageIndex, setMembersPageIndex] = useState(0)

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [pinVisible, setPinVisible] = useState(false)
  const [pinCopied, setPinCopied] = useState(false)

  const { data: orgData, isLoading: orgLoading } = useAdminOrganization(organizationId)

  const org = orgData?.organization

  const { data: membersData, isLoading: membersLoading } =
    useOrganizationMembers({
      organizationId,
      limit: PAGE_SIZE,
      offset: membersPageIndex * PAGE_SIZE,
    })

  const { data: invitationsData, isLoading: invitationsLoading } =
    useOrganizationInvitations({ organizationId })

  const cancelInvitationMutation = useCancelInvitation()
  const updateOrganizationMutation = useUpdateOrganization()
  const togglePinMutation = useToggleOrganizationPin()
  const regeneratePinMutation = useRegenerateOrganizationPin()

  const handleCopyPin = useCallback(() => {
    if (org?.pin) {
      navigator.clipboard.writeText(org.pin)
      setPinCopied(true)
      setTimeout(() => setPinCopied(false), 2000)
    }
  }, [org?.pin])

  const isHidden = (() => {
    if (!org?.metadata) return false
    try {
      const meta =
        typeof org.metadata === "string"
          ? JSON.parse(org.metadata)
          : org.metadata
      return !!meta.hidden
    } catch {
      return false
    }
  })()

  const handleToggleVisibility = useCallback(() => {
    if (!org) return
    let existingMeta: Record<string, unknown> = {}
    if (org.metadata) {
      try {
        existingMeta =
          typeof org.metadata === "string"
            ? JSON.parse(org.metadata)
            : org.metadata
      } catch {
        existingMeta = {}
      }
    }
    updateOrganizationMutation.mutate({
      organizationId: org.id,
      data: {
        metadata: { ...existingMeta, hidden: !isHidden },
      },
    })
  }, [org, isHidden, updateOrganizationMutation])

  const handleMemberClick = useCallback(
    (member: OrganizationMember) => {
      router.push(`/dashboard/users/${member.userId}`)
    },
    [router],
  )

  const handleDeleted = useCallback(() => {
    router.push("/dashboard/organizations")
  }, [router])

  if (orgLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/organizations")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">D&eacute;tail organisation</h1>
      </div>

      {org && (
        <Card>
          <CardContent className="flex items-center gap-6 pt-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={org.logo ?? undefined} alt={org.name} />
              <AvatarFallback className="text-lg">
                {getInitials(org.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{org.name}</h2>
                {isHidden && (
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    Caché
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{org.slug}</p>
              {org.address && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" />
                  {org.address}
                </p>
              )}
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="secondary">
                  {org.memberCount} membre{org.memberCount > 1 ? "s" : ""}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Cr&eacute;&eacute;e le {formatDate(org.createdAt)}
                </span>
              </div>
              {org.metadata && (
                <pre className="mt-2 max-w-md truncate rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                  {org.metadata}
                </pre>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleVisibility}
                disabled={updateOrganizationMutation.isPending}
              >
                {isHidden ? (
                  <>
                    <Eye className="mr-2 h-3 w-3" />
                    Rendre visible
                  </>
                ) : (
                  <>
                    <EyeOff className="mr-2 h-3 w-3" />
                    Cacher
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditDialogOpen(true)}
              >
                <Pencil className="mr-2 h-3 w-3" />
                Modifier
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-3 w-3" />
                Supprimer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {org && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {org.pinEnabled ? (
                  <Lock className="h-5 w-5 text-green-600" />
                ) : (
                  <LockOpen className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">Code PIN</h3>
                    <Badge variant={org.pinEnabled ? "default" : "secondary"}>
                      {org.pinEnabled ? "Activ\u00e9" : "D\u00e9sactiv\u00e9"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Les membres doivent saisir ce code pour rejoindre le club
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {org.pin && (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-2xl font-bold tracking-[0.3em]">
                      {pinVisible ? org.pin : "\u2022\u2022\u2022\u2022"}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPinVisible(!pinVisible)}
                      title={pinVisible ? "Masquer" : "Afficher"}
                    >
                      {pinVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopyPin}
                      title="Copier"
                    >
                      {pinCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    togglePinMutation.mutate({
                      organizationId: org.id,
                      enabled: !org.pinEnabled,
                    })
                  }
                  disabled={togglePinMutation.isPending}
                >
                  {org.pinEnabled ? "D\u00e9sactiver" : "Activer"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    regeneratePinMutation.mutate({ organizationId: org.id })
                  }
                  disabled={regeneratePinMutation.isPending}
                >
                  <RefreshCw className="mr-2 h-3 w-3" />
                  R\u00e9g\u00e9n\u00e9rer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">
            Membres ({membersData?.total ?? 0})
          </TabsTrigger>
          <TabsTrigger value="invitations">
            Invitations ({invitationsData?.total ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-4">
          <DataTable
            columns={membersColumns}
            data={membersData?.members ?? []}
            onRowClick={handleMemberClick}
            isLoading={membersLoading}
            pagination={{
              pageIndex: membersPageIndex,
              pageSize: PAGE_SIZE,
              total: membersData?.total ?? 0,
              onPageChange: setMembersPageIndex,
            }}
          />
        </TabsContent>

        <TabsContent value="invitations" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Invitations</h3>
            <Button size="sm" onClick={() => setInviteDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Inviter
            </Button>
          </div>

          {invitationsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !invitationsData?.invitations?.length ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Aucune invitation
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>R&ocirc;le</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Invit&eacute; par</TableHead>
                    <TableHead>Expiration</TableHead>
                    <TableHead>Cr&eacute;&eacute;e le</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitationsData.invitations.map(
                    (inv: Invitation) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">
                          {inv.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {inv.role ?? "member"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(inv.status)}>
                            {getStatusLabel(inv.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {inv.inviterName ?? inv.inviterEmail ?? "-"}
                        </TableCell>
                        <TableCell>{formatDate(inv.expiresAt)}</TableCell>
                        <TableCell>{formatDate(inv.createdAt)}</TableCell>
                        <TableCell>
                          {inv.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                cancelInvitationMutation.mutate({
                                  invitationId: inv.id,
                                })
                              }
                              disabled={cancelInvitationMutation.isPending}
                              title="Annuler l'invitation"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {org && (
        <>
          <EditOrganizationDialog
            organization={org}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          />
          <DeleteOrganizationDialog
            organization={org}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onDeleted={handleDeleted}
          />
          <CreateInvitationDialog
            organizationId={organizationId}
            open={inviteDialogOpen}
            onOpenChange={setInviteDialogOpen}
          />
        </>
      )}
    </div>
  )
}
