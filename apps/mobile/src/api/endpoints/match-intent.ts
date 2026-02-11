import { apiClient } from "../client";
import type {
  MatchIntent,
  DiscoverListResult,
  SwipeResult,
  MatchRequestWithDetails,
  AcceptMatchRequestResult,
} from "@/types/match-intent";

interface MyIntentsResponse {
  data: MatchIntent[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
}

export const matchIntentApi = {
  /** GET /match-intent — list current user's intents */
  async getMyIntents(): Promise<MyIntentsResponse> {
    return apiClient.get("match-intent").json<MyIntentsResponse>();
  },

  /** POST /match-intent — create a new intent */
  async create(data: {
    type?: string;
    date?: string;
    time?: string;
    duration: number;
    description?: string;
  }): Promise<MatchIntent> {
    return apiClient
      .post("match-intent", { json: data })
      .json<MatchIntent>();
  },

  /** DELETE /match-intent/:id */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`match-intent/${id}`);
  },

  /** GET /match-intent/discover */
  async discover(params: {
    latitude?: number;
    longitude?: number;
    radius?: number;
    cursor?: string;
    limit?: number;
  }): Promise<DiscoverListResult> {
    // Build searchParams manually to avoid serialization issues with numbers
    const searchParams: Record<string, string> = {};
    if (params.latitude != null)
      searchParams.latitude = String(params.latitude);
    if (params.longitude != null)
      searchParams.longitude = String(params.longitude);
    if (params.radius != null) searchParams.radius = String(params.radius);
    if (params.cursor) searchParams.cursor = params.cursor;
    if (params.limit != null) searchParams.limit = String(params.limit);

    return apiClient
      .get("match-intent/discover", { searchParams })
      .json<DiscoverListResult>();
  },

  /** POST /match-intent/swipe — body: { matchIntentId, action } */
  async swipe(
    matchIntentId: string,
    action: "like" | "pass"
  ): Promise<SwipeResult> {
    return apiClient
      .post("match-intent/swipe", { json: { matchIntentId, action } })
      .json<SwipeResult>();
  },

  /** GET /match-intent/requests — received requests */
  async getReceivedRequests(): Promise<MatchRequestWithDetails[]> {
    return apiClient
      .get("match-intent/requests")
      .json<MatchRequestWithDetails[]>();
  },

  /** POST /match-intent/requests/:id/accept */
  async acceptRequest(
    requestId: string
  ): Promise<AcceptMatchRequestResult> {
    return apiClient
      .post(`match-intent/requests/${requestId}/accept`)
      .json<AcceptMatchRequestResult>();
  },

  /** POST /match-intent/requests/:id/reject */
  async rejectRequest(requestId: string): Promise<void> {
    await apiClient.post(`match-intent/requests/${requestId}/reject`);
  },
};
