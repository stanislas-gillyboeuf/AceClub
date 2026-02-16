import type { MemberRole } from "./common";
import type { Organization } from "./organization";

export type InvitationStatus = "pending" | "accepted" | "rejected" | "canceled";

export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  role: MemberRole;
  status: InvitationStatus;
  expiresAt: string;
  createdAt?: string | null;
  inviterId: string;
  organizationName?: string | null;
  organization?: Organization | null;
}

export interface ListInvitationsResponse {
  invitations: Invitation[];
}

export interface CreateInvitationRequest {
  email: string;
  role: MemberRole;
  organizationId: string;
}

export interface AcceptInvitationResponse {
  member: {
    id: string;
    organizationId: string;
    userId: string;
    role: string;
    createdAt: string;
  };
  organization: Organization;
}
