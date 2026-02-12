"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, ChevronRight } from "lucide-react";
import { usePreferences } from "@/hooks/use-user-queries";

export function MyClubCard() {
  const { data: prefs } = usePreferences();

  if (!prefs?.organizationId) return null;

  return (
    <Link href={`/app/organization/${prefs.organizationId}`}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="size-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{prefs.organizationName}</p>
            <p className="text-xs text-muted-foreground">Mon club</p>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}
