import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { levelApi } from "@/api/endpoints/level";

export function useMyLevel() {
  return useQuery({
    queryKey: ["level", "me"],
    queryFn: () => levelApi.getMyLevel(),
  });
}

export function useAcesHistory() {
  return useInfiniteQuery({
    queryKey: ["level", "history"],
    queryFn: ({ pageParam = 1 }) => levelApi.getHistory({ page: pageParam }),
    getNextPageParam: (last) => {
      if (last.transactions.length < last.limit) return undefined;
      return last.page + 1;
    },
    initialPageParam: 1,
  });
}
