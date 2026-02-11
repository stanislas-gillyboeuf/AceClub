import type { UserSummary } from "./user";
import type { Organization } from "./organization";

export type MatchStatus = "scheduled" | "ongoing" | "finished";
export type MatchSide = "home" | "away";
export type MatchType = "match" | "training";

export interface Match {
  id: string;
  createdBy: string;
  status: MatchStatus;
  type: MatchType;
  createdAt: string;
  scheduledAt: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  venueOrganizationId: string | null;
}

export interface MatchParticipant {
  id: string;
  matchId: string;
  userId: string;
  user: UserSummary | null;
  side: MatchSide;
  isWinner: boolean;
  createdAt: string;
}

export interface MatchSet {
  id: string;
  matchId: string;
  setNumber: number;
  createdAt: string;
  scores: SetScore[];
}

export interface SetScore {
  participantId: string;
  userId: string;
  side: MatchSide;
  games: number;
}

export interface MatchComment {
  id: string;
  matchId: string;
  userId: string;
  user: UserSummary | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParticipantOrganization {
  userId: string;
  organization: Organization;
}

export interface MatchDetail {
  match: Match;
  participants: MatchParticipant[];
  sets: MatchSet[];
  comments: MatchComment[];
  venueOrganization: Organization | null;
  participantOrganizations: ParticipantOrganization[];
}

export interface UpdateMatchPayload {
  status?: MatchStatus;
  scheduledAt?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  winnerId?: string | null;
}

export interface CreateMatchPayload {
  createdBy: string;
  status: MatchStatus;
  type: MatchType;
  createdAt: string;
  scheduledAt?: string;
  startedAt?: string;
  finishedAt?: string;
  participants: {
    userId: string;
    side: MatchSide;
    isWinner?: boolean;
  }[];
  sets?: {
    setNumber: number;
    scores: { userId: string; score: number }[];
  }[];
}

export interface UpdateScoresPayload {
  sets: {
    setNumber: number;
    scores: { userId: string; score: number }[];
  }[];
}

export interface MatchListItem {
  id: string;
  createdBy: string;
  status: MatchStatus;
  type: MatchType;
  createdAt: string;
  scheduledAt: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  venueOrganizationId: string | null;
  participants: MatchParticipant[];
  sets: MatchSet[];
  comments: MatchComment[];
}

export interface MatchListResponse {
  matches: MatchListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MatchFilters {
  status?: MatchStatus;
  type?: MatchType;
  page?: number;
  limit?: number;
  participantOnly?: boolean;
  organizationId?: string;
}
