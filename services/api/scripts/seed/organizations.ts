import { faker } from "@faker-js/faker";
import { ulid } from "ulid";
import { organization, member } from "../../db/schema/index.js";
import type { Database } from "./context.js";
import { SEED_COUNTS } from "./context.js";

const CLUBS = [
  {
    name: "Roland-Garros Club",
    address: "2 Avenue Gordon Bennett, 75016 Paris",
    latitude: 48.8469,
    longitude: 2.2531,
  },
  {
    name: "TC Paris 16",
    address: "15 Rue Claude Lorrain, 75016 Paris",
    latitude: 48.8445,
    longitude: 2.2641,
  },
  {
    name: "Racing Club de France",
    address: "5 Rue Eblé, 75007 Paris",
    latitude: 48.8499,
    longitude: 2.3145,
  },
  {
    name: "Lagardère Paris Racing",
    address: "Croix Catelan, Bois de Boulogne, 75016 Paris",
    latitude: 48.8612,
    longitude: 2.2471,
  },
  {
    name: "Boulogne Billancourt TC",
    address: "120 Rue de Billancourt, 92100 Boulogne-Billancourt",
    latitude: 48.8352,
    longitude: 2.2398,
  },
];

export async function seedOrganizations(
  db: Database,
  ctx: { userIds: string[] },
): Promise<{ orgIds: string[]; userToOrgs: Map<string, string[]> }> {
  const orgIds: string[] = [];
  const userToOrgs = new Map<string, string[]>();

  const orgRows = CLUBS.slice(0, SEED_COUNTS.ORG_COUNT).map((club) => {
    const id = ulid();
    orgIds.push(id);
    return {
      id,
      name: club.name,
      slug: club.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
      logo: null,
      createdAt: faker.date.past({ years: 2 }),
      metadata: null,
      address: club.address,
      latitude: club.latitude,
      longitude: club.longitude,
    };
  });

  await db.insert(organization).values(orgRows);
  console.log(`  Inserted ${orgRows.length} organizations`);

  // Build member rows
  const memberRows: Array<{
    id: string;
    organizationId: string;
    userId: string;
    role: string;
    createdAt: Date;
  }> = [];
  const used = new Set<string>();

  // First member of each org is the owner
  for (let o = 0; o < orgIds.length; o++) {
    const uid = ctx.userIds[o % ctx.userIds.length];
    const key = `${uid}-${orgIds[o]}`;
    used.add(key);
    memberRows.push({
      id: ulid(),
      organizationId: orgIds[o],
      userId: uid,
      role: "owner",
      createdAt: faker.date.past({ years: 1 }),
    });
    if (!userToOrgs.has(uid)) userToOrgs.set(uid, []);
    userToOrgs.get(uid)!.push(orgIds[o]);
  }

  // Guarantee EVERY user is member of at least 1 org
  for (const uid of ctx.userIds) {
    if (userToOrgs.has(uid)) continue;
    const oid = faker.helpers.arrayElement(orgIds);
    const key = `${uid}-${oid}`;
    if (used.has(key)) continue;
    used.add(key);
    memberRows.push({
      id: ulid(),
      organizationId: oid,
      userId: uid,
      role: "member",
      createdAt: faker.date.past({ years: 1 }),
    });
    if (!userToOrgs.has(uid)) userToOrgs.set(uid, []);
    userToOrgs.get(uid)!.push(oid);
  }

  // Add extra random memberships for variety
  for (let i = 0; i < ctx.userIds.length; i++) {
    const uid = faker.helpers.arrayElement(ctx.userIds);
    const oid = faker.helpers.arrayElement(orgIds);
    const key = `${uid}-${oid}`;
    if (used.has(key)) continue;
    used.add(key);
    memberRows.push({
      id: ulid(),
      organizationId: oid,
      userId: uid,
      role: faker.helpers.arrayElement(["admin", "member"]),
      createdAt: faker.date.past({ years: 1 }),
    });
    if (!userToOrgs.has(uid)) userToOrgs.set(uid, []);
    userToOrgs.get(uid)!.push(oid);
  }

  await db.insert(member).values(memberRows);
  console.log(`  Inserted ${memberRows.length} members`);

  return { orgIds, userToOrgs };
}
