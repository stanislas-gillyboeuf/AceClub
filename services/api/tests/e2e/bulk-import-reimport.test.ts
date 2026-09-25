import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestUser,
  createTestOrganization,
  cleanupTestUser,
  cleanupTestOrganization,
  get,
  post,
  db,
} from "../helpers";
import { clubMemberProfile, clubMemberTag, clubTag, household, member, user } from "../../db/schema";
import { isTechnicalEmail } from "../../lib/technical-email";
import { and, eq, inArray } from "drizzle-orm";

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

describe("club-member bulk-import — families, children without email, statuses", () => {
  let ownerId: string;
  let ownerHeaders: Headers;
  let orgId: string;
  const parentEmail = `parent-${Date.now()}@example.com`;

  const familyRows = [
    { name: "Claire Martin", email: parentEmail, dateOfBirth: "1985-03-12", householdKey: parentEmail, tags: ["Bureau"] },
    // Child with no email of their own: identified by name + date of birth.
    { name: "Léa Martin", dateOfBirth: "2014-09-02", householdKey: parentEmail, tags: ["Étudiant", "bureau"] },
    // Another child using the parent's address: a household member, not a duplicate.
    { name: "Hugo Martin", email: parentEmail, dateOfBirth: "2016-01-20", householdKey: parentEmail },
  ];

  beforeAll(async () => {
    const owner = await createTestUser({ name: "Owner Families" });
    ownerId = owner.user.id;
    ownerHeaders = owner.headers;
    const org = await createTestOrganization(ownerId, { name: "Club Families" });
    orgId = org.organizationId;
  });

  afterAll(async () => {
    const members = await db.select({ userId: member.userId }).from(member).where(eq(member.organizationId, orgId));
    await db.delete(clubMemberTag).where(eq(clubMemberTag.organizationId, orgId));
    await db.delete(clubTag).where(eq(clubTag.organizationId, orgId));
    await db.delete(clubMemberProfile).where(eq(clubMemberProfile.organizationId, orgId));
    await db.delete(household).where(eq(household.organizationId, orgId));
    for (const m of members) if (m.userId !== ownerId) await cleanupTestUser(m.userId);
    await cleanupTestOrganization(orgId);
    await cleanupTestUser(ownerId);
  });

  async function importFamily() {
    const res = await post("/api/club-member/bulk-import", { organizationId: orgId, rows: familyRows }, { headers: ownerHeaders });
    return { res, body: await res.json() };
  }

  it("builds one household from rows that share the responsible email", async () => {
    const { res, body } = await importFamily();
    expect(res.status).toBe(200);
    expect(body.created).toBe(3);
    expect(body.skipped).toEqual([]);
    expect(body.households).toBe(1);

    const households = await db.select().from(household).where(eq(household.organizationId, orgId));
    expect(households).toHaveLength(1);
    expect(households[0].contactEmail).toBe(parentEmail);

    const profiles = await db
      .select({ householdId: clubMemberProfile.householdId })
      .from(clubMemberProfile)
      .where(eq(clubMemberProfile.organizationId, orgId));
    expect(profiles.filter((p) => p.householdId === households[0].id)).toHaveLength(3);
  });

  it("gives the children a technical email that the API never exposes", async () => {
    const members = await db.select({ userId: member.userId }).from(member).where(eq(member.organizationId, orgId));
    const users = await db
      .select({ email: user.email, name: user.name })
      .from(user)
      .where(inArray(user.id, members.map((m) => m.userId)));
    const children = users.filter((u) => u.name.endsWith("Martin") && u.name !== "Claire Martin");
    expect(children).toHaveLength(2);
    for (const child of children) expect(isTechnicalEmail(child.email)).toBe(true);

    const list = await get("/api/club-member/list", { headers: ownerHeaders, query: { organizationId: orgId, limit: "100" } });
    const text = await list.text();
    expect(text).not.toContain("noreply.aceclub.app");
  });

  it("creates the missing statuses once, ignoring case and accents", async () => {
    const tags = await db.select({ name: clubTag.name }).from(clubTag).where(eq(clubTag.organizationId, orgId));
    expect(tags).toHaveLength(2);
    const assignments = await db.select().from(clubMemberTag).where(eq(clubMemberTag.organizationId, orgId));
    expect(assignments).toHaveLength(3);
  });

  it("is idempotent: importing the same file again creates nothing", async () => {
    const { res, body } = await importFamily();
    expect(res.status).toBe(200);
    expect(body.created).toBe(0);

    const members = await db.select({ id: member.id }).from(member).where(eq(member.organizationId, orgId));
    expect(members).toHaveLength(4);
    const households = await db.select({ id: household.id }).from(household).where(eq(household.organizationId, orgId));
    expect(households).toHaveLength(1);
    const assignments = await db.select({ id: clubMemberTag.id }).from(clubMemberTag).where(eq(clubMemberTag.organizationId, orgId));
    expect(assignments).toHaveLength(3);
  });

  it("rejects a row that has neither an email nor a date of birth", async () => {
    const res = await post(
      "/api/club-member/bulk-import",
      { organizationId: orgId, rows: [{ name: "Inconnu" }] },
      { headers: ownerHeaders },
    );
    expect(res.status).toBe(400);
  });

  it("refuses a technical address supplied by the client", async () => {
    const res = await post(
      "/api/club-member/bulk-import",
      { organizationId: orgId, rows: [{ name: "Pirate", email: "ghost+abc@noreply.aceclub.app", dateOfBirth: "2000-01-01" }] },
      { headers: ownerHeaders },
    );
    expect(res.status).toBe(400);
  });
});
