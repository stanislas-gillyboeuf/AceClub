import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationService } from "@/services/organization";
import { queryKeys } from "@/lib/query-keys";
import type { CreateOrganizationRequest, UpdateOrganizationRequest } from "@/types/organization";

export function useMyOrganizations() {
  return useQuery({
    queryKey: queryKeys.organization.list(),
    queryFn: organizationService.listOrganizationsUser,
  });
}

export function useUserOrganizations(userId: string) {
  return useQuery({
    queryKey: queryKeys.organization.user(userId),
    queryFn: () => organizationService.listUserOrganizations(userId),
    enabled: !!userId,
  });
}

export function useSearchOrganizations(query?: string, limit = 20, offset = 0) {
  return useQuery({
    queryKey: queryKeys.organization.search(query, limit, offset),
    queryFn: () => organizationService.searchOrganizations(query, limit, offset),
  });
}

export function useFullOrganization(slug: string) {
  return useQuery({
    queryKey: queryKeys.organization.full(slug),
    queryFn: () => organizationService.getFullOrganization(slug),
    enabled: !!slug,
  });
}

export function useOrganizationStats(organizationId: string) {
  return useQuery({
    queryKey: queryKeys.organization.stats(organizationId),
    queryFn: () => organizationService.getOrganizationStats(organizationId),
    enabled: !!organizationId,
  });
}

export function useActiveMember() {
  return useQuery({
    queryKey: queryKeys.organization.activeMember(),
    queryFn: organizationService.getActiveMember,
  });
}

export function useActiveMemberRole() {
  return useQuery({
    queryKey: queryKeys.organization.activeMemberRole(),
    queryFn: organizationService.getActiveMemberRole,
  });
}

export function useMembers(organizationId?: string) {
  return useQuery({
    queryKey: queryKeys.organization.members(organizationId),
    queryFn: () => organizationService.listMembers(organizationId),
    enabled: !!organizationId,
  });
}

export function useSetActiveOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { organizationSlug?: string; organizationId?: string }) =>
      organizationService.setActiveOrganization(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organization.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrganizationRequest) => organizationService.createOrganization(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organization.all });
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateOrganizationRequest) => organizationService.updateOrganization(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organization.all });
    },
  });
}

export function useAddMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { userId: string; role: string; organizationId?: string }) =>
      organizationService.addMember(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organization.membersAll() });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { memberIdOrEmail: string; organizationId?: string }) =>
      organizationService.removeMember(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organization.membersAll() });
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { memberId: string; role: string; organizationId?: string }) =>
      organizationService.updateMemberRole(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organization.membersAll() });
    },
  });
}

export function useLeaveOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (organizationId: string) => organizationService.leaveOrganization(organizationId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organization.all });
    },
  });
}

export function useOrganizationPin(organizationId: string) {
  return useQuery({
    queryKey: queryKeys.organization.pin(organizationId),
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
      queryClient.invalidateQueries({ queryKey: queryKeys.organization.pin(variables.organizationId) });
    },
  });
}

export function useRegenerateOrganizationPin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (organizationId: string) => organizationService.regenerateOrganizationPin(organizationId),
    onSettled: (_data, _err, organizationId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organization.pin(organizationId) });
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
