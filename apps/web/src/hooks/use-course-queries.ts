import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { CourseDetail, CourseListItem, MyCourseItem } from "@/types/course"

export function useCourses(organizationId: string) {
  return useQuery({
    queryKey: ["courses", organizationId],
    queryFn: () =>
      apiClient<{ courses: CourseListItem[] }>(`/course/list?organizationId=${organizationId}`),
    enabled: !!organizationId,
  })
}

export function useCourseDetail(courseId: string) {
  return useQuery({
    queryKey: ["course-detail", courseId],
    queryFn: () => apiClient<CourseDetail>(`/course/detail?courseId=${courseId}`),
    enabled: !!courseId,
  })
}

export function useMyCourses(organizationId: string) {
  return useQuery({
    queryKey: ["my-courses", organizationId],
    queryFn: () =>
      apiClient<{ courses: MyCourseItem[] }>(`/course/mine?organizationId=${organizationId}`),
    enabled: !!organizationId,
  })
}
