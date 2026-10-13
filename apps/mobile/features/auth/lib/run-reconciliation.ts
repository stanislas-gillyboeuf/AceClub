import type { Router } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { userService } from "@/services/user";

/**
 * Called right after sign-up (email/password, Apple, Google) or right after an Apple relay user
 * types their real contactEmail. Looks for CSV-imported profiles matching that email and routes
 * accordingly — 0 matches sends the player to find-club.tsx (Étape 4) to join one themselves.
 *
 * Only runs pre-onboarding: a RETURNING, already-onboarded user signing back in must never be
 * sent back through this, or it would re-run on every single login.
 */
export async function runReconciliation(router: Pick<Router, "replace">) {
  try {
    const { data: session } = await authClient.getSession();
    if (session?.user.onboardingCompleted) {
      router.replace("/");
      return;
    }

    const { profiles } = await userService.findImportedProfiles();
    if (profiles.length === 1) {
      router.replace("/reconcile-welcome");
    } else if (profiles.length > 1) {
      router.replace("/reconcile-choose");
    } else {
      router.replace("/find-club");
    }
  } catch {
    // Reconciliation is a bonus, not a blocker — if the lookup fails, just continue as if no
    // match was found rather than stranding the player mid-signup.
    router.replace("/find-club");
  }
}
