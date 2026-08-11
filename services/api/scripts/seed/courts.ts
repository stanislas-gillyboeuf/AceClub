import { faker } from "@faker-js/faker";
import { ulid } from "ulid";
import { court } from "../../db/schema/index.js";
import type { Database } from "./context.js";

const COURTS_PER_ORG = 3;
const SURFACES = ["clay", "hard", "grass", "carpet"] as const;

export async function seedCourts(
  db: Database,
  ctx: { orgIds: string[] },
): Promise<{ courtIds: string[] }> {
  const courtRows = ctx.orgIds.flatMap((organizationId) =>
    Array.from({ length: COURTS_PER_ORG }, (_, i) => ({
      id: ulid(),
      organizationId,
      name: `Court ${i + 1}`,
      surface: faker.helpers.arrayElement(SURFACES),
      indoor: i === COURTS_PER_ORG - 1,
      isActive: true,
      createdAt: faker.date.past({ years: 1 }),
    })),
  );

  await db.insert(court).values(courtRows);
  console.log(`  Inserted ${courtRows.length} courts`);

  return { courtIds: courtRows.map((c) => c.id) };
}
