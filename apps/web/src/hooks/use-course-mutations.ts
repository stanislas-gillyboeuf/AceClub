import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { CancelOccurrenceInput, CreateCourseInput, UpdateCourseInput } from "@/types/course"

function settleCourses(queryClient: ReturnType<typeof useQueryClient>, courseId?: string) {
  queryClient.invalidateQueries({ queryKey: ["courses"] })
  queryClient.invalidateQueries({ queryKey: ["my-courses"] })
  queryClient.invalidateQueries({ queryKey: ["club-admin-board"] })
  if (courseId) queryClient.invalidateQueries({ queryKey: ["course-detail", courseId] })
}

export function useCreateCourse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCourseInput) =>
      apiClient("/course/create", { method: "POST", body: JSON.stringify(data) }),
    onSettled: () => settleCourses(queryClient),
  })
}

export function useUpdateCourse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateCourseInput) =>
      apiClient("/course/update", { method: "POST", body: JSON.stringify(data) }),
    onSettled: (_data, _err, variables) => settleCourses(queryClient, variables.courseId),
  })
}

export function useCancelCourseSeries() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (courseId: string) =>
      apiClient("/course/cancel-series", { method: "POST", body: JSON.stringify({ courseId }) }),
    onSettled: (_data, _err, courseId) => settleCourses(queryClient, courseId),
  })
}

export function useCancelCourseOccurrence() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CancelOccurrenceInput) =>
      apiClient("/course/cancel-occurrence", { method: "POST", body: JSON.stringify(data) }),
    onSettled: () => settleCourses(queryClient),
  })
}

export function useEnrollCourseMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { courseId: string; userId: string }) =>
      apiClient("/course/enroll", { method: "POST", body: JSON.stringify(data) }),
    onSettled: (_data, _err, variables) => settleCourses(queryClient, variables.courseId),
  })
}

export function useUnenrollCourseMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { courseId: string; userId: string }) =>
      apiClient("/course/unenroll", { method: "POST", body: JSON.stringify(data) }),
    onSettled: (_data, _err, variables) => settleCourses(queryClient, variables.courseId),
  })
}
