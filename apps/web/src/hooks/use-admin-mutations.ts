import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"

export function useBanUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { userId: string; banReason?: string; banExpiresIn?: number }) =>
      apiClient("/admin/ban-user", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
  })
}

export function useUnbanUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { userId: string }) =>
      apiClient("/admin/unban-user", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
  })
}

export function useSetRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { userId: string; role: string }) =>
      apiClient("/admin/set-role", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
  })
}

export function useSetUserPassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { userId: string; newPassword: string }) =>
      apiClient("/admin/set-user-password", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { userId: string; data: Record<string, unknown> }) =>
      apiClient("/admin/update-user", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
  })
}

export function useRevokeUserSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { sessionToken: string }) =>
      apiClient("/admin/revoke-user-session", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-stats"] })
    },
  })
}

export function useCreateOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      name: string
      slug: string
      logo?: string
      metadata?: Record<string, unknown>
    }) =>
      apiClient("/organization/create", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-organizations"] })
      queryClient.invalidateQueries({ queryKey: ["admin-organization"] })
    },
  })
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      organizationId: string
      data: {
        name?: string
        slug?: string
        logo?: string
        metadata?: Record<string, unknown>
        address?: string
      }
    }) =>
      apiClient("/admin/update-organization", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-organizations"] })
      queryClient.invalidateQueries({ queryKey: ["admin-organization"] })
    },
  })
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { organizationId: string }) =>
      apiClient("/admin/delete-organization", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-organizations"] })
      queryClient.invalidateQueries({ queryKey: ["admin-organization"] })
    },
  })
}

export function useCreateInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      organizationId: string
      email: string
      role: string
    }) =>
      apiClient("/admin/create-organization-invitation", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-organization-invitations"],
      })
    },
  })
}

export function useCancelInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { invitationId: string }) =>
      apiClient("/admin/cancel-organization-invitation", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-organization-invitations"],
      })
    },
  })
}

export function useToggleOrganizationPin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { organizationId: string; enabled: boolean }) =>
      apiClient("/organization/toggle-pin", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-organizations"] })
      queryClient.invalidateQueries({ queryKey: ["admin-organization"] })
    },
  })
}

export function useRegenerateOrganizationPin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { organizationId: string }) =>
      apiClient("/organization/regenerate-pin", {
        method: "POST",
        body: JSON.stringify(data),
      }) as Promise<{ pin: string; pinEnabled: boolean }>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-organizations"] })
      queryClient.invalidateQueries({ queryKey: ["admin-organization"] })
    },
  })
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"

export function useUploadOrganizationLogo() {
  return useMutation({
    mutationFn: async (data: { image: File; organizationId: string }) => {
      const formData = new FormData()
      formData.append("image", data.image)
      formData.append("organizationId", data.organizationId)

      const res = await fetch(`${API_URL}/api/upload/organization-logo`, {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.message || `API error: ${res.status}`)
      }

      return res.json() as Promise<{ logoUrl: string }>
    },
  })
}

export function useCreateFeatureFlag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { key: string; enabled?: boolean; description?: string }) =>
      apiClient("/admin/feature-flags", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feature-flags"] })
    },
  })
}

export function useUpdateFeatureFlag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { id: string; enabled?: boolean; description?: string }) =>
      apiClient(`/admin/feature-flags/${data.id}`, {
        method: "PUT",
        body: JSON.stringify({ enabled: data.enabled, description: data.description }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feature-flags"] })
    },
  })
}

export function useDeleteFeatureFlag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { id: string }) =>
      apiClient(`/admin/feature-flags/${data.id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feature-flags"] })
    },
  })
}

export function useSetFeatureFlagOverride() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { flagId: string; organizationId: string; enabled: boolean }) =>
      apiClient(`/admin/feature-flags/${data.flagId}/overrides`, {
        method: "POST",
        body: JSON.stringify({
          organizationId: data.organizationId,
          enabled: data.enabled,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feature-flags"] })
    },
  })
}

export function useUpdateMatchDate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { matchId: string; scheduledAt: string | null }) =>
      apiClient("/admin/update-match", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-matches"] })
      queryClient.invalidateQueries({ queryKey: ["admin-match-detail"] })
    },
  })
}

export function useRemoveFeatureFlagOverride() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { flagId: string; orgId: string }) =>
      apiClient(`/admin/feature-flags/${data.flagId}/overrides/${data.orgId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feature-flags"] })
    },
  })
}

export function useAdminCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      name: string
      description?: string
      startDate: string
      endDate: string
      address?: string
      maxParticipants?: number
      isFree?: boolean
      price?: number
      paymentLink?: string
      visibility?: "public" | "organization"
      organizationId?: string
    }) =>
      apiClient("/event/create", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] })
    },
  })
}

export function useAdminUpdateEventStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { eventId: string; status: string }) =>
      apiClient("/event/admin-update-status", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] })
    },
  })
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { memberId: string; organizationId: string; role: "member" | "admin" | "owner" }) =>
      apiClient("/admin/update-member-role", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-organization-members"] })
    },
  })
}

export function useAdminDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { eventId: string }) =>
      apiClient("/event/admin-delete", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] })
    },
  })
}

export function useProcessDeletionRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { requestId: string; status: "processed" | "rejected" }) =>
      apiClient("/admin/process-deletion-request", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-deletion-requests"] })
    },
  })
}

// Game Config
export function useUpdateGameConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { id: string; value: string }) =>
      apiClient(`/admin/game-config/${data.id}`, {
        method: "PUT",
        body: JSON.stringify({ value: data.value }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-game-config"] })
    },
  })
}

export function useResetGameConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      apiClient("/admin/game-config/reset", {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-game-config"] })
    },
  })
}

// Challenge Templates
export function useCreateChallengeTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      code: string
      type: string
      difficulty: string
      titleFr: string
      titleEn: string
      descriptionFr: string
      descriptionEn: string
      targetValue: number
      acesReward: number
      minLevel?: number
      maxLevel?: number | null
      isActive?: boolean
    }) =>
      apiClient("/admin/challenge-templates", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-challenge-templates"] })
    },
  })
}

export function useUpdateChallengeTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { id: string; [key: string]: unknown }) => {
      const { id, ...rest } = data
      return apiClient(`/admin/challenge-templates/${id}`, {
        method: "PUT",
        body: JSON.stringify(rest),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-challenge-templates"] })
    },
  })
}

export function useDeleteChallengeTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { id: string }) =>
      apiClient(`/admin/challenge-templates/${data.id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-challenge-templates"] })
    },
  })
}

export function useAssignChallengeTemplateNow() {
  return useMutation({
    mutationFn: (data: { id: string }) =>
      apiClient<{ assignedCount: number; skippedCount: number }>(
        `/admin/challenge-templates/${data.id}/assign-now`,
        { method: "POST" },
      ),
  })
}

// Badges
export function useCreateBadge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      code: string
      category: string
      nameFr: string
      nameEn: string
      descriptionFr: string
      descriptionEn: string
      imageUrl: string
      requiredLevel?: number | null
      displayOrder?: number
      isActive?: boolean
    }) =>
      apiClient("/admin/badges", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-badges"] })
    },
  })
}

export function useUpdateBadge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { id: string; [key: string]: unknown }) => {
      const { id, ...rest } = data
      return apiClient(`/admin/badges/${id}`, {
        method: "PUT",
        body: JSON.stringify(rest),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-badges"] })
    },
  })
}

export function useDeleteBadge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { id: string }) =>
      apiClient(`/admin/badges/${data.id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-badges"] })
    },
  })
}
