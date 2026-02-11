import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationApi } from "@/api/endpoints/organization";

export function useMyInvitations() {
  return useQuery({
    queryKey: ["invitations", "my"],
    queryFn: () => organizationApi.listUserInvitations(),
  });
}

export function useOrgInvitations(organizationId: string) {
  return useQuery({
    queryKey: ["invitations", "org", organizationId],
    queryFn: () => organizationApi.listInvitations(organizationId),
    enabled: !!organizationId,
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      email: string;
      role?: string;
      organizationId?: string;
    }) => organizationApi.createInvitation(data),
    onSuccess: (_, { organizationId }) => {
      queryClient.invalidateQueries({
        queryKey: ["invitations", "org", organizationId],
      });
    },
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      organizationApi.acceptInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      queryClient.invalidateQueries({ queryKey: ["organization"] });
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useRejectInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      organizationApi.rejectInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
  });
}

export function useCancelInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      organizationApi.cancelInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
  });
}
