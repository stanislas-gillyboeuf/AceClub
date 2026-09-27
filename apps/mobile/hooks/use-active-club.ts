import { useCallback, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useActiveClubStore } from "@/lib/active-club";
import { useMyOrganizations, useSetActiveOrganization } from "@/hooks/use-organization";
import { usePreferences } from "@/hooks/use-user";
import { queryKeys } from "@/lib/query-keys";

/**
 * Query roots whose data depends on which club is active. Cleared (not just
 * invalidated) on club switch so a screen never briefly renders another
 * club's cached matches/events while refetching.
 */
const CLUB_SCOPED_QUERY_ROOTS = [
  queryKeys.match.all,
  queryKeys.event.all,
  queryKeys.matchIntent.all,
  queryKeys.leaderboard.all,
  queryKeys.court.all,
];

/**
 * The single source of truth for "which club am I acting as" on the app.
 * Initializes once from the player's preferred club (falling back to their
 * first membership), keeps it valid if memberships change, and clears every
 * club-scoped query cache when the player switches clubs.
 */
export function useActiveClub() {
  const queryClient = useQueryClient();
  const activeClubId = useActiveClubStore((s) => s.activeClubId);
  const hasHydrated = useActiveClubStore((s) => s.hasHydrated);
  const setActiveClubId = useActiveClubStore((s) => s.setActiveClubId);
  const { data: orgs } = useMyOrganizations();
  const { data: preferences } = usePreferences();
  const setActiveOrganization = useSetActiveOrganization();

  // Pick (or repair) the active club once memberships are known: keep the
  // stored choice if it's still a real membership, otherwise fall back to
  // the preferred club, then the first membership, then none.
  useEffect(() => {
    if (!hasHydrated || !orgs) return;
    if (activeClubId && orgs.some((org) => org.id === activeClubId)) return;

    const preferred = orgs.find((org) => org.id === preferences?.organizationId);
    const next = preferred?.id ?? orgs[0]?.id ?? null;
    if (next !== activeClubId) {
      setActiveClubId(next);
    }
  }, [hasHydrated, orgs, preferences?.organizationId, activeClubId, setActiveClubId]);

  const setActiveClub = useCallback(
    (organizationId: string) => {
      if (organizationId === activeClubId) return;
      setActiveClubId(organizationId);
      setActiveOrganization.mutate({ organizationId });
      for (const root of CLUB_SCOPED_QUERY_ROOTS) {
        queryClient.removeQueries({ queryKey: root });
      }
    },
    [activeClubId, setActiveClubId, setActiveOrganization, queryClient]
  );

  const clubs = useMemo(() => orgs ?? [], [orgs]);

  return {
    activeClubId,
    clubs,
    hasMultipleClubs: clubs.length > 1,
    /** Only meaningful once hydration + the memberships fetch have settled. */
    hasNoClub: hasHydrated && !!orgs && orgs.length === 0,
    isReady: hasHydrated && !!orgs,
    setActiveClub,
  };
}
