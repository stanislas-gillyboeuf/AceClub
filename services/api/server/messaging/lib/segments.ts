import { and, eq, gte, inArray } from "drizzle-orm";
import { db } from "../../../db";
import { member, user, memberCotisation, courtBooking, court } from "../../../db/schema";
import type { BroadcastSegmentType } from "../../../db/schema";
import { publicEmail } from "../../../lib/technical-email";
import { resolveContactEmails } from "../../pricing/lib/resolve-contact-email";

const INACTIVE_WINDOW_DAYS = 30;

export interface SegmentMember {
  userId: string;
  name: string;
  /** The member's own email, null when it is a technical address (never shown). */
  email: string | null;
  /** Where announcements actually go: own real email, else the household's contact, else null. */
  contactEmail: string | null;
  image: string | null;
}

async function listAllClubMembers(organizationId: string): Promise<SegmentMember[]> {
  const rows = await db
    .select({ userId: user.id, name: user.name, email: user.email, image: user.image })
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .where(eq(member.organizationId, organizationId));
  const contactEmails = await resolveContactEmails(
    organizationId,
    rows.map((r) => r.userId),
  );
  return rows.map((r) => ({
    userId: r.userId,
    name: r.name,
    email: publicEmail(r.email),
    contactEmail: contactEmails.get(r.userId) ?? null,
    image: r.image,
  }));
}

/** One announcement per address: a parent whose three children share the household contact gets
 * it once. Members with no contact address are returned separately, never silently dropped. */
export function dedupeRecipientEmails(members: SegmentMember[]): {
  emails: string[];
  noContact: SegmentMember[];
} {
  const seen = new Set<string>();
  const emails: string[] = [];
  const noContact: SegmentMember[] = [];
  for (const m of members) {
    if (!m.contactEmail) {
      noContact.push(m);
      continue;
    }
    const key = m.contactEmail.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    emails.push(m.contactEmail);
  }
  return { emails, noContact };
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

  // Members with an issued cotisation still pending (a member with no record yet is not "unpaid").
  if (segment === "unpaid_dues") {
    const rows = await db
      .select({ userId: memberCotisation.userId })
      .from(memberCotisation)
      .where(and(eq(memberCotisation.organizationId, organizationId), eq(memberCotisation.status, "pending")));
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
