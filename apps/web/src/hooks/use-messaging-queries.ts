import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { BroadcastSegment, ListBroadcastsResponse, SegmentPreview } from "@/types/messaging"

export function useBroadcasts(organizationId: string, params?: { limit?: number; offset?: number }) {
  const searchParams = new URLSearchParams()
  searchParams.set("organizationId", organizationId)
  if (params?.limit) searchParams.set("limit", String(params.limit))
  if (params?.offset) searchParams.set("offset", String(params.offset))

  return useQuery({
    queryKey: ["broadcasts", organizationId, params],
    queryFn: () => apiClient<ListBroadcastsResponse>(`/messaging/list?${searchParams.toString()}`),
    enabled: !!organizationId,
  })
}

export function useSegmentPreview(organizationId: string, segment: BroadcastSegment) {
  return useQuery({
    queryKey: ["segment-preview", organizationId, segment],
    queryFn: () =>
      apiClient<SegmentPreview>(
        `/messaging/preview-segment?organizationId=${organizationId}&segment=${segment}`,
      ),
    enabled: !!organizationId,
  })
}
