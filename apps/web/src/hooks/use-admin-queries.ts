import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type {
  ListUsersParams,
  ListUsersResponse,
  ListOrganizationsParams,
  ListOrganizationsResponse,
  ListOrganizationMembersParams,
  ListOrganizationMembersResponse,
  ListOrganizationInvitationsParams,
  ListOrganizationInvitationsResponse,
  UserStats,
} from "@/types/admin"

export function useAdminUsers(params: ListUsersParams) {
  const searchParams = new URLSearchParams()

  if (params.searchValue) searchParams.set("searchValue", params.searchValue)
  if (params.searchField) searchParams.set("searchField", params.searchField)
  if (params.limit) searchParams.set("limit", String(params.limit))
  if (params.offset) searchParams.set("offset", String(params.offset))
  if (params.sortBy) searchParams.set("sortBy", params.sortBy)
  if (params.sortDirection) searchParams.set("sortDirection", params.sortDirection)
  if (params.filterField) searchParams.set("filterField", params.filterField)
  if (params.filterValue) searchParams.set("filterValue", params.filterValue)
  if (params.filterOperator) searchParams.set("filterOperator", params.filterOperator)

  const qs = searchParams.toString()

  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: () =>
      apiClient<ListUsersResponse>(`/admin/list-users${qs ? `?${qs}` : ""}`),
  })
}

export function useUserStats(userId: string | undefined) {
  return useQuery({
    queryKey: ["admin-user-stats", userId],
    queryFn: () => apiClient<UserStats>(`/admin/user-stats/${userId}`),
    enabled: !!userId,
  })
}

export function useAdminOrganizations(params: ListOrganizationsParams) {
  const searchParams = new URLSearchParams()

  if (params.searchValue) searchParams.set("searchValue", params.searchValue)
  if (params.limit) searchParams.set("limit", String(params.limit))
  if (params.offset) searchParams.set("offset", String(params.offset))

  const qs = searchParams.toString()

  return useQuery({
    queryKey: ["admin-organizations", params],
    queryFn: () =>
      apiClient<ListOrganizationsResponse>(
        `/admin/list-organizations${qs ? `?${qs}` : ""}`,
      ),
  })
}

export function useOrganizationMembers(
  params: ListOrganizationMembersParams,
) {
  const searchParams = new URLSearchParams()

  searchParams.set("organizationId", params.organizationId)
  if (params.limit) searchParams.set("limit", String(params.limit))
  if (params.offset) searchParams.set("offset", String(params.offset))

  const qs = searchParams.toString()

  return useQuery({
    queryKey: ["admin-organization-members", params],
    queryFn: () =>
      apiClient<ListOrganizationMembersResponse>(
        `/admin/list-organization-members?${qs}`,
      ),
    enabled: !!params.organizationId,
  })
}

export function useOrganizationInvitations(
  params: ListOrganizationInvitationsParams,
) {
  const searchParams = new URLSearchParams()
  searchParams.set("organizationId", params.organizationId)
  const qs = searchParams.toString()

  return useQuery({
    queryKey: ["admin-organization-invitations", params],
    queryFn: () =>
      apiClient<ListOrganizationInvitationsResponse>(
        `/admin/list-organization-invitations?${qs}`,
      ),
    enabled: !!params.organizationId,
  })
}
