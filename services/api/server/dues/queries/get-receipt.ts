import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { duesAssignment, duesType, organization, user } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { generateDuesReceiptPdf } from "../../../services/receipts/dues-receipt";
import { getReceiptValidator } from "../validators";

export const getReceipt = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<typeof getReceiptValidator>;

  const [row] = await db
    .select({
      organizationId: duesAssignment.organizationId,
      status: duesAssignment.status,
      paidAt: duesAssignment.paidAt,
      paidMethod: duesAssignment.paidMethod,
      memberName: user.name,
      duesTypeName: duesType.name,
      amountCents: duesType.amountCents,
      clubName: organization.name,
    })
    .from(duesAssignment)
    .innerJoin(user, eq(duesAssignment.userId, user.id))
    .innerJoin(duesType, eq(duesAssignment.duesTypeId, duesType.id))
    .innerJoin(organization, eq(duesAssignment.organizationId, organization.id))
    .where(eq(duesAssignment.id, validated.assignmentId))
    .limit(1);

  if (!row) {
    return c.json({ error: "NotFound", message: "Assignment not found" }, 404);
  }

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, row.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  if (row.status !== "paid" || !row.paidAt) {
    return c.json({ error: "BadRequest", message: "This due has not been marked as paid" }, 400);
  }

  const pdf = await generateDuesReceiptPdf({
    clubName: row.clubName,
    memberName: row.memberName,
    duesTypeName: row.duesTypeName,
    amountCents: row.amountCents,
    paidAt: row.paidAt,
    paidMethod: row.paidMethod,
  });

  return c.body(new Uint8Array(pdf), 200, {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="recu-cotisation.pdf"`,
  });
};
