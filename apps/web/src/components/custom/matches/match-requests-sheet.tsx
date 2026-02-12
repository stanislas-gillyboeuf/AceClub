"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMatchRequests } from "@/hooks/use-match-queries";
import { useAcceptRequest, useRejectRequest } from "@/hooks/use-match-mutations";

interface MatchRequestsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MatchRequestsSheet({ open, onOpenChange }: MatchRequestsSheetProps) {
  const { data: requests } = useMatchRequests();
  const acceptRequest = useAcceptRequest();
  const rejectRequest = useRejectRequest();

  const pending = requests?.filter((r) => r.status === "pending") ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Demandes de match</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-3">
          {pending.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucune demande en attente.
            </p>
          ) : (
            pending.map((req) => (
              <div key={req.id} className="flex items-center gap-3 rounded-md border p-3">
                <Avatar className="size-8">
                  <AvatarImage src={req.fromUserImage ?? undefined} />
                  <AvatarFallback className="text-xs">{req.fromUserName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{req.fromUserName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(req.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => rejectRequest.mutate(req.id)}>
                    Refuser
                  </Button>
                  <Button size="sm" onClick={() => acceptRequest.mutate(req.id)}>
                    Accepter
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
