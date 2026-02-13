"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Mail } from "lucide-react";
import { MatchList } from "@/components/custom/matches/match-list";
import { MatchRequestsSheet } from "@/components/custom/matches/match-requests-sheet";

export default function MatchesPage() {
  const [showRequests, setShowRequests] = useState(false);

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <Link href="/app/matches/new">
          <Button variant="ghost" size="icon" className="size-9">
            <Plus className="size-5" />
          </Button>
        </Link>

        <h1 className="text-sm font-semibold">Matchs</h1>

        <Button
          variant="ghost"
          size="icon"
          className="size-9"
          onClick={() => setShowRequests(true)}
        >
          <Mail className="size-5" />
        </Button>
      </div>

      {/* Match list grouped by date */}
      <div className="flex-1 overflow-y-auto">
        <MatchList />
      </div>

      <MatchRequestsSheet open={showRequests} onOpenChange={setShowRequests} />
    </div>
  );
}
