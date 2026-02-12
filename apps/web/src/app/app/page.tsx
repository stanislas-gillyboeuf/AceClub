"use client";

import { LevelProgressCard } from "@/components/custom/home/level-progress-card";
import { OngoingMatchesCarousel } from "@/components/custom/home/ongoing-matches-carousel";
import { FinishedMatchesList } from "@/components/custom/home/finished-matches-list";

export default function HomePage() {
  return (
    <div className="space-y-6 p-4">
      <LevelProgressCard />
      <OngoingMatchesCarousel />
      <FinishedMatchesList />
    </div>
  );
}
