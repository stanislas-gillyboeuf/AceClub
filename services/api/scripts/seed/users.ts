import { faker } from "@faker-js/faker";
import { ulid } from "ulid";
import { user } from "../../db/schema/index.js";
import type { Database } from "./context.js";
import { SEED_COUNTS } from "./context.js";

export async function seedUsers(
  db: Database,
): Promise<{
  userIds: string[];
  userRows: Map<string, { name: string; image: string | null }>;
}> {
  faker.seed(42);
  const userIds: string[] = [];
  const userRows = new Map<string, { name: string; image: string | null }>();
  const rows = [];

  // First user = dev account (admin)
  const devId = ulid();
  userIds.push(devId);
  userRows.set(devId, { name: "Nicolas Becharat", image: null });
  rows.push({
    id: devId,
    name: "Nicolas Becharat",
    email: "nicolas.becharat@gmail.com",
    emailVerified: true,
    image: null,
    role: "admin",
    phoneNumber: null,
    onboarding_completed: true,
  });

  for (let i = 1; i < SEED_COUNTS.USER_COUNT; i++) {
    const id = ulid();
    const name = faker.person.fullName();
    const image = faker.datatype.boolean(0.7) ? faker.image.avatar() : null;
    const phoneNumber = faker.datatype.boolean(0.5)
      ? faker.phone.number({ style: "international" })
      : null;

    userIds.push(id);
    userRows.set(id, { name, image });

    rows.push({
      id,
      name,
      email: faker.internet.email().toLowerCase(),
      emailVerified: faker.datatype.boolean(0.8),
      image,
      role: "user",
      phoneNumber,
      onboarding_completed: faker.datatype.boolean(0.8),
    });
  }

  await db.insert(user).values(rows);
  console.log(`  Inserted ${rows.length} users`);
  return { userIds, userRows };
}
