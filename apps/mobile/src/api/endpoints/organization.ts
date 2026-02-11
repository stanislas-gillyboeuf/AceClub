import { apiClient } from "../client";
import type {
  Organization,
  FullOrganization,
  Member,
  OrganizationStats,
  OrganizationSearchResult,
  MemberRole,
} from "@/types/organization";
import type { Invitation } from "@/types/invitation";

export const organizationApi = {
  async getFullOrganization(params: {
    organizationSlug: string;
    organizationId?: string;
    membersLimit?: number;
  }): Promise<FullOrganization> {
    return apiClient
      .get("organization/get-full-organization", { searchParams: params })
      .json<FullOrganization>();
  },

  async listUserOrganizations(): Promise<Organization[]> {
    return apiClient
      .get("organization/list-organizations-user")
      .json<Organization[]>();
  },

  async getStats(organizationId: string): Promise<OrganizationStats> {
    return apiClient
      .get("organization/get-organization-stats", {
        searchParams: { organizationId },
      })
      .json<OrganizationStats>();
  },

  async listMembers(params: {
    organizationId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ members: Member[] }> {
    return apiClient
      .get("organization/list-members", { searchParams: params })
      .json<{ members: Member[] }>();
  },

  async search(
    query?: string,
    limit?: number,
    offset?: number
  ): Promise<{
    organizations: OrganizationSearchResult[];
    total: number;
    hasMore: boolean;
  }> {
    const searchParams: Record<string, string | number> = {};
    if (query) searchParams.query = query;
    if (limit) searchParams.limit = limit;
    if (offset) searchParams.offset = offset;
    return apiClient
      .get("organization/search", { searchParams })
      .json<{
        organizations: OrganizationSearchResult[];
        total: number;
        hasMore: boolean;
      }>();
  },

  async update(data: {
    organizationId: string;
    data: Partial<Pick<Organization, "name" | "slug" | "logo" | "address">>;
  }): Promise<Organization> {
    return apiClient
      .post("organization/update", { json: data })
      .json<Organization>();
  },

  async leave(organizationId: string): Promise<void> {
    await apiClient.post("organization/leave-organization", {
      json: { organizationId },
    });
  },

  async removeMember(
    memberIdOrEmail: string,
    organizationId?: string
  ): Promise<void> {
    await apiClient.post("organization/remove-member", {
      json: { memberIdOrEmail, organizationId },
    });
  },

  async updateMemberRole(data: {
    memberId: string;
    role: MemberRole;
    organizationId?: string;
  }): Promise<void> {
    await apiClient.post("organization/update-member-role", { json: data });
  },

  // PIN management
  async getPin(organizationId: string): Promise<{ pin: string; pinEnabled: boolean }> {
    return apiClient
      .get("organization/get-pin", { searchParams: { organizationId } })
      .json<{ pin: string; pinEnabled: boolean }>();
  },

  async verifyPin(
    organizationId: string,
    pin: string
  ): Promise<{ valid: boolean }> {
    return apiClient
      .post("organization/verify-pin", {
        json: { organizationId, pin },
      })
      .json<{ valid: boolean }>();
  },

  async togglePin(
    organizationId: string,
    enabled: boolean
  ): Promise<void> {
    await apiClient.post("organization/toggle-pin", {
      json: { organizationId, enabled },
    });
  },

  async regeneratePin(organizationId: string): Promise<void> {
    await apiClient.post("organization/regenerate-pin", {
      json: { organizationId },
    });
  },

  // Invitations (all under organization/ router)
  async listInvitations(organizationId?: string): Promise<Invitation[]> {
    const searchParams: Record<string, string> = {};
    if (organizationId) searchParams.organizationId = organizationId;
    return apiClient
      .get("organization/list-invitations", { searchParams })
      .json<Invitation[]>();
  },

  async listUserInvitations(): Promise<Invitation[]> {
    return apiClient
      .get("organization/list-user-invitations")
      .json<Invitation[]>();
  },

  async createInvitation(data: {
    email: string;
    role?: string;
    organizationId?: string;
  }): Promise<Invitation> {
    return apiClient
      .post("organization/create-invitation", { json: data })
      .json<Invitation>();
  },

  async acceptInvitation(invitationId: string): Promise<void> {
    await apiClient.post("organization/accept-invitation", {
      json: { invitationId },
    });
  },

  async rejectInvitation(invitationId: string): Promise<void> {
    await apiClient.post("organization/reject-invitation", {
      json: { invitationId },
    });
  },

  async cancelInvitation(invitationId: string): Promise<void> {
    await apiClient.post("organization/cancel-invitation", {
      json: { invitationId },
    });
  },

  async requestClub(data: { name: string; city: string }): Promise<void> {
    await apiClient.post("organization/request-club", { json: data });
  },
};
