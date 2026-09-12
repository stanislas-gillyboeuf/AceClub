import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { SendBroadcastInput } from "@/types/messaging"

export function useSendBroadcast() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SendBroadcastInput) =>
      apiClient("/messaging/send", { method: "POST", body: JSON.stringify(data) }),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["broadcasts", variables.organizationId] })
    },
  })
}
