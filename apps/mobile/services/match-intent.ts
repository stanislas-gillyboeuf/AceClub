import { api } from "@/lib/api";
import type {
  ListMatchIntentsResponse,
  DiscoverResponse,
  DiscoverResponseRaw,
  DiscoverItemRaw,
  MatchIntentWithUser,
  MatchRequestWithDetails,
  CreateMatchIntentRequest,
  MatchIntent,
  SwipeRequest,
  SwipeResponse,
  AcceptMatchRequestResponse,
  RejectMatchRequestResponse,
} from "@/types/match-intent";

/** Map a flat discover API item to the nested MatchIntentWithUser structure */
function mapDiscoverItem(raw: DiscoverItemRaw): MatchIntentWithUser {
  return {
    intent: {
      id: raw.id,
      userId: raw.userId,
      type: raw.type,
      status: raw.status,
      date: raw.date,
      time: raw.time,
      duration: raw.duration,
      description: raw.description,
      createdAt: raw.createdAt,
    },
    user: raw.user,
    distance: raw.distance,
  };
}

export const matchIntentService = {
  listMatchIntents: (cursor?: string, limit = 20) =>
    api.get<ListMatchIntentsResponse>("/match-intents", { cursor, limit }),

  discover: async (params?: {
    cursor?: string;
    limit?: number;
    latitude?: number;
    longitude?: number;
    radius?: number;
  }): Promise<DiscoverResponse> => {
    const raw = await api.get<DiscoverResponseRaw>("/match-intents/discover", {
      limit: params?.limit ?? 20,
      ...params,
    });
    return {
      data: raw.data.map(mapDiscoverItem),
      pagination: raw.pagination,
      isDiscoveryRestricted: raw.isDiscoveryRestricted,
    };
  },

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
