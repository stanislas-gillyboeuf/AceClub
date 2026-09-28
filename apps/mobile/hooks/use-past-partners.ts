import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/user";
import { queryKeys } from "@/lib/query-keys";

/** Players the caller has already shared a match or an active conversation with, across every
 * club — meant to be offered first when adding players to a match. */
export function usePastPartners() {
  return useQuery({
    queryKey: queryKeys.user.pastPartners(),
    queryFn: userService.listPastPartners,
  });
}
