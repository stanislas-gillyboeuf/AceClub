import { z } from "zod";

const dateStringValidator = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");
const timeStringValidator = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:mm format");

export const createCourseValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  coachUserId: z.string().min(1, "Coach is required"),
  courtId: z.string().min(1, "Court is required"),
  name: z.string().min(1, "Name is required").max(100),
  weekday: z.number().int().min(0).max(6),
  startTime: timeStringValidator,
  durationMinutes: z.number().int().min(15).max(300),
  startDate: dateStringValidator,
  endDate: dateStringValidator,
});

export const updateCourseValidator = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  coachUserId: z.string().min(1).optional(),
  courtId: z.string().min(1).optional(),
  name: z.string().min(1).max(100).optional(),
  weekday: z.number().int().min(0).max(6).optional(),
  startTime: timeStringValidator.optional(),
  durationMinutes: z.number().int().min(15).max(300).optional(),
  endDate: dateStringValidator.optional(),
});

export const cancelSeriesValidator = z.object({
  courseId: z.string().min(1, "Course ID is required"),
});

export const cancelOccurrenceValidator = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  reason: z.string().max(500).optional(),
  reopen: z.boolean(),
});

export const listCoursesValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

export const getCourseDetailValidator = z.object({
  courseId: z.string().min(1, "Course ID is required"),
});

export const listMyCoursesValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

export const enrollMemberValidator = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

export const unenrollMemberValidator = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  userId: z.string().min(1, "User ID is required"),
});
