import { useQuery } from "@tanstack/react-query";
import { courseService } from "@/services/course";
import { queryKeys } from "@/lib/query-keys";

export function useMyEnrollments() {
  return useQuery({
    queryKey: queryKeys.course.myEnrollments(),
    queryFn: () => courseService.listMyEnrollments(),
  });
}
