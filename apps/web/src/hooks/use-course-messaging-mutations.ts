import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient } from "@/lib/api-client"

export function useUpdateCourseMessagingSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { organizationId: string; enabled: boolean }) =>
      apiClient("/course/messaging-settings", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success("Réglages enregistrés")
    },
    onError: () => {
      toast.error("Échec de l'enregistrement")
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["course-messaging-settings", variables.organizationId] })
    },
  })
}

export function useArchiveGroup(organizationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ conversationId, isArchived }: { conversationId: string; isArchived: boolean }) =>
      apiClient(`/conversation/${conversationId}/archive`, {
        method: "POST",
        body: JSON.stringify({ isArchived }),
      }),
    onSuccess: (_data, variables) => {
      toast.success(variables.isArchived ? "Groupe archivé" : "Groupe réactivé")
    },
    onError: () => {
      toast.error("Échec de l'opération")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["club-groups", organizationId] })
    },
  })
}
