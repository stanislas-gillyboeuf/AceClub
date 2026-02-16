import { api } from "@/lib/api";
import type {
  Organization,
  FullOrganization,
  SearchOrganizationsResponse,
  ListMembersResponse,
  ActiveMember,
  Member,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  OrganizationPin,
  OrganizationStats,
  ClubRequestResponse,
} from "@/types/organization";

export const organizationService = {
  listOrganizationsUser: () =>
    api.get<Organization[]>("/organization/list-organizations-user"),

  listUserOrganizations: (userId: string) =>
    api.get<Organization[]>("/organization/list-user-organizations", { userId }),

  searchOrganizations: (query?: string, limit = 20, offset = 0) =>
    api.get<SearchOrganizationsResponse>("/organization/search", { query, limit, offset }),

  getFullOrganization: (organizationSlug: string) =>
    api.get<FullOrganization>("/organization/get-full-organization", { organizationSlug }),

  getOrganizationStats: (organizationId: string) =>
    api.get<OrganizationStats>("/organization/get-organization-stats", { organizationId }),

  setActiveOrganization: (data: { organizationSlug?: string; organizationId?: string }) =>
    api.post<void>("/organization/set-active", data),

  listMembers: (organizationId?: string) =>
    api.get<ListMembersResponse>("/organization/list-members", { organizationId }),

  getActiveMember: () =>
    api.get<ActiveMember | null>("/organization/get-active-member"),

  getActiveMemberRole: () =>
    api.get<{ role: string } | null>("/organization/get-active-member-role"),

  addMember: (data: { userId: string; role: string; organizationId?: string }) =>
    api.post<Member>("/organization/add-member", data),

  removeMember: (data: { memberIdOrEmail: string; organizationId?: string }) =>
    api.post<void>("/organization/remove-member", data),

  updateMemberRole: (data: { memberId: string; role: string; organizationId?: string }) =>
    api.post<Member>("/organization/update-member-role", data),

  leaveOrganization: (organizationId: string) =>
    api.post<void>("/organization/leave-organization", { organizationId }),

  createOrganization: (data: CreateOrganizationRequest) =>
    api.post<Organization>("/organization/create", data),

  updateOrganization: (data: UpdateOrganizationRequest) =>
    api.post<Organization>("/organization/update", data),

  getOrganizationPin: (organizationId: string) =>
    api.get<OrganizationPin>("/organization/get-pin", { organizationId }),

  toggleOrganizationPin: (data: { organizationId: string; enabled: boolean }) =>
    api.post<void>("/organization/toggle-pin", data),

  regenerateOrganizationPin: (organizationId: string) =>
    api.post<OrganizationPin>("/organization/regenerate-pin", { organizationId }),

  verifyPin: (data: { organizationId: string; pin: string }) =>
    api.post<{ valid: boolean }>("/organization/verify-pin", data),

  requestClub: (data: { name: string; city: string }) =>
    api.post<ClubRequestResponse>("/organization/request-club", data),
};
