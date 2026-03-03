import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invitationService } from "@/services/invitation";
import type { CreateInvitationRequest } from "@/types/invitation";

export function useInvitations(organizationId?: string) {
  return useQuery({
    queryKey: ["invitation", "list", organizationId],
    queryFn: () => invitationService.listInvitations(organizationId),
  });
}

export function useUserInvitations() {
  return useQuery({
    queryKey: ["invitation", "user"],
    queryFn: invitationService.listUserInvitations,
  });
}

export function useInvitation(id: string) {
  return useQuery({
    queryKey: ["invitation", id],
    queryFn: () => invitationService.getInvitation(id),
    enabled: !!id,
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInvitationRequest) => invitationService.createInvitation(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["invitation"] });
    },
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => invitationService.acceptInvitation(invitationId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["invitation"] });
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });
}

export function useRejectInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => invitationService.rejectInvitation(invitationId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["invitation"] });
    },
  });
}

export function useCancelInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => invitationService.cancelInvitation(invitationId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["invitation"] });
    },
  });
}
