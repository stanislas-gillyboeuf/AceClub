import { api } from "@/lib/api";
import type {
  ListMatchIntentsResponse,
  DiscoverResponse,
  DiscoverResponseRaw,
  DiscoverItemRaw,
  MatchIntentWithUser,
  MatchRequestWithDetails,
  CreateMatchIntentRequest,
  CreateRequestRequest,
  CreateRequestResponse,
  MatchIntent,
  AcceptMatchRequestResponse,
  RejectMatchRequestResponse,
} from "@/types/match-intent";

/** Map a flat discover API item to the nested MatchIntentWithUser structure */
function mapDiscoverItem(raw: DiscoverItemRaw): MatchIntentWithUser {
  return {
    intent: {
      id: raw.id,
      userId: raw.userId,
      sport: raw.sport ?? null,
      type: raw.type as MatchIntent["type"],
      status: raw.status as MatchIntent["status"],
      date: raw.date ?? null,
      time: raw.time ?? null,
      isFlexibleDate: raw.isFlexibleDate,
      duration: raw.duration ?? 60,
      description: raw.description,
      createdAt: raw.createdAt,
    },
    user: raw.user,
    distance: raw.distance,
    myRequestStatus: raw.myRequestStatus,
    myRequestSlotIndex: raw.myRequestSlotIndex,
    teammates: raw.teammates,
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
    sport?: "tennis" | "padel";
    levels?: string[];
  }): Promise<DiscoverResponse> => {
    const { levels, ...rest } = params ?? {};
    const raw = await api.get<DiscoverResponseRaw>("/match-intents/discover", {
      limit: params?.limit ?? 20,
      ...rest,
      levels: levels && levels.length > 0 ? levels.join(",") : undefined,
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

  createRequest: (matchIntentId: string, data: CreateRequestRequest) =>
    api.post<CreateRequestResponse>(`/match-intents/${matchIntentId}/request`, data),

  acceptRequest: (id: string) =>
    api.post<AcceptMatchRequestResponse>(`/match-intents/requests/${id}/accept`),

  rejectRequest: (id: string) =>
    api.post<RejectMatchRequestResponse>(`/match-intents/requests/${id}/reject`),

  deleteMatchIntent: (id: string) =>
    api.delete<void>(`/match-intents/${id}`),
};
