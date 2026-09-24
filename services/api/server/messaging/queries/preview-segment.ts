import { Context } from "hono";
import { z } from "zod";
import type { HonoContext } from "../../../types/hono";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { previewSegmentValidator } from "../validators";
import { dedupeRecipientEmails, resolveSegment } from "../lib/segments";

const SAMPLE_SIZE = 5;

export const previewSegment = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<typeof previewSegmentValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const members = await resolveSegment(validated.organizationId, validated.segment);

  const { emails, noContact } = dedupeRecipientEmails(members);

  return c.json({
    count: members.length,
    emailAddressCount: emails.length,
    emailNoContactCount: noContact.length,
    // `contactEmail` stays server-side: only the member's own public email is ever exposed.
    sample: members.slice(0, SAMPLE_SIZE).map(({ contactEmail: _contactEmail, ...rest }) => rest),
  });
};
