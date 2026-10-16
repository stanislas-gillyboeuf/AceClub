import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient } from "@/lib/api-client"
import type { UpsertClubNotificationSettingsInput } from "@/types/notification-settings"

export function useUpdateClubNotificationSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpsertClubNotificationSettingsInput) =>
      apiClient("/notification/club-settings/update", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast.success("Réglages enregistrés")
    },
    onError: () => {
      toast.error("Échec de l'enregistrement")
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["club-notification-settings", variables.organizationId],
      })
    },
  })
}
