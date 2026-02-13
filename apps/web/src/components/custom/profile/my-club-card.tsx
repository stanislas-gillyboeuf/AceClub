"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, ChevronRight } from "lucide-react";
import { usePreferences } from "@/hooks/use-user-queries";
import { useActiveMember } from "@/hooks/use-org-queries";

function getRoleLabel(role: string): string {
  switch (role) {
    case "owner":
      return "Propriétaire";
    case "admin":
      return "Admin";
    default:
      return "Membre";
  }
}

export function MyClubCard() {
  const { data: prefs } = usePreferences();
  const { data: activeMember } = useActiveMember();

  if (!prefs?.organizationId) return null;

  const role = activeMember?.role ?? "member";

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Mon Club
      </h3>

      <Link href={`/app/organization/${prefs.organizationId}`}>
        <Card className="p-4 transition-all hover:scale-[0.98] hover:opacity-90 active:scale-[0.97] cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="size-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{prefs.organizationName}</p>
              <Badge variant="secondary" className="mt-0.5 text-[10px]">
                {getRoleLabel(role)}
              </Badge>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </div>
        </Card>
      </Link>
    </div>
  );
}
