"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserInvitations } from "@/hooks/use-org-queries";
import { useAcceptInvitation, useRejectInvitation } from "@/hooks/use-org-mutations";

export function PendingInvitations() {
  const { data: invitations, isPending } = useUserInvitations();
  const acceptInvitation = useAcceptInvitation();
  const rejectInvitation = useRejectInvitation();

  if (isPending) {
    return <Skeleton className="h-20 w-full" />;
  }

  const pending = invitations?.filter((i) => i.status === "pending") ?? [];

  if (pending.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Invitations en attente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {pending.map((invitation) => (
          <div
            key={invitation.id}
            className="flex items-center justify-between rounded-md border p-3"
          >
            <div>
              <p className="text-sm font-medium">Invitation de {invitation.inviterName}</p>
              <p className="text-xs text-muted-foreground">Rôle : {invitation.role ?? "membre"}</p>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => rejectInvitation.mutate({ invitationId: invitation.id })}
                disabled={rejectInvitation.isPending}
              >
                Refuser
              </Button>
              <Button
                size="sm"
                onClick={() => acceptInvitation.mutate({ invitationId: invitation.id })}
                disabled={acceptInvitation.isPending}
              >
                Accepter
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
