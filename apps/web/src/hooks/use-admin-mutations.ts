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
