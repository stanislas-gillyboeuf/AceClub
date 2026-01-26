import { faker } from "@faker-js/faker";
import { ulid } from "ulid";
import {
  matchIntent,
  matchIntentSwipe,
  matchRequest,
} from "../../db/schema/index.js";
import type { Database } from "./context.js";
import { SEED_COUNTS } from "./context.js";

export async function seedMatchIntents(
  db: Database,
  ctx: { userIds: string[] }
): Promise<{ intentIds: string[]; intentIdToUserId: Map<string, string> }> {
  const intentIds: string[] = [];
  const intentIdToUserId = new Map<string, string>();

  for (let u = 0; u < ctx.userIds.length; u++) {
    for (let i = 0; i < SEED_COUNTS.MATCH_INTENTS_PER_USER; i++) {
      const id = ulid();
      intentIds.push(id);
      intentIdToUserId.set(id, ctx.userIds[u]);
      const date = faker.date.soon({ days: 14 });
      const time = new Date(date);
      time.setHours(
        faker.helpers.arrayElement([9, 10, 11, 14, 15, 16, 17, 18]),
        0,
        0,
        0
      );
      await db.insert(matchIntent).values({
        id,
        userId: ctx.userIds[u],
        date,
        time,
        duration: faker.helpers.arrayElement([60, 90, 120]),
        status: faker.helpers.arrayElement([
          "pending",
          "pending",
          "accepted",
          "rejected",
        ]),
      });
    }
  }

  console.log(`  Inserted ${intentIds.length} match intents`);
  return { intentIds, intentIdToUserId };
}

export async function seedSwipes(
  db: Database,
  ctx: {
    userIds: string[];
    intentIds: string[];
    intentIdToUserId: Map<string, string>;
  }
): Promise<{ likeSwipes: { matchIntentId: string; swiperUserId: string }[] }> {
  const rows: Array<{
    id: string;
    matchIntentId: string;
    swiperUserId: string;
    action: "like" | "pass";
    swipedAt: Date;
  }> = [];
  const swiped = new Set<string>();

  for (let i = 0; i < SEED_COUNTS.SWIPE_COUNT; i++) {
    const intentId = faker.helpers.arrayElement(ctx.intentIds);
    const ownerId = ctx.intentIdToUserId.get(intentId) ?? ctx.userIds[0];
    const swiperId = faker.helpers.arrayElement(
      ctx.userIds.filter((id) => id !== ownerId)
    );
    const key = `${intentId}-${swiperId}`;
    if (swiped.has(key)) continue;
    swiped.add(key);
    const action = faker.helpers.arrayElement(["like", "like", "pass"]) as "like" | "pass";
    rows.push({
      id: ulid(),
      matchIntentId: intentId,
      swiperUserId: swiperId,
      action,
      swipedAt: faker.date.recent({ days: 3 }),
    });
  }

  await db.insert(matchIntentSwipe).values(rows);
  console.log(`  Inserted ${rows.length} swipes`);

  const likeSwipes = rows
    .filter((r) => r.action === "like")
    .map((r) => ({ matchIntentId: r.matchIntentId, swiperUserId: r.swiperUserId }));

  return { likeSwipes };
}

export async function seedMatchRequests(
  db: Database,
  ctx: {
    userIds: string[];
    intentIdToUserId: Map<string, string>;
    likeSwipes: { matchIntentId: string; swiperUserId: string }[];
  }
): Promise<void> {
  const used = new Set<string>();
  const rows: Array<{
    id: string;
    matchIntentId: string;
    requesterId: string;
    receiverId: string;
    status: "pending" | "accepted" | "rejected";
    createdAt: Date;
    respondedAt: null;
  }> = [];

  const n = Math.min(SEED_COUNTS.MATCH_REQUEST_COUNT, ctx.likeSwipes.length);
  for (let i = 0; i < n; i++) {
    const s = ctx.likeSwipes[i];
    if (!s) continue;
    const key = `${s.matchIntentId}-${s.swiperUserId}`;
    if (used.has(key)) continue;
    used.add(key);
    const receiverId = ctx.intentIdToUserId.get(s.matchIntentId) ?? ctx.userIds[0];
    rows.push({
      id: ulid(),
      matchIntentId: s.matchIntentId,
      requesterId: s.swiperUserId,
      receiverId,
      status: faker.helpers.arrayElement([
        "pending",
        "accepted",
        "accepted",
        "rejected",
      ]) as "pending" | "accepted" | "rejected",
      createdAt: faker.date.recent({ days: 2 }),
      respondedAt: null,
    });
  }

  await db.insert(matchRequest).values(rows);
  console.log(`  Inserted ${rows.length} match requests`);
}
