import { api } from "@/lib/api";
import type {
  ListMatchIntentsResponse,
  DiscoverResponse,
  MatchRequestWithDetails,
  CreateMatchIntentRequest,
  MatchIntent,
  SwipeRequest,
  SwipeResponse,
  AcceptMatchRequestResponse,
  RejectMatchRequestResponse,
} from "@/types/match-intent";

export const matchIntentService = {
  listMatchIntents: (cursor?: string, limit = 20) =>
    api.get<ListMatchIntentsResponse>("/match-intents", { cursor, limit }),

  discover: (params?: {
    cursor?: string;
    limit?: number;
    latitude?: number;
    longitude?: number;
    radius?: number;
  }) =>
    api.get<DiscoverResponse>("/match-intents/discover", {
      limit: params?.limit ?? 20,
      ...params,
    }),

  listRequests: () =>
    api.get<MatchRequestWithDetails[]>("/match-intents/requests"),

  createMatchIntent: (data: CreateMatchIntentRequest) =>
    api.post<MatchIntent>("/match-intents", data),

  swipe: (data: SwipeRequest) =>
    api.post<SwipeResponse>("/match-intents/swipe", data),

  acceptRequest: (id: string) =>
    api.post<AcceptMatchRequestResponse>(`/match-intents/requests/${id}/accept`),

  rejectRequest: (id: string) =>
    api.post<RejectMatchRequestResponse>(`/match-intents/requests/${id}/reject`),

  deleteMatchIntent: (id: string) =>
    api.delete<void>(`/match-intents/${id}`),
};
