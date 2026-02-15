import type { CursorPagination } from "./common";

export type MatchIntentStatus = "active" | "expired" | "matched";
export type MatchIntentType = "singles" | "doubles";
export type MatchRequestStatus = "pending" | "accepted" | "rejected";

export interface MatchIntent {
  id: string;
  userId: string;
  type: string;
  status: string;
  sport: string;
  scheduledDate?: string | null;
  scheduledTime?: string | null;
  organizationId?: string | null;
  message?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  expiresAt?: string | null;
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
  organization?: OrganizationBrief | null;
}

export interface MatchIntentWithUser {
  intent: MatchIntent;
  user?: UserBrief | null;
  distance?: number | null;
}

export interface ListMatchIntentsResponse {
  data: MatchIntent[];
  pagination: CursorPagination;
}

export interface DiscoverResponse {
  data: MatchIntentWithUser[];
  pagination: CursorPagination;
  isDiscoveryRestricted: boolean;
}

export interface CreateMatchIntentRequest {
  type: string;
  sport: string;
  scheduledDate?: string | null;
  scheduledTime?: string | null;
  organizationId?: string | null;
  message?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface SwipeRequest {
  matchIntentId: string;
  action: "like" | "pass";
}

export interface SwipeResponse {
  matchRequest?: MatchRequest | null;
  message?: string | null;
}

export interface MatchRequest {
  id: string;
  matchIntentId: string;
  requesterId: string;
  receiverId: string;
  status: string;
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
  phoneNumber?: string | null;
}

export interface AcceptMatchRequestResponse {
  match?: { id: string } | null;
  request?: MatchRequest | null;
  requester?: UserContact | null;
  conversationId?: string | null;
  message?: string | null;
}

export interface RejectMatchRequestResponse {
  request?: MatchRequest | null;
  message?: string | null;
}
