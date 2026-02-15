import { api } from "@/lib/api";
import type {
  Invitation,
  ListInvitationsResponse,
  CreateInvitationRequest,
  AcceptInvitationResponse,
} from "@/types/invitation";

export const invitationService = {
  listInvitations: (organizationId?: string) =>
    api.get<ListInvitationsResponse>("/organization/list-invitations", { organizationId }),

  listUserInvitations: () =>
    api.get<Invitation[]>("/organization/list-user-invitations"),

  getInvitation: (id: string) =>
    api.get<Invitation>("/organization/get-invitation", { id }),

  createInvitation: (data: CreateInvitationRequest) =>
    api.post<Invitation>("/organization/create-invitation", data),

  acceptInvitation: (invitationId: string) =>
    api.post<AcceptInvitationResponse>("/organization/accept-invitation", { invitationId }),

  rejectInvitation: (invitationId: string) =>
    api.post<void>("/organization/reject-invitation", { invitationId }),

  cancelInvitation: (invitationId: string) =>
    api.post<void>("/organization/cancel-invitation", { invitationId }),
};
