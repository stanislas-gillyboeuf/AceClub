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
      }
    }) =>
      apiClient("/admin/update-organization", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-organizations"] })
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
