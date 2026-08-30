import type { CursorPagination } from "./common";

export type MatchIntentStatus = "pending" | "accepted" | "rejected";
export type MatchIntentType = "match" | "training";
export type MatchRequestStatus = "pending" | "accepted" | "rejected";

export interface MatchIntent {
  id: string;
  userId: string;
  date: string | null;
  time: string | null;
  isFlexibleDate: boolean;
  duration: number;
  type: MatchIntentType;
  description?: string | null;
  status: MatchIntentStatus;
  createdAt: string;
}

export interface OrganizationBrief {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
}

export interface UserBrief {
  id: string;
  name: string;
  image?: string | null;
  level: number;
  skillLevel?: string | null;
  sport?: string | null;
  organization?: OrganizationBrief | null;
}

export interface TeammateBrief {
  slotIndex: number;
  userId: string;
  name: string | null;
  image: string | null;
}

export interface MatchIntentWithUser {
  intent: MatchIntent;
  user?: UserBrief | null;
  distance?: number | null;
  myRequestStatus: MatchRequestStatus | null;
  myRequestSlotIndex: number | null;
  teammates: TeammateBrief[] | null;
}

export interface ListMatchIntentsResponse {
  data: MatchIntent[];
  pagination: CursorPagination;
}

/** Raw item from the discover API (flat structure) */
export interface DiscoverItemRaw {
  id: string;
  userId: string;
  type: string;
  status: string;
  date?: string | null;
  time?: string | null;
  isFlexibleDate: boolean;
  duration?: number | null;
  description?: string | null;
  createdAt: string;
  distance?: number | null;
  user?: UserBrief | null;
  myRequestStatus: MatchRequestStatus | null;
  myRequestSlotIndex: number | null;
  teammates: TeammateBrief[] | null;
}

/** Raw API response from /match-intents/discover */
export interface DiscoverResponseRaw {
  data: DiscoverItemRaw[];
  pagination: CursorPagination;
  isDiscoveryRestricted: boolean;
}

/** Mapped response used by the UI */
export interface DiscoverResponse {
  data: MatchIntentWithUser[];
  pagination: CursorPagination;
  isDiscoveryRestricted: boolean;
}

export interface CreateMatchIntentRequest {
  date?: string;
  time?: string;
  isFlexibleDate?: boolean;
  duration: number;
  type?: MatchIntentType;
  description?: string;
  teammateUserIds?: string[];
}

export interface CreateRequestRequest {
  slotIndex?: number;
}

export interface CreateRequestResponse {
  request: MatchRequest;
  conversationId: string;
  message: unknown;
}

export interface MatchRequest {
  id: string;
  matchIntentId: string;
  requesterId: string;
  receiverId: string;
  slotIndex: number | null;
  status: MatchRequestStatus;
  createdAt: string;
  respondedAt?: string | null;
}

export interface MatchRequestWithDetails extends MatchRequest {
  matchIntent?: MatchIntent | null;
  requester?: UserBrief | null;
}

export interface UserContact {
  id: string;
  name: string;
  image?: string | null;
}

export interface AcceptMatchRequestResponse {
  match?: { id: string } | null;
  request?: MatchRequest | null;
  requester?: UserContact | null;
  conversationId?: string | null;
  teamComplete?: boolean;
  message?: string | null;
}

export interface RejectMatchRequestResponse {
  request?: MatchRequest | null;
  message?: string | null;
}
