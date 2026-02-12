import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  OrganizationFull,
  OrganizationMember,
  OrganizationInvitation,
  OrganizationStats,
  SearchOrganization,
} from "@/types/organization";

export function useOrganization(orgId: string | undefined) {
  return useQuery({
    queryKey: ["organization", orgId],
    queryFn: () =>
      apiClient<OrganizationFull>(`/organization/get-full-organization?organizationId=${orgId}`),
    enabled: !!orgId,
  });
}

export function useOrganizationMembers(
  orgId: string | undefined,
  params?: { limit?: number; offset?: number },
) {
  const searchParams = new URLSearchParams();
  if (orgId) searchParams.set("organizationId", orgId);
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.offset) searchParams.set("offset", String(params.offset));
  const qs = searchParams.toString();

  return useQuery({
    queryKey: ["organization-members", orgId, params],
    queryFn: () =>
      apiClient<{ members: OrganizationMember[]; total: number }>(
        `/organization/list-members?${qs}`,
      ),
    enabled: !!orgId,
  });
}

export function useOrganizationStats(orgId: string | undefined) {
  return useQuery({
    queryKey: ["organization-stats", orgId],
    queryFn: () =>
      apiClient<OrganizationStats>(`/organization/get-organization-stats?organizationId=${orgId}`),
    enabled: !!orgId,
  });
}

export function useOrganizationInvitations(orgId: string | undefined) {
  return useQuery({
    queryKey: ["organization-invitations", orgId],
    queryFn: () =>
      apiClient<{ invitations: OrganizationInvitation[]; total: number }>(
        `/organization/list-invitations?organizationId=${orgId}`,
      ),
    enabled: !!orgId,
  });
}

export function useUserInvitations() {
  return useQuery({
    queryKey: ["user-invitations"],
    queryFn: () => apiClient<OrganizationInvitation[]>("/organization/list-user-invitations"),
  });
}

export function useSearchOrganizations(query: string) {
  return useQuery({
    queryKey: ["organizations", "search", query],
    queryFn: () =>
      apiClient<SearchOrganization[]>(`/organization/search?query=${encodeURIComponent(query)}`),
    enabled: query.length >= 1,
  });
}

export function useMyOrganizations() {
  return useQuery({
    queryKey: ["my-organizations"],
    queryFn: () =>
      apiClient<{ id: string; name: string; slug: string; logo: string | null; role: string }[]>(
        "/organization/list-organizations-user",
      ),
  });
}

export function useActiveMember() {
  return useQuery({
    queryKey: ["active-member"],
    queryFn: () =>
      apiClient<{ memberId: string; role: string; organizationId: string } | null>(
        "/organization/get-active-member",
      ),
  });
}

export function useOrganizationPin(orgId: string | undefined) {
  return useQuery({
    queryKey: ["organization-pin", orgId],
    queryFn: () =>
      apiClient<{ pin: string; pinEnabled: boolean }>(
        `/organization/get-pin?organizationId=${orgId}`,
      ),
    enabled: !!orgId,
  });
}
