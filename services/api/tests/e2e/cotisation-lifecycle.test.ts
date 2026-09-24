import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import { ulid } from "ulid";
import {
  createTestUser,
  createTestOrganization,
  cleanupTestUser,
  cleanupTestOrganization,
  get,
  post,
  db,
} from "../helpers";
import {
  clubMemberProfile,
  member,
  tarifAgeCategory,
  tarifBaseRate,
  tarifGrid,
  user,
} from "../../db/schema";
import { eq } from "drizzle-orm";

// Only sendEmail is mocked — the rest of the mailer module (used by auth) stays real.
vi.mock("../../services/mailer", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../services/mailer")>();
  return { ...actual, sendEmail: vi.fn(async () => ({ success: true })) };
});
import { sendEmail } from "../../services/mailer";

const SEASON = "2099-2100";
const MEMBERSHIP_FEE_CENTS = 10000;

interface TestMember {
  userId: string;
  headers: Headers;
}

describe("Cotisation lifecycle (issue, remind, pay, receipt)", () => {
  let owner: TestMember;
  let orgId: string;
  let marieId: string;
  let paulId: string;
  const userIds: string[] = [];

  async function addCompleteMember(name: string): Promise<string> {
    const u = await createTestUser({ name });
    userIds.push(u.user.id);
    await db.update(user).set({ date_of_birth: "1990-06-15" }).where(eq(user.id, u.user.id));
    await db.insert(member).values({
      id: ulid(),
      userId: u.user.id,
      organizationId: orgId,
      role: "member",
      createdAt: new Date(),
    });
    // Licensed elsewhere: the license line is 0 and needs no other profile datum.
    await db.insert(clubMemberProfile).values({
      id: ulid(),
      userId: u.user.id,
      organizationId: orgId,
      licensedElsewhere: true,
    });
    return u.user.id;
  }

  async function memberRow(userId: string) {
    const res = await get("/api/pricing/member-cotisations", {
      headers: owner.headers,
      query: { organizationId: orgId, seasonLabel: SEASON },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    return body.members.find((m: { userId: string }) => m.userId === userId);
  }

  beforeAll(async () => {
    const o = await createTestUser({ name: "Cotisation Owner" });
    userIds.push(o.user.id);
    owner = { userId: o.user.id, headers: o.headers };
    const org = await createTestOrganization(o.user.id, { name: "Club Cotisation" });
    orgId = org.organizationId;

    const gridId = ulid();
    await db.insert(tarifGrid).values({
      id: gridId,
      organizationId: orgId,
      familyId: gridId,
      seasonLabel: SEASON,
      seasonStartDate: new Date("2099-09-01T00:00:00Z"),
      seasonEndDate: new Date("2100-08-31T00:00:00Z"),
      status: "active",
      createdByUserId: owner.userId,
    });
    const categoryId = ulid();
    await db
      .insert(tarifAgeCategory)
      .values({ id: categoryId, tarifGridId: gridId, name: "Tous", minAge: 0, maxAge: null });
    await db.insert(tarifBaseRate).values({
      id: ulid(),
      tarifGridId: gridId,
      categoryId,
      membershipFeeCents: MEMBERSHIP_FEE_CENTS,
      licenseFeeCents: 3500,
    });

    marieId = await addCompleteMember("Marie Complete");
  });

  beforeEach(() => {
    vi.mocked(sendEmail).mockClear();
    vi.mocked(sendEmail).mockImplementation(async () => ({ success: true }));
  });

  afterAll(async () => {
    await cleanupTestOrganization(orgId); // cascades grid, categories, rates, cotisations
    for (const id of userIds) await cleanupTestUser(id);
  });

  it("lists a member without record as not_generated with a live price; an incomplete profile has no price", async () => {
    const marie = await memberRow(marieId);
    expect(marie.status).toBe("not_generated");
    expect(marie.amountCents).toBe(MEMBERSHIP_FEE_CENTS);

    const ownerRow = await memberRow(owner.userId);
    expect(ownerRow.status).toBe("not_generated");
    expect(ownerRow.amountCents).toBeNull();
    expect(ownerRow.breakdown.missingFields).toContain("birthDate");
  });

  it("cannot remind a cotisation that was never issued, and does not create one implicitly", async () => {
    const res = await post(
      "/api/pricing/member-cotisations/send-reminder",
      { organizationId: orgId, userId: marieId, seasonLabel: SEASON },
      { headers: owner.headers },
    );
    expect(res.status).toBe(404);
    expect((await memberRow(marieId)).status).toBe("not_generated");
  });

  it("refuses to issue a cotisation for an incomplete profile", async () => {
    const res = await post(
      "/api/pricing/member-cotisations/issue",
      { organizationId: orgId, userId: owner.userId, seasonLabel: SEASON },
      { headers: owner.headers },
    );
    expect(res.status).toBe(400);
    expect((await res.json()).missingFields).toContain("birthDate");
  });

  it("issue gives a pending cotisation (frozen amount, one email); issuing again is a no-op", async () => {
    const res = await post(
      "/api/pricing/member-cotisations/issue",
      { organizationId: orgId, userId: marieId, seasonLabel: SEASON },
      { headers: owner.headers },
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.created).toBe(true);
    expect(body.emailSent).toBe(true);
    expect(body.record.status).toBe("pending");
    expect(body.record.amountCents).toBe(MEMBERSHIP_FEE_CENTS);
    expect(body.record.issuedAt).toBeTruthy();
    expect(sendEmail).toHaveBeenCalledTimes(1);

    const again = await post(
      "/api/pricing/member-cotisations/issue",
      { organizationId: orgId, userId: marieId, seasonLabel: SEASON },
      { headers: owner.headers },
    );
    expect(again.status).toBe(200);
    expect((await again.json()).created).toBe(false);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect((await memberRow(marieId)).status).toBe("pending");
  });

  it("can remind a pending cotisation", async () => {
    const res = await post(
      "/api/pricing/member-cotisations/send-reminder",
      { organizationId: orgId, userId: marieId, seasonLabel: SEASON },
      { headers: owner.headers },
    );
    expect(res.status).toBe(201);
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  it("pending, then paid, then receipt PDF; a paid cotisation can no longer be reminded", async () => {
    const paid = await post(
      "/api/pricing/member-cotisations/mark-paid",
      { organizationId: orgId, userId: marieId, seasonLabel: SEASON, paidMethod: "Cheque" },
      { headers: owner.headers },
    );
    expect(paid.status).toBe(200);
    expect((await paid.json()).status).toBe("paid");

    const receipt = await get("/api/pricing/member-cotisations/receipt", {
      headers: owner.headers,
      query: { organizationId: orgId, userId: marieId, seasonLabel: SEASON },
    });
    expect(receipt.status).toBe(200);
    expect(receipt.headers.get("Content-Type")).toBe("application/pdf");

    const remind = await post(
      "/api/pricing/member-cotisations/send-reminder",
      { organizationId: orgId, userId: marieId, seasonLabel: SEASON },
      { headers: owner.headers },
    );
    expect(remind.status).toBe(400);
  });

  it("issue-all issues complete profiles, skips incomplete ones, and an email failure never blocks creation", async () => {
    paulId = await addCompleteMember("Paul Complete");
    vi.mocked(sendEmail).mockImplementation(async () => ({ success: false, reason: "smtp down" }));

    const res = await post(
      "/api/pricing/member-cotisations/issue-all",
      { organizationId: orgId, seasonLabel: SEASON },
      { headers: owner.headers },
    );
    expect(res.status).toBe(200);
    const body = await res.json();

    // Marie already has a record, so she is ignored. Paul is issued. The owner (no birth date) is skipped.
    expect(body.issued).toBe(1);
    expect(body.skippedIncomplete.map((s: { userId: string }) => s.userId)).toEqual([owner.userId]);
    expect(body.skippedIncomplete[0].missingFields).toContain("birthDate");
    expect(body.emailFailed).toHaveLength(1);
    expect(body.emailFailed[0]).toMatchObject({ userId: paulId, reason: "smtp down" });

    const paul = await memberRow(paulId);
    expect(paul.status).toBe("pending");
    expect(paul.amountCents).toBe(MEMBERSHIP_FEE_CENTS);

    // Running it again issues nobody and sends nothing.
    vi.mocked(sendEmail).mockClear();
    const second = await post(
      "/api/pricing/member-cotisations/issue-all",
      { organizationId: orgId, seasonLabel: SEASON },
      { headers: owner.headers },
    );
    expect((await second.json()).issued).toBe(0);
    expect(sendEmail).not.toHaveBeenCalled();
  });
});
