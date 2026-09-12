import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { AdminBoard, Court, CourtSettings, CourtSport, SearchMemberResult } from "@/types/court"

export function useClubCourts(organizationId: string) {
  return useQuery({
    queryKey: ["club-courts", organizationId],
    queryFn: () =>
      apiClient<Court[]>(`/court/list-all-for-org?organizationId=${organizationId}`),
    enabled: !!organizationId,
  })
}

export function useClubCourtSettings(organizationId: string) {
  return useQuery({
    queryKey: ["club-court-settings", organizationId],
    queryFn: () => apiClient<CourtSettings>(`/court/settings?organizationId=${organizationId}`),
    enabled: !!organizationId,
  })
}

export function useAdminBoard(organizationId: string, sport: CourtSport, date: string) {
  return useQuery({
    queryKey: ["club-admin-board", organizationId, sport, date],
    queryFn: () =>
      apiClient<AdminBoard>(
        `/court/admin-board?organizationId=${organizationId}&sport=${sport}&date=${date}`,
      ),
    enabled: !!organizationId && !!date,
  })
}

export function useSearchClubMembers(organizationId: string, query: string) {
  return useQuery({
    queryKey: ["club-court-search-members", organizationId, query],
    queryFn: () =>
      apiClient<SearchMemberResult[]>(
        `/court/search-members?organizationId=${organizationId}&query=${encodeURIComponent(query)}`,
      ),
    enabled: !!organizationId && query.length > 0,
  })
}
