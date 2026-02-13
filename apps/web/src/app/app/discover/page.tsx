"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DiscoverFeed } from "@/components/custom/discover/discover-feed";
import { CreateIntentDialog } from "@/components/custom/discover/create-intent-dialog";

export default function DiscoverPage() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div />
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowCreate(true)}>
          <Plus className="size-4" />
          Créer une annonce
        </Button>
      </div>
      <DiscoverFeed />
      <CreateIntentDialog open={showCreate} onOpenChange={setShowCreate} />
    </div>
  );
}
