import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type {
  BookForClubInput,
  CancelBookingInput,
  CreateCourtInput,
  UpdateCourtInput,
  UpsertCourtSettingsInput,
} from "@/types/court"

export function useCreateCourt() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCourtInput) =>
      apiClient("/court/create", { method: "POST", body: JSON.stringify(data) }),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["club-courts", variables.organizationId] })
    },
  })
}

export function useUpdateCourt() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateCourtInput) =>
      apiClient("/court/update", { method: "POST", body: JSON.stringify(data) }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["club-courts"] })
      queryClient.invalidateQueries({ queryKey: ["club-admin-board"] })
    },
  })
}

export function useUpsertClubCourtSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpsertCourtSettingsInput) =>
      apiClient("/court/settings/update", { method: "POST", body: JSON.stringify(data) }),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["club-court-settings", variables.organizationId],
      })
      queryClient.invalidateQueries({ queryKey: ["club-admin-board"] })
    },
  })
}

export function useBookForClub() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BookForClubInput) =>
      apiClient("/court/book-for-club", { method: "POST", body: JSON.stringify(data) }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["club-admin-board"] })
    },
  })
}

export function useCancelClubBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CancelBookingInput) =>
      apiClient("/court/cancel-booking", { method: "POST", body: JSON.stringify(data) }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["club-admin-board"] })
    },
  })
}
