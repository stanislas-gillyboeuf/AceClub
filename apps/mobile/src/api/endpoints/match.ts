import { apiClient } from "../client";
import type {
  MatchListResponse,
  MatchDetail,
  MatchFilters,
  MatchComment,
  CreateMatchPayload,
  UpdateMatchPayload,
  UpdateScoresPayload,
} from "@/types/match";

export const matchApi = {
  async list(filters: MatchFilters = {}): Promise<MatchListResponse> {
    const searchParams: Record<string, string> = {};
    if (filters.status) searchParams.status = filters.status;
    if (filters.type) searchParams.type = filters.type;
    if (filters.page) searchParams.page = String(filters.page);
    if (filters.limit) searchParams.limit = String(filters.limit);
    if (filters.participantOnly) searchParams.participantOnly = "true";
    if (filters.organizationId)
      searchParams.organizationId = filters.organizationId;

    return apiClient
      .get("match", { searchParams })
      .json<MatchListResponse>();
  },

  async getDetail(id: string): Promise<MatchDetail> {
    return apiClient.get(`match/${id}`).json<MatchDetail>();
  },

  async create(data: CreateMatchPayload): Promise<MatchDetail> {
    return apiClient.post("match", { json: data }).json<MatchDetail>();
  },

  async update(id: string, data: UpdateMatchPayload): Promise<{ success: boolean; match: any }> {
    return apiClient
      .put(`match/${id}`, { json: data })
      .json();
  },

  async updateScores(id: string, data: UpdateScoresPayload): Promise<{ success: boolean }> {
    return apiClient
      .put(`match/${id}/scores`, { json: data })
      .json();
  },

  async updateVenue(id: string, venueOrganizationId: string | null): Promise<void> {
    await apiClient.put(`match/${id}/venue`, {
      json: { venueOrganizationId },
    });
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`match/${id}`);
  },

  // Comments - 1 per user per match
  async addComment(matchId: string, content: string): Promise<MatchComment> {
    return apiClient
      .post(`match/${matchId}/comment`, { json: { content } })
      .json<MatchComment>();
  },

  async updateComment(matchId: string, content: string): Promise<MatchComment> {
    return apiClient
      .put(`match/${matchId}/comment`, { json: { content } })
      .json<MatchComment>();
  },

  async deleteComment(matchId: string): Promise<void> {
    await apiClient.delete(`match/${matchId}/comment`);
  },
};
