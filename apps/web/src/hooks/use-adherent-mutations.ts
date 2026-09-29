import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"

function settleAdherentEvents(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["adherent-events"] })
  queryClient.invalidateQueries({ queryKey: ["adherent-my-event-registrations"] })
}

export function useAdherentRegisterEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (eventId: string) =>
      apiClient("/event/register", { method: "POST", body: JSON.stringify({ eventId }) }),
    onSettled: () => settleAdherentEvents(queryClient),
  })
}

export function useAdherentCancelEventRegistration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (eventId: string) =>
      apiClient("/event/cancel-registration", { method: "POST", body: JSON.stringify({ eventId }) }),
    onSettled: () => settleAdherentEvents(queryClient),
  })
}
