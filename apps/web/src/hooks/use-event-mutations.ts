import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { CreateEventData } from "@/types/event";

export function useRegisterEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { eventId: string }) =>
      apiClient("/event/register", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event"] });
      queryClient.invalidateQueries({ queryKey: ["my-events"] });
    },
  });
}

export function useCancelRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { eventId: string }) =>
      apiClient("/event/cancel-registration", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event"] });
      queryClient.invalidateQueries({ queryKey: ["my-events"] });
    },
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventData) =>
      apiClient("/event/create", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
