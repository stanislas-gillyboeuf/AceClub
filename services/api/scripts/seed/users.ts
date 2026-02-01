import { faker } from "@faker-js/faker";
import { ulid } from "ulid";
import { user } from "../../db/schema/index.js";
import type { Database } from "./context.js";
import { SEED_COUNTS } from "./context.js";

export async function seedUsers(db: Database): Promise<{ userIds: string[] }> {
  faker.seed(42);
  const userIds: string[] = [];
  const rows = [];

  for (let i = 0; i < SEED_COUNTS.USER_COUNT; i++) {
    const id = ulid();
    userIds.push(id);
    rows.push({
      id,
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      emailVerified: faker.datatype.boolean(0.8),
      image: faker.datatype.boolean(0.3) ? faker.image.avatar() : null,
      role: i === 0 ? "admin" : "user",
    });
  }

  await db.insert(user).values(rows);
  console.log(`  Inserted ${rows.length} users`);
  return { userIds };
}
