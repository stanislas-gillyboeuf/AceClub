import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/user";
import { queryKeys } from "@/lib/query-keys";

export function useBlockedUsers() {
  return useQuery({
    queryKey: queryKeys.user.blocked(),
    queryFn: userService.listBlocked,
  });
}

export function useBlockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => userService.blockUser(userId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.blocked() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.searchAll() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.pastPartners() });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversation.list() });
    },
  });
}

export function useUnblockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => userService.unblockUser(userId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.blocked() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.searchAll() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.pastPartners() });
    },
  });
}

export function useReportUser() {
  return useMutation({
    mutationFn: ({ userId, reason, context }: { userId: string; reason: string; context?: string }) =>
      userService.reportUser(userId, reason, context),
  });
}
