"use client";

import { LevelProgressCard } from "@/components/custom/home/level-progress-card";
import { OngoingMatchesCarousel } from "@/components/custom/home/ongoing-matches-carousel";
import { FinishedMatchesList } from "@/components/custom/home/finished-matches-list";

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6">
      <LevelProgressCard />
      <OngoingMatchesCarousel />
      <FinishedMatchesList />
    </div>
  );
}
