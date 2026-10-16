import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { ClubNotificationSettings } from "@/types/notification-settings"

export function useClubNotificationSettings(organizationId: string) {
  return useQuery({
    queryKey: ["club-notification-settings", organizationId],
    queryFn: () =>
      apiClient<ClubNotificationSettings>(
        `/notification/club-settings?organizationId=${organizationId}`,
      ),
    enabled: !!organizationId,
  })
}
