import { useQuery, useMutation } from "@tanstack/react-query";
import { userService } from "@/services/user";
import { queryKeys } from "@/lib/query-keys";

export function useCreateProfileShareToken() {
  return useMutation({
    mutationFn: () => userService.createProfileShareToken(),
  });
}

export function useRevokeProfileShareToken() {
  return useMutation({
    mutationFn: (token: string) => userService.revokeProfileShareToken(token),
  });
}

/** Resolves a scanned/opened shareable profile link to its minimal public profile. 404 (invalid,
 * revoked, banned, or blocked either way) all look identical — the screen just shows "not found". */
export function useProfileByToken(token: string) {
  return useQuery({
    queryKey: queryKeys.user.profileByToken(token),
    queryFn: () => userService.getProfileByToken(token),
    enabled: !!token,
    retry: false,
  });
}
