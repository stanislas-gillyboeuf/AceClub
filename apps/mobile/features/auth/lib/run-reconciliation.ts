import type { Router } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { userService } from "@/services/user";

/**
 * Called right after an email becomes verified-and-trustworthy (email/password OTP success,
 * Apple relay contactEmail OTP success, or immediately after a Google/non-relay Apple sign-in,
 * which are already provider-verified). Looks for CSV-imported profiles matching that email and
 * routes accordingly — 0 matches sends the player to find-club.tsx (Étape 4) to join one themselves.
 *
 * Only runs pre-onboarding: a RETURNING, already-onboarded user signing back in via Apple/Google
 * must never be sent back through this (no OTP screen gates those providers, so without this
 * guard it would re-run on every single login).
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
