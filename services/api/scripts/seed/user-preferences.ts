import { faker } from "@faker-js/faker";
import { ulid } from "ulid";
import { userPreference } from "../../db/schema/index.js";
import type { Database } from "./context.js";

const SKILL_LEVELS = ["debutant", "intermediaire", "confirme", "expert"];

export async function seedUserPreferences(
  db: Database,
  ctx: { userIds: string[]; userToOrgs: Map<string, string[]> },
): Promise<void> {
  const rows = [];

  for (const userId of ctx.userIds) {
    const orgs = ctx.userToOrgs.get(userId);
    if (!orgs || orgs.length === 0) continue;

    rows.push({
      id: ulid(),
      userId,
      organizationId: orgs[0],
      sport: faker.helpers.arrayElement(["tennis", "padel"]) as "tennis" | "padel",
      skillLevel: faker.helpers.arrayElement(SKILL_LEVELS),
    });
  }

  if (rows.length > 0) {
    await db.insert(userPreference).values(rows);
  }
  console.log(`  Inserted ${rows.length} user preferences`);
}
