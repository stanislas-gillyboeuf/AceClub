import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { ListUsersParams, ListUsersResponse, UserStats } from "@/types/admin"

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
