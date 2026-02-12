"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DiscoverFeed } from "@/components/custom/discover/discover-feed";
import { CreateIntentDialog } from "@/components/custom/discover/create-intent-dialog";

export default function DiscoverPage() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Découvrir</h2>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1 size-4" />
          Publier
        </Button>
      </div>
      <DiscoverFeed />
      <CreateIntentDialog open={showCreate} onOpenChange={setShowCreate} />
    </div>
  );
}
