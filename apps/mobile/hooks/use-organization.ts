import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationService } from "@/services/organization";
import type { CreateOrganizationRequest, UpdateOrganizationRequest } from "@/types/organization";

export function useMyOrganizations() {
  return useQuery({
    queryKey: ["organization", "list"],
    queryFn: organizationService.listOrganizationsUser,
  });
}

export function useUserOrganizations(userId: string) {
  return useQuery({
    queryKey: ["organization", "user", userId],
    queryFn: () => organizationService.listUserOrganizations(userId),
    enabled: !!userId,
  });
}

export function useSearchOrganizations(query?: string, limit = 20, offset = 0) {
  return useQuery({
    queryKey: ["organization", "search", query, limit, offset],
    queryFn: () => organizationService.searchOrganizations(query, limit, offset),
  });
}

export function useFullOrganization(slug: string) {
  return useQuery({
    queryKey: ["organization", "full", slug],
    queryFn: () => organizationService.getFullOrganization(slug),
    enabled: !!slug,
  });
}

export function useOrganizationStats(organizationId: string) {
  return useQuery({
    queryKey: ["organization", "stats", organizationId],
    queryFn: () => organizationService.getOrganizationStats(organizationId),
    enabled: !!organizationId,
  });
}

export function useActiveMember() {
  return useQuery({
    queryKey: ["organization", "active-member"],
    queryFn: organizationService.getActiveMember,
  });
}

export function useActiveMemberRole() {
  return useQuery({
    queryKey: ["organization", "active-member-role"],
    queryFn: organizationService.getActiveMemberRole,
  });
}

export function useMembers(organizationId?: string) {
  return useQuery({
    queryKey: ["organization", "members", organizationId],
    queryFn: () => organizationService.listMembers(organizationId),
  });
}

export function useSetActiveOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { organizationSlug?: string; organizationId?: string }) =>
      organizationService.setActiveOrganization(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["organization"] });
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrganizationRequest) => organizationService.createOrganization(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateOrganizationRequest) => organizationService.updateOrganization(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });
}

export function useAddMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { userId: string; role: string; organizationId?: string }) =>
      organizationService.addMember(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["organization", "members"] });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { memberIdOrEmail: string; organizationId?: string }) =>
      organizationService.removeMember(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["organization", "members"] });
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { memberId: string; role: string; organizationId?: string }) =>
      organizationService.updateMemberRole(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["organization", "members"] });
    },
  });
}

export function useLeaveOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (organizationId: string) => organizationService.leaveOrganization(organizationId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });
}

export function useOrganizationPin(organizationId: string) {
  return useQuery({
    queryKey: ["organization", "pin", organizationId],
    queryFn: () => organizationService.getOrganizationPin(organizationId),
    enabled: !!organizationId,
  });
}

export function useToggleOrganizationPin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { organizationId: string; enabled: boolean }) =>
      organizationService.toggleOrganizationPin(data),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["organization", "pin", variables.organizationId] });
    },
  });
}

export function useRegenerateOrganizationPin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (organizationId: string) => organizationService.regenerateOrganizationPin(organizationId),
    onSettled: (_data, _err, organizationId) => {
      queryClient.invalidateQueries({ queryKey: ["organization", "pin", organizationId] });
    },
  });
}

export function useVerifyPin() {
  return useMutation({
    mutationFn: (data: { organizationId: string; pin: string }) =>
      organizationService.verifyPin(data),
  });
}

export function useRequestClub() {
  return useMutation({
    mutationFn: (data: { name: string; city: string }) => organizationService.requestClub(data),
  });
}
