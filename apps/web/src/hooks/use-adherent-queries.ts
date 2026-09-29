import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { AdherentEvent, MyEventRegistration, PublicOrganization } from "@/types/adherent"

/** No auth required — this is what a visitor sees before signing in. */
export function usePublicOrganization(slug: string) {
  return useQuery({
    queryKey: ["adherent-public-org", slug],
    queryFn: () => apiClient<PublicOrganization>(`/organization/public-by-slug?slug=${encodeURIComponent(slug)}`),
    enabled: !!slug,
    retry: false,
  })
}

/** Also doubles as the "am I a member of this club?" probe (403 when not). */
export function useAdherentBookingEnabled(organizationId: string | undefined) {
  return useQuery({
    queryKey: ["adherent-booking-enabled", organizationId],
    queryFn: () => apiClient<{ enabled: boolean }>(`/court/booking-enabled?organizationId=${organizationId}`),
    enabled: !!organizationId,
    retry: false,
  })
}

export function useAdherentEvents(organizationId: string | undefined) {
  return useQuery({
    queryKey: ["adherent-events", organizationId],
    queryFn: () =>
      apiClient<{ data: AdherentEvent[]; hasMore: boolean }>(
        `/event/list?organizationId=${organizationId}&limit=50`,
      ),
    enabled: !!organizationId,
    retry: false,
  })
}

/** All of my upcoming registrations (any status), used to merge `userRegistrationStatus`
 * into the /event/list results above — avoids an N+1 call per event. */
export function useMyEventRegistrations(enabled: boolean) {
  return useQuery({
    queryKey: ["adherent-my-event-registrations"],
    queryFn: () => apiClient<MyEventRegistration[]>(`/event/list-my-events?timeFilter=upcoming&limit=50`),
    enabled,
    retry: false,
  })
}
