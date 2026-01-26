import { faker } from "@faker-js/faker";
import { ulid } from "ulid";
import { organization, member } from "../../db/schema/index.js";
import type { Database } from "./context.js";
import { SEED_COUNTS } from "./context.js";

const ORG_NAMES = [
  "Roland-Garros Club",
  "TC Paris 16",
  "Racing Club de France",
  "Lagardère Paris Racing",
  "Boulogne Billancourt TC",
];

export async function seedOrganizations(
  db: Database,
  ctx: { userIds: string[] }
): Promise<{ orgIds: string[] }> {
  const orgIds: string[] = [];
  const orgRows = ORG_NAMES.slice(0, SEED_COUNTS.ORG_COUNT).map((name) => {
    const id = ulid();
    orgIds.push(id);
    return {
      id,
      name,
      slug: faker.helpers.slugify(name).toLowerCase().replace(/\s+/g, "-"),
      logo: null,
      createdAt: faker.date.past({ years: 2 }),
      metadata: null,
    };
  });

  await db.insert(organization).values(orgRows);
  console.log(`  Inserted ${orgRows.length} organizations`);

  const memberRows: Array<{
    id: string;
    organizationId: string;
    userId: string;
    role: string;
    createdAt: Date;
  }> = [];
  const used = new Set<string>();

  for (let i = 0; i < ctx.userIds.length * 2; i++) {
    const uid = faker.helpers.arrayElement(ctx.userIds);
    const oid = faker.helpers.arrayElement(orgIds);
    const key = `${uid}-${oid}`;
    if (used.has(key)) continue;
    used.add(key);
    memberRows.push({
      id: ulid(),
      organizationId: oid,
      userId: uid,
      role: faker.helpers.arrayElement(["owner", "admin", "member"]),
      createdAt: faker.date.past({ years: 1 }),
    });
  }

  await db.insert(member).values(memberRows);
  console.log(`  Inserted ${memberRows.length} members`);

  return { orgIds };
}
