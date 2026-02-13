"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail } from "lucide-react";
import { useUserInvitations } from "@/hooks/use-org-queries";
import { useAcceptInvitation, useRejectInvitation } from "@/hooks/use-org-mutations";

export function PendingInvitations() {
  const { data: invitations, isPending } = useUserInvitations();
  const acceptInvitation = useAcceptInvitation();
  const rejectInvitation = useRejectInvitation();

  if (isPending) {
    return <Skeleton className="h-20 w-full rounded-xl" />;
  }

  const pending = invitations?.filter((i) => i.status === "pending") ?? [];

  if (pending.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Invitations
      </h3>

      <div className="space-y-2">
        {pending.map((invitation) => (
          <Card key={invitation.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Mail className="size-4 text-primary" />
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div>
                  <p className="text-sm font-medium">Invitation de {invitation.inviterName}</p>
                  <Badge variant="secondary" className="mt-0.5 text-[10px]">
                    {invitation.role === "admin" ? "Admin" : "Membre"}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => rejectInvitation.mutate({ invitationId: invitation.id })}
                    disabled={rejectInvitation.isPending}
                  >
                    Refuser
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => acceptInvitation.mutate({ invitationId: invitation.id })}
                    disabled={acceptInvitation.isPending}
                  >
                    Accepter
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
