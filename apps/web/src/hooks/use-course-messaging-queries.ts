import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { ClubGroup, CourseMessagingSettings } from "@/types/course-messaging"

export function useCourseMessagingSettings(organizationId: string) {
  return useQuery({
    queryKey: ["course-messaging-settings", organizationId],
    queryFn: () =>
      apiClient<CourseMessagingSettings>(`/course/messaging-settings?organizationId=${organizationId}`),
    enabled: !!organizationId,
  })
}

export function useClubGroups(organizationId: string) {
  return useQuery({
    queryKey: ["club-groups", organizationId],
    queryFn: () => apiClient<ClubGroup[]>(`/conversation/club-groups?organizationId=${organizationId}`),
    enabled: !!organizationId,
  })
}
