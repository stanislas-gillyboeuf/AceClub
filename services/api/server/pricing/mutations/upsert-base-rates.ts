import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { ulid } from "ulid";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { tarifGrid, tarifBaseRate } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { getOrCreateEditableVersion } from "../lib/versioning";
import { logGridAudit } from "../lib/audit";
import { upsertBaseRatesValidator } from "../validators";

// Delete-then-insert is safe here (unlike age categories): nothing references tarifBaseRate.id.
export const upsertBaseRates = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof upsertBaseRatesValidator>;

  const [existing] = await db.select().from(tarifGrid).where(eq(tarifGrid.id, validated.gridId)).limit(1);
  if (!existing) {
    return c.json({ error: "NotFound", message: "Grid not found" }, 404);
  }

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, existing.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const { gridId, idMaps } = await getOrCreateEditableVersion(validated.gridId, currentUser.id);

  const rates = await db.transaction(async (tx) => {
    await tx.delete(tarifBaseRate).where(eq(tarifBaseRate.tarifGridId, gridId));

    for (const item of validated.items) {
      const categoryId = idMaps.ageCategory.get(item.categoryId) ?? item.categoryId;
      await tx.insert(tarifBaseRate).values({
        id: ulid(),
        tarifGridId: gridId,
        categoryId,
        membershipFeeCents: item.membershipFeeCents,
        licenseFeeCents: item.licenseFeeCents,
      });
    }

    return tx.select().from(tarifBaseRate).where(eq(tarifBaseRate.tarifGridId, gridId));
  });

  await logGridAudit({
    tarifGridId: gridId,
    organizationId: existing.organizationId,
    actorUserId: currentUser.id,
    action: "updated",
    summary: "Tarifs de base modifiés",
  });

  return c.json({ gridId, baseRates: rates });
};
