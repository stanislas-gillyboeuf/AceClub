import { useMemo } from "react";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { MatchDetail } from "@/types/match";
import type { Organization } from "@/types/organization";
import { VenueSelection } from "./venue-selection";
import { VenueAutoSet } from "./venue-auto-set";
import { VenueReadOnly } from "./venue-read-only";

interface VenueCardProps {
  matchDetail: MatchDetail;
  isParticipant: boolean;
  isScheduled: boolean;
}

export function VenueCard({ matchDetail, isParticipant, isScheduled }: VenueCardProps) {
  const scheme = useColorScheme();
  const venue = matchDetail.venueOrganization;
  const matchId = matchDetail.match.id;

  const participantOrgs = useMemo(() => {
    const map = new Map<string, Organization>();
    for (const po of matchDetail.participantOrganizations ?? []) {
      if (!map.has(po.organization.id)) {
        map.set(po.organization.id, po.organization);
      }
    }
    return Array.from(map.values());
  }, [matchDetail.participantOrganizations]);

  const needsSelection =
    isScheduled && isParticipant && !venue && participantOrgs.length >= 2;
  const needsAutoSet =
    isScheduled && isParticipant && !venue && participantOrgs.length === 1;

  if (needsSelection) {
    return (
      <VenueSelection
        matchId={matchId}
        organizations={participantOrgs}
        scheme={scheme}
      />
    );
  }

  if (needsAutoSet) {
    return (
      <VenueAutoSet
        matchId={matchId}
        organization={participantOrgs[0]}
        scheme={scheme}
      />
    );
  }

  return <VenueReadOnly matchDetail={matchDetail} venue={venue} scheme={scheme} />;
}
