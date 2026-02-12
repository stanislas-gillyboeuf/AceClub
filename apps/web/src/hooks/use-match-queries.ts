import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Match, MatchListItem, MatchIntent, MatchRequest, MatchDetailResponse } from "@/types/match";

export function useMatches(params?: { status?: string; limit?: number; offset?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.offset) searchParams.set("offset", String(params.offset));
  const qs = searchParams.toString();

  return useQuery({
    queryKey: ["matches", params],
    queryFn: () =>
      apiClient<{ matches: MatchListItem[]; total: number }>(`/match${qs ? `?${qs}` : ""}`),
  });
}

export function useMatch(id: string | undefined) {
  return useQuery({
    queryKey: ["match", id],
    queryFn: async (): Promise<Match> => {
      const res = await apiClient<MatchDetailResponse>(`/match/${id}`);
      return {
        id: res.match.id,
        organizationId: res.match.organizationId,
        createdBy: res.match.createdBy,
        type: res.match.type,
        status: res.match.status,
        scheduledAt: res.match.scheduledAt,
        startedAt: res.match.startedAt,
        finishedAt: res.match.finishedAt,
        createdAt: res.match.createdAt,
        updatedAt: res.match.updatedAt,
        venue: res.venueOrganization
          ? {
              id: res.venueOrganization.id,
              name: res.venueOrganization.name,
              address: res.venueOrganization.address,
              latitude: res.venueOrganization.latitude,
              longitude: res.venueOrganization.longitude,
            }
          : null,
        participants: res.participants,
        sets: res.sets,
        comments: res.comments.map((c) => ({
          id: c.id,
          userId: c.userId,
          userName: c.user?.name ?? "Utilisateur",
          userImage: c.user?.image ?? null,
          content: c.content,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        })),
        feedback: res.myFeedback
          ? [
              {
                id: res.myFeedback.id,
                userId: res.myFeedback.userId,
                userName: "",
                rating: 0,
                comment: res.myFeedback.comment,
                createdAt: res.myFeedback.createdAt,
              },
            ]
          : [],
      };
    },
    enabled: !!id,
  });
}

export function useMatchIntents() {
  return useQuery({
    queryKey: ["match-intents"],
    queryFn: () =>
      apiClient<{
        data: MatchIntent[];
        pagination: { nextCursor: string | null; hasMore: boolean; limit: number };
      }>("/match-intents"),
  });
}

export function useDiscoverFeed() {
  return useQuery({
    queryKey: ["match-intents", "discover"],
    queryFn: () =>
      apiClient<{
        data: MatchIntent[];
        pagination: { nextCursor: string | null; hasMore: boolean; limit: number };
        isDiscoveryRestricted: boolean;
      }>("/match-intents/discover"),
  });
}

export function useMatchRequests() {
  return useQuery({
    queryKey: ["match-intents", "requests"],
    queryFn: () => apiClient<MatchRequest[]>("/match-intents/requests"),
  });
}
