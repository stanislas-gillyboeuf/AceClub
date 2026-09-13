export interface MyEnrolledCourse {
  courseId: string;
  name: string;
  weekday: number;
  startTime: string;
  durationMinutes: number;
  endDate: string;
  status: "active" | "cancelled";
  coachName: string;
  courtName: string;
  sessionsRemaining: number;
}
