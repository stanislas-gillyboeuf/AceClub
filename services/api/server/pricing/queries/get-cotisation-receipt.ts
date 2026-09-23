import { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { memberCotisation, user, organization } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { generateDuesReceiptPdf } from "../../../services/receipts/dues-receipt";
import { getCotisationReceiptValidator } from "../validators";

export const getCotisationReceipt = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<typeof getCotisationReceiptValidator>;

  const [row] = await db
    .select({
      organizationId: memberCotisation.organizationId,
      status: memberCotisation.status,
      paidAt: memberCotisation.paidAt,
      paidMethod: memberCotisation.paidMethod,
      amountCents: memberCotisation.amountCents,
      seasonLabel: memberCotisation.seasonLabel,
      memberName: user.name,
      clubName: organization.name,
    })
    .from(memberCotisation)
    .innerJoin(user, eq(memberCotisation.userId, user.id))
    .innerJoin(organization, eq(memberCotisation.organizationId, organization.id))
    .where(
      and(
        eq(memberCotisation.organizationId, validated.organizationId),
        eq(memberCotisation.userId, validated.userId),
        eq(memberCotisation.seasonLabel, validated.seasonLabel),
      ),
    )
    .limit(1);

  if (!row) {
    return c.json({ error: "NotFound", message: "Cotisation not found" }, 404);
  }

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, row.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  if (row.status !== "paid" || !row.paidAt) {
    return c.json({ error: "BadRequest", message: "This cotisation has not been marked as paid" }, 400);
  }

  const pdf = await generateDuesReceiptPdf({
    clubName: row.clubName,
    memberName: row.memberName,
    duesTypeName: `Cotisation ${row.seasonLabel}`,
    amountCents: row.amountCents,
    paidAt: row.paidAt,
    paidMethod: row.paidMethod,
  });

  return c.body(new Uint8Array(pdf), 200, {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="recu-cotisation.pdf"`,
  });
};
