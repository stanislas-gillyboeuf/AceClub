import type { Pagination } from "./common";
import type { Organization } from "./organization";
import type { User } from "./user";

export type MatchStatus = "pending" | "scheduled" | "in_progress" | "finished" | "cancelled";
export type MatchSide = "home" | "away";
export type MatchType = "singles" | "doubles";

export interface Match {
  id: string;
  createdBy: string;
  status: string;
  type?: string | null;
  createdAt: string;
  scheduledAt?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  venueOrganizationId?: string | null;
}

export interface MatchParticipant {
  id: string;
  matchId: string;
  userId: string;
  side: string;
  isWinner: boolean;
  createdAt: string;
  user?: User | null;
}

export interface MatchSet {
  id: string;
  matchId: string;
  setNumber: number;
  createdAt: string;
  scores?: SetScore[] | null;
}

export interface SetScore {
  participantId: string;
  userId: string;
  side?: string | null;
  games: number;
}

export interface MatchComment {
  id: string;
  matchId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string; image?: string | null } | null;
}

export interface MatchFeedback {
  id: string;
  matchId: string;
  userId: string;
  sensation: string;
  comment?: string | null;
  visibleToClub: boolean;
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
  comments?: MatchComment[] | null;
  myFeedback?: MatchFeedback | null;
  venueOrganization?: Organization | null;
  participantOrganizations?: ParticipantOrganization[] | null;
}

export interface MatchWithParticipants {
  id: string;
  createdBy: string;
  status: string;
  type?: string | null;
  createdAt: string;
  scheduledAt?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  venueOrganizationId?: string | null;
  participants: MatchParticipant[];
  sets?: MatchSet[] | null;
  comments?: MatchComment[] | null;
}

export interface ListMatchesResponse {
  matches: MatchWithParticipants[];
  pagination: Pagination;
}

export interface CreateMatchRequest {
  createdBy: string;
  status: string;
  type?: string | null;
  createdAt: string;
  scheduledAt?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  participants: { userId: string; side: string; isWinner?: boolean }[];
  sets: { setNumber: number; scores: { userId: string; score: number }[] }[];
}

export interface CreateMatchResponse {
  match: Match;
  participants: MatchParticipant[];
  sets: MatchSet[];
  scores: { setId: string; participantId: string; games: number }[];
}

export interface UpdateMatchRequest {
  status?: string | null;
  scheduledAt?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  winnerId?: string | null;
}

export interface UpdateMatchResponse {
  success: boolean;
  match: Match;
}

export interface UpdateMatchScoresRequest {
  sets: { setNumber: number; scores: { userId: string; score: number }[] }[];
}

export interface UpdateMatchScoresResponse {
  success: boolean;
  updatedScoresCount: number;
  updatedScores: { setId: string; participantId: string; games: number }[];
}

export interface CreateCommentRequest {
  content: string;
}

export interface CreateFeedbackRequest {
  sensation: string;
  comment?: string | null;
  visibleToClub: boolean;
}

export interface UpdateFeedbackRequest {
  sensation?: string | null;
  comment?: string | null;
  visibleToClub?: boolean | null;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}
