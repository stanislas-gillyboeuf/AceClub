import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { HonoContext } from "../../types/hono";
import { requireAuth } from "../../middleware/auth";
import {
  listCourses,
  getCourseDetail,
  listMyCourses,
  listMyEnrollments,
  getOccurrenceAttendance,
} from "./queries";
import {
  createCourse,
  updateCourse,
  cancelSeries,
  cancelOccurrence,
  enrollMember,
  unenrollMember,
  markAttendance,
  notifyStudents,
} from "./mutations";
import {
  createCourseValidator,
  updateCourseValidator,
  cancelSeriesValidator,
  cancelOccurrenceValidator,
  listCoursesValidator,
  getCourseDetailValidator,
  listMyCoursesValidator,
  enrollMemberValidator,
  unenrollMemberValidator,
  getOccurrenceAttendanceValidator,
  markAttendanceValidator,
  notifyStudentsValidator,
} from "./validators";

export const courseRouter = new Hono<HonoContext>();

courseRouter.use("/*", requireAuth);

// --- Queries (authorization enforced in each handler) ---
courseRouter.get("/list", zValidator("query", listCoursesValidator), listCourses);
courseRouter.get("/detail", zValidator("query", getCourseDetailValidator), getCourseDetail);
courseRouter.get("/mine", zValidator("query", listMyCoursesValidator), listMyCourses);
courseRouter.get("/my-enrollments", listMyEnrollments);
courseRouter.get(
  "/occurrence-attendance",
  zValidator("query", getOccurrenceAttendanceValidator),
  getOccurrenceAttendance,
);

// --- Mutations ---
courseRouter.post("/create", zValidator("json", createCourseValidator), createCourse);
courseRouter.post("/update", zValidator("json", updateCourseValidator), updateCourse);
courseRouter.post("/cancel-series", zValidator("json", cancelSeriesValidator), cancelSeries);
courseRouter.post(
  "/cancel-occurrence",
  zValidator("json", cancelOccurrenceValidator),
  cancelOccurrence,
);
courseRouter.post("/enroll", zValidator("json", enrollMemberValidator), enrollMember);
courseRouter.post("/unenroll", zValidator("json", unenrollMemberValidator), unenrollMember);
courseRouter.post("/mark-attendance", zValidator("json", markAttendanceValidator), markAttendance);
courseRouter.post("/notify-students", zValidator("json", notifyStudentsValidator), notifyStudents);
