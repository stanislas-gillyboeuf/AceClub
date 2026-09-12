import { and, eq, gte, inArray } from "drizzle-orm";
import { db } from "../../../db";
import { member, user, duesAssignment, courtBooking, court } from "../../../db/schema";
import type { BroadcastSegmentType } from "../../../db/schema";

const INACTIVE_WINDOW_DAYS = 30;

export interface SegmentMember {
  userId: string;
  name: string;
  email: string;
  image: string | null;
}

async function listAllClubMembers(organizationId: string): Promise<SegmentMember[]> {
  const rows = await db
    .select({ userId: user.id, name: user.name, email: user.email, image: user.image })
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .where(eq(member.organizationId, organizationId));
  return rows;
}

/** Resolves a fixed, server-defined segment live — nothing about the audience is persisted. */
export async function resolveSegment(
  organizationId: string,
  segment: BroadcastSegmentType,
): Promise<SegmentMember[]> {
  const allMembers = await listAllClubMembers(organizationId);

  if (segment === "all") {
    return allMembers;
  }

  if (segment === "unpaid_dues") {
    const rows = await db
      .select({ userId: duesAssignment.userId })
      .from(duesAssignment)
      .where(and(eq(duesAssignment.organizationId, organizationId), eq(duesAssignment.status, "pending")));
    const unpaidUserIds = new Set(rows.map((r) => r.userId));
    return allMembers.filter((m) => unpaidUserIds.has(m.userId));
  }

  // inactive_30d
  const since = new Date(Date.now() - INACTIVE_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const orgCourts = await db.select({ id: court.id }).from(court).where(eq(court.organizationId, organizationId));
  const courtIds = orgCourts.map((c) => c.id);

  const activeUserIds = new Set<string>();
  if (courtIds.length > 0) {
    const rows = await db
      .select({ userId: courtBooking.userId })
      .from(courtBooking)
      .where(
        and(
          inArray(courtBooking.courtId, courtIds),
          eq(courtBooking.status, "confirmed"),
          gte(courtBooking.startAt, since),
        ),
      );
    for (const r of rows) activeUserIds.add(r.userId);
  }

  return allMembers.filter((m) => !activeUserIds.has(m.userId));
}
