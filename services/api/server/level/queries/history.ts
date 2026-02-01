import { Context } from "hono";
import { eq, desc } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { acesTransaction } from "../../../db/schema/level/schema";

export const getAcesHistory = async (c: Context<HonoContext>) => {
  const authUser = c.get("user");
  const page = Number(c.req.query("page") ?? "1");
  const limit = Math.min(Number(c.req.query("limit") ?? "20"), 50);
  const offset = (page - 1) * limit;

  const transactions = await db
    .select()
    .from(acesTransaction)
    .where(eq(acesTransaction.userId, authUser!.id))
    .orderBy(desc(acesTransaction.createdAt))
    .limit(limit)
    .offset(offset);

  return c.json({
    transactions: transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      description: t.description,
      multiplier: t.multiplier,
      createdAt: t.createdAt,
    })),
    page,
    limit,
  });
};
