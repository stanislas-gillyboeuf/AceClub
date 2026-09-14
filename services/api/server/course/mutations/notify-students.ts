import { Context } from "hono";
import { z } from "zod";
import { and, eq, inArray } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { course, courseEnrollment } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { sendBatchNotifications } from "../../../services/expo-push/broadcast-service";
import { notifyStudentsValidator } from "../validators";

export const notifyStudents = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof notifyStudentsValidator>;

  const [parentCourse] = await db
    .select()
    .from(course)
    .where(eq(course.id, validated.courseId))
    .limit(1);

  if (!parentCourse) {
    return c.json({ error: "NotFound", message: "Course not found" }, 404);
  }

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, parentCourse.organizationId);
  const isAssignedCoach = currentUser.id === parentCourse.coachUserId;
  if (!isFullAdmin && !isAssignedCoach) {
    return c.json({ error: "Forbidden", message: "Not authorized for this course" }, 403);
  }

  // Only actually enrolled students can be notified — never an arbitrary userId list.
  const enrolled = await db
    .select({ userId: courseEnrollment.userId })
    .from(courseEnrollment)
    .where(
      and(eq(courseEnrollment.courseId, parentCourse.id), inArray(courseEnrollment.userId, validated.userIds)),
    );
  const validUserIds = enrolled.map((e) => e.userId);

  if (validUserIds.length === 0) {
    return c.json({ error: "BadRequest", message: "No selected user is enrolled in this course" }, 400);
  }

  const result = await sendBatchNotifications(validUserIds, {
    type: "coach_message",
    title: validated.title || parentCourse.name,
    body: validated.body,
    data: { courseId: parentCourse.id },
  });

  return c.json({ success: true, ...result });
};
