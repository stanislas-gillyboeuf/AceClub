"use client";

import { use, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Building2, Users, Calendar, UserPlus, LogOut, Key } from "lucide-react";
import {
  useOrganization,
  useOrganizationMembers,
  useOrganizationStats,
  useOrganizationPin,
} from "@/hooks/use-org-queries";
import { useMe } from "@/hooks/use-user-queries";
import { InviteMemberDialog } from "@/components/custom/organization/invite-member-dialog";
import { LeaveOrgDialog } from "@/components/custom/organization/leave-org-dialog";

export default function OrganizationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: org, isPending } = useOrganization(id);
  const { data: membersData } = useOrganizationMembers(id);
  const { data: stats } = useOrganizationStats(id);
  const { data: pinData } = useOrganizationPin(id);
  const { data: me } = useMe();
  const [showInvite, setShowInvite] = useState(false);
  const [showLeave, setShowLeave] = useState(false);

  const members = membersData?.members ?? [];
  const myMember = members.find((m) => m.userId === me?.id);
  const isAdmin = myMember?.role === "admin" || myMember?.role === "owner";

  if (isPending) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Club introuvable.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {org.logo ? (
              <img src={org.logo} alt={org.name} className="size-14 rounded-lg object-cover" />
            ) : (
              <div className="flex size-14 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="size-7 text-primary" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold">{org.name}</h2>
              {org.address && <p className="text-sm text-muted-foreground">{org.address}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-2">
          <Card>
            <CardContent className="p-3 text-center">
              <Users className="mx-auto size-4 text-muted-foreground" />
              <p className="text-lg font-bold">{stats.totalMembers}</p>
              <p className="text-[10px] text-muted-foreground">Membres</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Calendar className="mx-auto size-4 text-muted-foreground" />
              <p className="text-lg font-bold">{stats.totalMatches}</p>
              <p className="text-[10px] text-muted-foreground">Matchs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Calendar className="mx-auto size-4 text-muted-foreground" />
              <p className="text-lg font-bold">{stats.totalEvents}</p>
              <p className="text-[10px] text-muted-foreground">Events</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* PIN Section (admin only) */}
      {isAdmin && pinData && (
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Key className="size-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">Code PIN</p>
              <p className="font-mono text-lg">{pinData.pinEnabled ? pinData.pin : "Désactivé"}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Membres ({members.length})</CardTitle>
          {isAdmin && (
            <Button size="sm" variant="outline" onClick={() => setShowInvite(true)}>
              <UserPlus className="mr-1 size-4" />
              Inviter
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-2">
              <Avatar className="size-8">
                <AvatarImage src={member.userImage ?? undefined} />
                <AvatarFallback className="text-xs">{member.userName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">{member.userName}</p>
              </div>
              <Badge variant="outline" className="text-[10px]">
                {member.role}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <Separator />
      <Button
        variant="outline"
        className="w-full text-destructive"
        onClick={() => setShowLeave(true)}
      >
        <LogOut className="mr-2 size-4" />
        Quitter le club
      </Button>

      <InviteMemberDialog open={showInvite} onOpenChange={setShowInvite} organizationId={id} />
      <LeaveOrgDialog open={showLeave} onOpenChange={setShowLeave} organizationId={id} />
    </div>
  );
}
