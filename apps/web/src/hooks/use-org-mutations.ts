import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useJoinOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { organizationId: string; pin?: string }) =>
      apiClient("/organization/verify-pin", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-organizations"] });
      queryClient.invalidateQueries({ queryKey: ["user", "preferences"] });
    },
  });
}

export function useLeaveOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { organizationId: string }) =>
      apiClient("/organization/leave-organization", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-organizations"] });
      queryClient.invalidateQueries({ queryKey: ["user", "preferences"] });
    },
  });
}

export function useSetActiveOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { organizationId: string }) =>
      apiClient("/organization/set-active", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-member"] });
      queryClient.invalidateQueries({ queryKey: ["user", "preferences"] });
    },
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { organizationId: string; email: string; role: string }) =>
      apiClient("/organization/create-invitation", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-invitations"] });
    },
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { invitationId: string }) =>
      apiClient("/organization/accept-invitation", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-invitations"] });
      queryClient.invalidateQueries({ queryKey: ["my-organizations"] });
    },
  });
}

export function useRejectInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { invitationId: string }) =>
      apiClient("/organization/reject-invitation", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-invitations"] });
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      organizationId: string;
      name?: string;
      logo?: string;
      address?: string;
    }) => apiClient("/organization/update", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["organization", variables.organizationId] });
    },
  });
}

export function useTogglePin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { organizationId: string; enabled: boolean }) =>
      apiClient("/organization/toggle-pin", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["organization-pin", variables.organizationId] });
    },
  });
}

export function useRegeneratePin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { organizationId: string }) =>
      apiClient<{ pin: string; pinEnabled: boolean }>("/organization/regenerate-pin", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["organization-pin", variables.organizationId] });
    },
  });
}

export function useRequestClub() {
  return useMutation({
    mutationFn: (data: { name: string; city: string; email?: string }) =>
      apiClient("/organization/request-club", { method: "POST", body: JSON.stringify(data) }),
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { organizationId: string; memberId: string }) =>
      apiClient("/organization/remove-member", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["organization-members", variables.organizationId],
      });
    },
  });
}
