import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestUser,
  createTestOrganization,
  cleanupTestUser,
  cleanupTestOrganization,
  post,
  db,
} from "../helpers";
import { clubMemberProfile, user } from "../../db/schema";
import { and, eq } from "drizzle-orm";

describe("club-member bulk-import — re-import", () => {
  let ownerId: string;
  let ownerHeaders: Headers;
  let orgId: string;
  const email = `reimport-${Date.now()}@example.com`;

  beforeAll(async () => {
    const owner = await createTestUser({ name: "Owner Reimport" });
    ownerId = owner.user.id;
    ownerHeaders = owner.headers;
    const org = await createTestOrganization(ownerId, { name: "Club Reimport" });
    orgId = org.organizationId;
  });

  afterAll(async () => {
    await db.delete(clubMemberProfile).where(eq(clubMemberProfile.organizationId, orgId));
    const [imported] = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1);
    if (imported) await cleanupTestUser(imported.id);
    await cleanupTestOrganization(orgId);
    await cleanupTestUser(ownerId);
  });

  async function importRows(rows: Record<string, unknown>[]) {
    return post("/api/club-member/bulk-import", { organizationId: orgId, rows }, { headers: ownerHeaders });
  }

  async function loadProfile() {
    const [imported] = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1);
    const [profile] = await db
      .select()
      .from(clubMemberProfile)
      .where(and(eq(clubMemberProfile.userId, imported.id), eq(clubMemberProfile.organizationId, orgId)))
      .limit(1);
    return profile;
  }

  it("keeps the license and phone when a re-import omits them", async () => {
    const first = await importRows([
      { name: "Marie Test", email, phone: "0601020304", licenseNumber: "1234567", licenseValidUntil: "2027-08-31" },
    ]);
    expect(first.status).toBe(200);

    const second = await importRows([{ name: "Marie Test", email }]);
    expect(second.status).toBe(200);
    const body = await second.json();
    expect(body.updated).toBe(1);

    const profile = await loadProfile();
    expect(profile.licenseNumber).toBe("1234567");
    expect(profile.phoneOverride).toBe("0601020304");
    expect(profile.licenseValidUntil?.toISOString().slice(0, 10)).toBe("2027-08-31");
  });

  it("only updates the columns the re-import provides", async () => {
    const res = await importRows([{ name: "Marie Test", email, phone: "0699999999" }]);
    expect(res.status).toBe(200);

    const profile = await loadProfile();
    expect(profile.phoneOverride).toBe("0699999999");
    expect(profile.licenseNumber).toBe("1234567");
  });
});
