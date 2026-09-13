import { api } from "@/lib/api";
import type { MyEnrolledCourse } from "@/types/course";

export const courseService = {
  listMyEnrollments: () => api.get<{ courses: MyEnrolledCourse[] }>("/course/my-enrollments"),
};
