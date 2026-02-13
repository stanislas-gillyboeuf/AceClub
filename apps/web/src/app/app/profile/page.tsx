"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { ProfileHeaderCard } from "@/components/custom/profile/profile-header-card";
import { ProfileBadgesSection } from "@/components/custom/profile/profile-badges-section";
import { MyIntentsList } from "@/components/custom/profile/my-intents-list";
import { PendingInvitations } from "@/components/custom/profile/pending-invitations";
import { MyClubCard } from "@/components/custom/profile/my-club-card";

export default function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6">
      <ProfileHeaderCard />
      <ProfileBadgesSection />
      <MyIntentsList />
      <MyClubCard />
      <PendingInvitations />

      {/* Sign out */}
      <Button
        variant="outline"
        className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => signOut({ fetchOptions: { onSuccess: () => window.location.replace("/") } })}
      >
        <LogOut className="mr-2 size-4" />
        Déconnexion
      </Button>
    </div>
  );
}
