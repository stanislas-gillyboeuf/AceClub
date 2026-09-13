import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"

export function useSetActiveClubOrganization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (organizationSlug: string) =>
      apiClient("/organization/set-active", {
        method: "POST",
        body: JSON.stringify({ organizationSlug }),
      }),
    onSuccess: () => {
      // session.activeOrganizationId isn't refetched by better-auth's client on its own —
      // a full reload keeps every club-scoped query (and the session itself) in sync.
      window.location.reload()
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["club-admin-access"] })
      queryClient.invalidateQueries({ queryKey: ["club-admin-organizations"] })
    },
  })
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (organizationId: string) =>
      apiClient("/organization/complete-onboarding", {
        method: "POST",
        body: JSON.stringify({ organizationId }),
      }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["club-admin-access"] })
    },
  })
}
