import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type {
  AdherentBooking,
  AdherentEvent,
  AdherentMember,
  CourtBoard,
  CourtSettings,
  CourtSport,
  MyEventRegistration,
  PublicOrganization,
} from "@/types/adherent"

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

/** Same day/sport grid the mobile app's booking screen reads — all active courts, hour by hour. */
export function useAdherentBoard(organizationId: string | undefined, sport: CourtSport, date: string) {
  return useQuery({
    queryKey: ["adherent-board", organizationId, sport, date],
    queryFn: () => apiClient<CourtBoard>(`/court/board?organizationId=${organizationId}&sport=${sport}&date=${date}`),
    enabled: !!organizationId,
    retry: false,
  })
}

export function useAdherentCourtSettings(organizationId: string | undefined) {
  return useQuery({
    queryKey: ["adherent-court-settings", organizationId],
    queryFn: () => apiClient<CourtSettings>(`/court/settings?organizationId=${organizationId}`),
    enabled: !!organizationId,
    retry: false,
  })
}

/** Global across all of the user's clubs server-side — callers filter to `organizationId`. */
export function useAdherentMyBookings(organizationId: string | undefined) {
  return useQuery({
    queryKey: ["adherent-my-bookings"],
    queryFn: () => apiClient<AdherentBooking[]>(`/court/my-bookings?filter=upcoming`),
    select: (bookings) => bookings.filter((b) => b.organizationId === organizationId),
    enabled: !!organizationId,
    retry: false,
  })
}

export function useAdherentSearchMembers(organizationId: string | undefined, query: string) {
  return useQuery({
    queryKey: ["adherent-search-members", organizationId, query],
    queryFn: () =>
      apiClient<AdherentMember[]>(
        `/court/search-members?organizationId=${organizationId}&query=${encodeURIComponent(query)}`,
      ),
    enabled: !!organizationId && query.length >= 2,
    retry: false,
  })
}
