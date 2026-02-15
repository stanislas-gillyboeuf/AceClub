import { api } from "@/lib/api";
import type {
  Invitation,
  ListInvitationsResponse,
  CreateInvitationRequest,
  AcceptInvitationResponse,
} from "@/types/invitation";

export const invitationService = {
  listInvitations: (organizationId?: string) =>
    api.get<ListInvitationsResponse>("/invitation/list", { organizationId }),

  listUserInvitations: () =>
    api.get<Invitation[]>("/invitation/user"),

  getInvitation: (id: string) =>
    api.get<Invitation>(`/invitation/${id}`),

  createInvitation: (data: CreateInvitationRequest) =>
    api.post<Invitation>("/invitation/create", data),

  acceptInvitation: (invitationId: string) =>
    api.post<AcceptInvitationResponse>("/invitation/accept", { invitationId }),

  rejectInvitation: (invitationId: string) =>
    api.post<void>("/invitation/reject", { invitationId }),

  cancelInvitation: (invitationId: string) =>
    api.post<void>("/invitation/cancel", { invitationId }),
};
