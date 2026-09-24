import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { organization, user } from "../../../db/schema";
import type { HonoContext } from "../../../types/hono";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { ensureMemberCotisationRecord } from "../lib/member-cotisation";
import { sendCotisationRequest } from "../lib/issue-email";
import { resolveContactEmail } from "../lib/resolve-contact-email";
import { issueCotisationValidator } from "../validators";

/** "Émettre": freezes the member's price (record status `pending`) and emails the payment
 * request. Idempotent — issuing an already-issued cotisation is a no-op (no second email). */
export const issueCotisation = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof issueCotisationValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const result = await ensureMemberCotisationRecord(
    validated.organizationId,
    validated.userId,
    validated.seasonLabel,
    { issue: true },
  );

  if ("error" in result) {
    if (result.error === "incomplete") {
      return c.json(
        { error: "BadRequest", message: "This member's profile is missing data the grid needs", missingFields: result.missingFields },
        400,
      );
    }
    return c.json(
      { error: "NotFound", message: result.error === "no_active_grid" ? "No active pricing grid for this season" : "Member not found" },
      404,
    );
  }

  const { record, created } = result;
  if (!created) {
    return c.json({ record, created: false, emailSent: false });
  }

  const [[memberRow], [orgRow], contactEmail] = await Promise.all([
    db.select({ name: user.name }).from(user).where(eq(user.id, record.userId)).limit(1),
    db.select({ name: organization.name }).from(organization).where(eq(organization.id, record.organizationId)).limit(1),
    resolveContactEmail(record.organizationId, record.userId),
  ]);

  if (!memberRow || !orgRow) {
    return c.json({ record, created: true, emailSent: false, emailError: "Member or club not found" }, 201);
  }

  const email = await sendCotisationRequest({
    clubName: orgRow.name,
    memberName: memberRow.name,
    memberEmail: contactEmail,
    seasonLabel: record.seasonLabel,
    amountCents: record.amountCents,
  });

  return c.json(
    { record, created: true, emailSent: email.sent, ...(email.sent ? {} : { emailError: email.reason }) },
    201,
  );
};
