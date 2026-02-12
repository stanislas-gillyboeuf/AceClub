"use client";

import { ProfileHeaderCard } from "@/components/custom/profile/profile-header-card";
import { ProfileBadgesSection } from "@/components/custom/profile/profile-badges-section";
import { MyIntentsList } from "@/components/custom/profile/my-intents-list";
import { PendingInvitations } from "@/components/custom/profile/pending-invitations";
import { MyClubCard } from "@/components/custom/profile/my-club-card";

export default function ProfilePage() {
  return (
    <div className="space-y-6 p-4">
      <ProfileHeaderCard />
      <MyClubCard />
      <ProfileBadgesSection />
      <MyIntentsList />
      <PendingInvitations />
    </div>
  );
}
