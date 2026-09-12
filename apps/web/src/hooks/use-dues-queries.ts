import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type {
  DuesType,
  ListAssignmentsParams,
  ListAssignmentsResponse,
  MemberDuesHistoryItem,
} from "@/types/dues"

export function useDuesTypes(organizationId: string) {
  return useQuery({
    queryKey: ["dues-types", organizationId],
    queryFn: () => apiClient<DuesType[]>(`/dues/types?organizationId=${organizationId}`),
    enabled: !!organizationId,
  })
}

export function useDuesAssignments(params: ListAssignmentsParams) {
  const searchParams = new URLSearchParams()
  searchParams.set("organizationId", params.organizationId)
  if (params.duesTypeId) searchParams.set("duesTypeId", params.duesTypeId)
  if (params.status) searchParams.set("status", params.status)
  if (params.search) searchParams.set("search", params.search)
  if (params.limit) searchParams.set("limit", String(params.limit))
  if (params.offset) searchParams.set("offset", String(params.offset))

  return useQuery({
    queryKey: ["dues-assignments", params],
    queryFn: () =>
      apiClient<ListAssignmentsResponse>(`/dues/assignments?${searchParams.toString()}`),
    enabled: !!params.organizationId,
  })
}

export function useMemberDuesHistory(organizationId: string, userId: string | undefined) {
  return useQuery({
    queryKey: ["member-dues-history", organizationId, userId],
    queryFn: () =>
      apiClient<MemberDuesHistoryItem[]>(
        `/dues/member-history?organizationId=${organizationId}&userId=${userId}`,
      ),
    enabled: !!organizationId && !!userId,
  })
}
