import type { MemberRole, Organization } from "./organization";

export type InvitationStatus = "pending" | "accepted" | "rejected" | "canceled";

export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  role: MemberRole;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string | null;
  inviterId: string;
  organizationName: string | null;
  organization: Organization | null;
}
