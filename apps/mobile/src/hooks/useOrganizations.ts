import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationApi } from "@/api/endpoints/organization";

export function useOrganization(slug: string) {
  return useQuery({
    queryKey: ["organization", slug],
    queryFn: () => organizationApi.getFullOrganization({ organizationSlug: slug }),
    enabled: !!slug,
  });
}

export function useUserOrganizations() {
  return useQuery({
    queryKey: ["organizations", "user"],
    queryFn: () => organizationApi.listUserOrganizations(),
  });
}

export function useOrganizationMembers(organizationId: string) {
  return useQuery({
    queryKey: ["organization", organizationId, "members"],
    queryFn: () => organizationApi.listMembers({ organizationId }),
    enabled: !!organizationId,
  });
}

export function useOrganizationStats(organizationId: string) {
  return useQuery({
    queryKey: ["organization", organizationId, "stats"],
    queryFn: () => organizationApi.getStats(organizationId),
    enabled: !!organizationId,
  });
}

export function useSearchOrganizations() {
  return useMutation({
    mutationFn: (query: string) => organizationApi.search(query),
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      organizationId: string;
      data: Parameters<typeof organizationApi.update>[0]["data"];
    }) => organizationApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });
}

export function useLeaveOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (organizationId: string) =>
      organizationApi.leave(organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization"] });
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberIdOrEmail,
      organizationId,
    }: {
      memberIdOrEmail: string;
      organizationId?: string;
    }) => organizationApi.removeMember(memberIdOrEmail, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });
}

export function useVerifyPin() {
  return useMutation({
    mutationFn: ({
      organizationId,
      pin,
    }: {
      organizationId: string;
      pin: string;
    }) => organizationApi.verifyPin(organizationId, pin),
  });
}

export function useOrganizationPin(organizationId: string) {
  return useQuery({
    queryKey: ["organization", organizationId, "pin"],
    queryFn: () => organizationApi.getPin(organizationId),
    enabled: !!organizationId,
  });
}

export function useTogglePin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      enabled,
    }: {
      organizationId: string;
      enabled: boolean;
    }) => organizationApi.togglePin(organizationId, enabled),
    onSuccess: (_, { organizationId }) => {
      queryClient.invalidateQueries({
        queryKey: ["organization", organizationId, "pin"],
      });
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });
}

export function useRegeneratePin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (organizationId: string) =>
      organizationApi.regeneratePin(organizationId),
    onSuccess: (_, organizationId) => {
      queryClient.invalidateQueries({
        queryKey: ["organization", organizationId, "pin"],
      });
    },
  });
}
