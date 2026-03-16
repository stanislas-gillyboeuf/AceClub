import { api } from "@/lib/api";
import type {
  MatchDetail,
  ListMatchesResponse,
  CreateMatchRequest,
  CreateMatchResponse,
  UpdateMatchRequest,
  UpdateMatchResponse,
  UpdateMatchScoresRequest,
  UpdateMatchScoresResponse,
  MatchComment,
  MatchPhoto,
  MatchFeedback,
  CreateCommentRequest,
  CreateFeedbackRequest,
  UpdateFeedbackRequest,
  DeleteResponse,
  ToggleLikeResponse,
} from "@/types/match";
import type { Organization } from "@/types/organization";

export const matchService = {
  getMatch: (id: string) =>
    api.get<MatchDetail>(`/match/${id}`),

  listMatches: (params?: {
    status?: string;
    userId?: string;
    organizationId?: string;
    participantOnly?: boolean;
    page?: number;
    limit?: number;
  }) =>
    api.get<ListMatchesResponse>("/match", {
      ...params,
      participantOnly: params?.participantOnly ?? true,
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
    }),

  createMatch: (data: CreateMatchRequest) =>
    api.post<CreateMatchResponse>("/match", data),

  updateMatch: (id: string, data: UpdateMatchRequest) =>
    api.put<UpdateMatchResponse>(`/match/${id}`, data),

  updateMatchScores: (id: string, data: UpdateMatchScoresRequest) =>
    api.put<UpdateMatchScoresResponse>(`/match/${id}/scores`, data),

  updateVenue: (id: string, venueOrganizationId: string | null) =>
    api.put<{ success: boolean; match: any; venueOrganization?: Organization }>(`/match/${id}/venue`, { venueOrganizationId }),

  deleteMatch: (id: string) =>
    api.delete<DeleteResponse>(`/match/${id}`),

  createComment: (matchId: string, data: CreateCommentRequest) =>
    api.post<MatchComment>(`/match/${matchId}/comment`, data),

  updateComment: (matchId: string, data: CreateCommentRequest) =>
    api.put<MatchComment>(`/match/${matchId}/comment`, data),

  deleteComment: (matchId: string) =>
    api.delete<DeleteResponse>(`/match/${matchId}/comment`),

  createFeedback: (matchId: string, data: CreateFeedbackRequest) =>
    api.post<MatchFeedback>(`/match/${matchId}/feedback`, data),

  updateFeedback: (matchId: string, data: UpdateFeedbackRequest) =>
    api.put<MatchFeedback>(`/match/${matchId}/feedback`, data),

  deleteFeedback: (matchId: string) =>
    api.delete<DeleteResponse>(`/match/${matchId}/feedback`),

  uploadMatchPhoto: (matchId: string, uri: string, fileName: string, mimeType: string) =>
    api.uploadMultipart<{ photo: MatchPhoto }>(`/match/${matchId}/photo`, "image", uri, fileName, mimeType),

  deleteMatchPhoto: (matchId: string) =>
    api.delete<DeleteResponse>(`/match/${matchId}/photo`),

  toggleLike: (matchId: string) =>
    api.post<ToggleLikeResponse>(`/match/${matchId}/like`),
};
