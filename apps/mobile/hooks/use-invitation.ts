import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invitationService } from "@/services/invitation";
import { queryKeys } from "@/lib/query-keys";
import type { CreateInvitationRequest } from "@/types/invitation";

export function useInvitations(organizationId?: string) {
  return useQuery({
    queryKey: queryKeys.invitation.list({ organizationId }),
    queryFn: () => invitationService.listInvitations(organizationId),
  });
}

export function useUserInvitations() {
  return useQuery({
    queryKey: [...queryKeys.invitation.all, "user"] as const,
    queryFn: invitationService.listUserInvitations,
  });
}

export function useInvitation(id: string) {
  return useQuery({
    queryKey: queryKeys.invitation.detail(id),
    queryFn: () => invitationService.getInvitation(id),
    enabled: !!id,
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInvitationRequest) => invitationService.createInvitation(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invitation.all });
    },
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => invitationService.acceptInvitation(invitationId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invitation.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.organization.all });
    },
  });
}

export function useRejectInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => invitationService.rejectInvitation(invitationId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invitation.all });
    },
  });
}

export function useCancelInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => invitationService.cancelInvitation(invitationId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invitation.all });
    },
  });
}
