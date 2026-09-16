import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type {
  ListClubMembersParams,
  ListClubMembersResponse,
  ClubMemberDetail,
  ClubMemberNote,
  UpcomingBookingsResponse,
} from "@/types/club-admin"

export function useClubMembers(params: ListClubMembersParams) {
  const searchParams = new URLSearchParams()
  searchParams.set("organizationId", params.organizationId)
  if (params.search) searchParams.set("search", params.search)
  if (params.limit) searchParams.set("limit", String(params.limit))
  if (params.offset) searchParams.set("offset", String(params.offset))

  return useQuery({
    queryKey: ["club-members", params],
    queryFn: () =>
      apiClient<ListClubMembersResponse>(`/club-member/list?${searchParams.toString()}`),
  })
}

export function useClubMemberDetail(organizationId: string, userId: string | undefined) {
  return useQuery({
    queryKey: ["club-member-detail", organizationId, userId],
    queryFn: () =>
      apiClient<ClubMemberDetail>(
        `/club-member/detail?organizationId=${organizationId}&userId=${userId}`,
      ),
    enabled: !!userId,
  })
}

export function useMemberNotes(organizationId: string, userId: string | undefined) {
  return useQuery({
    queryKey: ["club-member-notes", organizationId, userId],
    queryFn: () =>
      apiClient<ClubMemberNote[]>(
        `/club-member/list-notes?organizationId=${organizationId}&userId=${userId}`,
      ),
    enabled: !!userId,
  })
}

export function useMemberUpcomingBookings(organizationId: string, userId: string | undefined) {
  return useQuery({
    queryKey: ["club-member-upcoming-bookings", organizationId, userId],
    queryFn: () =>
      apiClient<UpcomingBookingsResponse>(
        `/club-member/upcoming-bookings?organizationId=${organizationId}&userId=${userId}`,
      ),
    enabled: !!userId,
  })
}
