"use client";

import { use, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Users,
  Calendar,
  UserPlus,
  LogOut,
  Lock,
  LockOpen,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Pencil,
  ChevronRight,
  Zap,
  AlertTriangle,
  Mail,
  Trash2,
  Loader2,
  Check,
} from "lucide-react";
import {
  useOrganization,
  useOrganizationMembers,
  useOrganizationStats,
  useOrganizationPin,
  useOrganizationInvitations,
} from "@/hooks/use-org-queries";
import {
  useLeaveOrganization,
  useCreateInvitation,
  useUpdateOrganization,
  useTogglePin,
  useRegeneratePin,
  useRemoveMember,
} from "@/hooks/use-org-mutations";
import { useMe } from "@/hooks/use-user-queries";
import { useRouter } from "next/navigation";

// ---------- Section Header ----------
function SectionHeader({
  icon: Icon,
  title,
  className,
}: {
  icon: React.ElementType;
  title: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <Icon className="size-4" />
      <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>
    </div>
  );
}

// ---------- Invite Member Dialog ----------
function InviteMemberDialog({
  open,
  onOpenChange,
  organizationId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  organizationId: string;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const createInvitation = useCreateInvitation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createInvitation.mutateAsync({ organizationId, email, role });
    onOpenChange(false);
    setEmail("");
    setRole("member");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inviter un membre</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemple.com"
              required
              autoFocus
            />
          </div>
          <div className="space-y-3">
            <Label>Rôle</Label>
            <div className="space-y-2">
              {(["member", "admin"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                    role === r ? "border-primary bg-primary/5" : "border-border hover:bg-accent/50"
                  }`}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{r === "member" ? "Membre" : "Admin"}</p>
                    <p className="text-xs text-muted-foreground">
                      {r === "member" ? "Accès standard" : "Peut gérer les membres et invitations"}
                    </p>
                  </div>
                  {role === r && <Check className="size-4 text-primary" />}
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={createInvitation.isPending}>
            {createInvitation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Envoyer l&apos;invitation
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Edit Organization Dialog ----------
function EditOrganizationDialog({
  open,
  onOpenChange,
  organization,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  organization: { id: string; name: string; address: string | null };
}) {
  const [name, setName] = useState(organization.name);
  const [address, setAddress] = useState(organization.address ?? "");
  const updateOrg = useUpdateOrganization();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: { organizationId: string; name?: string; address?: string } = {
      organizationId: organization.id,
    };
    if (name !== organization.name) data.name = name;
    if (address !== (organization.address ?? "")) data.address = address;

    await updateOrg.mutateAsync(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le club</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nom du club</Label>
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-address">Adresse</Label>
            <Input
              id="edit-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="7 Rue du Club, 75001 Paris"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={updateOrg.isPending || (!name && !address)}
          >
            {updateOrg.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Enregistrer
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Role helpers ----------
function getRoleLabel(role: string) {
  switch (role) {
    case "owner":
      return "Propriétaire";
    case "admin":
      return "Admin";
    default:
      return "Membre";
  }
}

function getRoleColor(role: string) {
  switch (role) {
    case "owner":
      return "text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-300 dark:bg-purple-950 dark:border-purple-800";
    case "admin":
      return "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950 dark:border-blue-800";
    default:
      return "";
  }
}

// ---------- Main Page ----------
export default function OrganizationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: org, isPending } = useOrganization(id);
  const { data: membersData } = useOrganizationMembers(id);
  const { data: stats } = useOrganizationStats(id);
  const { data: pinData } = useOrganizationPin(id);
  const { data: invitationsData } = useOrganizationInvitations(id);
  const { data: me } = useMe();

  const leaveOrg = useLeaveOrganization();
  const togglePin = useTogglePin();
  const regeneratePin = useRegeneratePin();
  const removeMember = useRemoveMember();

  const [showInvite, setShowInvite] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showLeave, setShowLeave] = useState(false);
  const [showRegenerate, setShowRegenerate] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [pinVisible, setPinVisible] = useState(true);

  const members = membersData?.members ?? [];
  const myMember = members.find((m) => m.userId === me?.id);
  const isAdmin = myMember?.role === "admin" || myMember?.role === "owner";
  const isOwner = myMember?.role === "owner";
  const pendingInvitations =
    invitationsData?.invitations?.filter((i) => i.status === "pending") ?? [];

  if (isPending) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
        <Building2 className="size-12 opacity-40" />
        <p className="text-sm">Club introuvable.</p>
      </div>
    );
  }

  const formattedDate = org.createdAt
    ? new Date(org.createdAt).toLocaleDateString("fr-FR", {
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6">
      {/* Header Card */}
      <Card className="p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          {org.logo ? (
            <img
              src={org.logo}
              alt={org.name}
              className="size-24 rounded-2xl border object-cover"
            />
          ) : (
            <div className="flex size-24 items-center justify-center rounded-2xl bg-primary/10 border">
              <Building2 className="size-10 text-primary" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold">{org.name}</h2>
            <p className="text-sm text-muted-foreground">@{org.slug}</p>
          </div>
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              className="text-primary"
              onClick={() => setShowEdit(true)}
            >
              <Pencil className="mr-1.5 size-3.5" />
              Modifier
            </Button>
          )}
        </div>
      </Card>

      {/* Stats Card */}
      <Card className="overflow-hidden">
        <div className="grid grid-cols-3 divide-x">
          <div className="flex flex-col items-center gap-1 py-4">
            <Users className="size-5 text-primary" />
            <span className="text-lg font-bold tabular-nums">
              {stats?.totalMembers ?? members.length}
            </span>
            <span className="text-[11px] text-muted-foreground">Membres</span>
          </div>
          <div className="flex flex-col items-center gap-1 py-4">
            <Calendar className="size-5 text-primary" />
            <span className="text-lg font-bold tabular-nums">{formattedDate}</span>
            <span className="text-[11px] text-muted-foreground">Création</span>
          </div>
          {isAdmin && pendingInvitations.length > 0 ? (
            <div className="flex flex-col items-center gap-1 py-4">
              <Mail className="size-5 text-primary" />
              <span className="text-lg font-bold tabular-nums">{pendingInvitations.length}</span>
              <span className="text-[11px] text-muted-foreground">En attente</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 py-4">
              <Calendar className="size-5 text-primary" />
              <span className="text-lg font-bold tabular-nums">{stats?.totalMatches ?? 0}</span>
              <span className="text-[11px] text-muted-foreground">Matchs</span>
            </div>
          )}
        </div>
      </Card>

      {/* Admin sections */}
      {isAdmin && (
        <>
          {/* PIN Section */}
          {pinData && (
            <div className="space-y-3">
              <SectionHeader icon={Lock} title="Code PIN" className="text-muted-foreground" />
              <Card className="divide-y">
                {/* Toggle */}
                <div className="flex items-center gap-3 p-4">
                  {pinData.pinEnabled ? (
                    <Lock className="size-5 text-green-600" />
                  ) : (
                    <LockOpen className="size-5 text-muted-foreground" />
                  )}
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Code PIN</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          pinData.pinEnabled
                            ? "border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-300"
                            : ""
                        }`}
                      >
                        {pinData.pinEnabled ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Les membres doivent saisir ce code pour rejoindre le club
                    </p>
                  </div>
                  <Switch
                    checked={pinData.pinEnabled}
                    onCheckedChange={() =>
                      togglePin.mutate({
                        organizationId: id,
                        enabled: !pinData.pinEnabled,
                      })
                    }
                  />
                </div>

                {/* PIN display */}
                {pinData.pinEnabled && pinData.pin && (
                  <>
                    <div className="flex items-center gap-3 p-4">
                      <div className="flex gap-2">
                        {pinData.pin.split("").map((digit, i) => (
                          <div
                            key={i}
                            className="flex size-10 items-center justify-center rounded-lg bg-muted text-lg font-bold tabular-nums"
                          >
                            {pinVisible ? digit : "\u2022"}
                          </div>
                        ))}
                      </div>
                      <div className="flex-1" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => setPinVisible(!pinVisible)}
                      >
                        {pinVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => navigator.clipboard.writeText(pinData.pin)}
                      >
                        <Copy className="size-4" />
                      </Button>
                    </div>

                    <button
                      type="button"
                      className="flex w-full items-center gap-3 p-4 text-left hover:bg-accent/50 transition-colors"
                      onClick={() => setShowRegenerate(true)}
                    >
                      <RefreshCw className="size-5 text-primary" />
                      <div className="flex-1 space-y-0.5">
                        <p className="text-sm font-medium">Régénérer le PIN</p>
                        <p className="text-xs text-muted-foreground">
                          Génère un nouveau code à 4 chiffres
                        </p>
                      </div>
                    </button>
                  </>
                )}
              </Card>
            </div>
          )}

          {/* Quick Actions */}
          <div className="space-y-3">
            <SectionHeader icon={Zap} title="Actions rapides" className="text-muted-foreground" />
            <Card className="divide-y">
              <button
                type="button"
                className="flex w-full items-center gap-3 p-4 text-left hover:bg-accent/50 transition-colors"
                onClick={() => setShowInvite(true)}
              >
                <UserPlus className="size-5 text-primary" />
                <div className="flex-1 space-y-0.5">
                  <p className="text-sm font-medium">Inviter un membre</p>
                  <p className="text-xs text-muted-foreground">Envoyer une invitation par email</p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-3 p-4 text-left hover:bg-accent/50 transition-colors"
                onClick={() => setShowEdit(true)}
              >
                <Pencil className="size-5 text-primary" />
                <div className="flex-1 space-y-0.5">
                  <p className="text-sm font-medium">Modifier le club</p>
                  <p className="text-xs text-muted-foreground">Changer le nom ou l&apos;adresse</p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
            </Card>
          </div>

          {/* Members Section */}
          <div className="space-y-3">
            <SectionHeader
              icon={Users}
              title={`Membres (${members.length})`}
              className="text-muted-foreground"
            />
            <Card className="divide-y">
              {members.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-3 px-4">
                  <Avatar className="size-10">
                    <AvatarImage src={member.userImage ?? undefined} />
                    <AvatarFallback className="text-sm bg-primary/10 text-primary">
                      {member.userName?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {member.userName}
                      {member.userId === me?.id && (
                        <span className="text-muted-foreground font-normal"> (vous)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{member.userEmail}</p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${getRoleColor(member.role)}`}>
                    {getRoleLabel(member.role)}
                  </Badge>
                  {isAdmin && member.userId !== me?.id && member.role !== "owner" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        setMemberToRemove({
                          id: member.id,
                          name: member.userName,
                        })
                      }
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              ))}
              {members.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">Aucun membre</p>
              )}
            </Card>
          </div>

          {/* Pending Invitations */}
          {pendingInvitations.length > 0 && (
            <div className="space-y-3">
              <SectionHeader
                icon={Mail}
                title={`Invitations en attente (${pendingInvitations.length})`}
                className="text-muted-foreground"
              />
              <Card className="divide-y">
                {pendingInvitations.map((inv) => (
                  <div key={inv.id} className="flex items-center gap-3 p-3 px-4">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Mail className="size-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{inv.email}</p>
                      <Badge
                        variant="outline"
                        className={`mt-0.5 text-[10px] ${getRoleColor(inv.role ?? "member")}`}
                      >
                        {getRoleLabel(inv.role ?? "member")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          )}
        </>
      )}

      {/* Non-admin: simple members list */}
      {!isAdmin && (
        <div className="space-y-3">
          <SectionHeader
            icon={Users}
            title={`Membres (${members.length})`}
            className="text-muted-foreground"
          />
          <Card className="divide-y">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-3 px-4">
                <Avatar className="size-10">
                  <AvatarImage src={member.userImage ?? undefined} />
                  <AvatarFallback className="text-sm bg-primary/10 text-primary">
                    {member.userName?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{member.userName}</p>
                </div>
                <Badge variant="outline" className={`text-[10px] ${getRoleColor(member.role)}`}>
                  {getRoleLabel(member.role)}
                </Badge>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* Danger Zone */}
      <div className="space-y-3">
        <SectionHeader icon={AlertTriangle} title="Zone dangereuse" className="text-destructive" />
        <Card className="border-destructive/30 p-4">
          <button
            type="button"
            className="flex w-full items-center gap-3 text-left"
            onClick={() => setShowLeave(true)}
          >
            <LogOut className="size-4 text-destructive" />
            <div className="flex-1 space-y-0.5">
              <p className="text-sm text-destructive font-medium">Quitter le club</p>
              <p className="text-xs text-muted-foreground">
                Vous pourrez rejoindre à nouveau plus tard
              </p>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>
        </Card>
      </div>

      {/* Dialogs */}
      <InviteMemberDialog open={showInvite} onOpenChange={setShowInvite} organizationId={id} />

      {org && (
        <EditOrganizationDialog
          open={showEdit}
          onOpenChange={setShowEdit}
          organization={{ id: org.id, name: org.name, address: org.address }}
        />
      )}

      {/* Leave confirmation */}
      <AlertDialog open={showLeave} onOpenChange={setShowLeave}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Quitter le club</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir quitter {org.name} ? Vous pourrez rejoindre à nouveau plus
              tard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                await leaveOrg.mutateAsync({ organizationId: id });
                router.push("/app/profile");
              }}
            >
              Quitter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Regenerate PIN confirmation */}
      <AlertDialog open={showRegenerate} onOpenChange={setShowRegenerate}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Régénérer le PIN ?</AlertDialogTitle>
            <AlertDialogDescription>
              L&apos;ancien code ne sera plus valide. Les membres devront utiliser le nouveau code
              pour rejoindre le club.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => regeneratePin.mutate({ organizationId: id })}>
              Régénérer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove member confirmation */}
      <AlertDialog open={!!memberToRemove} onOpenChange={(v) => !v && setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce membre ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera {memberToRemove?.name} de l&apos;organisation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (memberToRemove) {
                  removeMember.mutate({
                    organizationId: id,
                    memberId: memberToRemove.id,
                  });
                  setMemberToRemove(null);
                }
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
