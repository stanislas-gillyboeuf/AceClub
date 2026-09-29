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
import { organization } from "../../db/schema";
import { eq } from "drizzle-orm";

describe("public organization lookup + client flag", () => {
  let ownerId: string;
  let superAdminId: string;
  let superAdminHeaders: Headers;
  let memberHeaders: Headers;
  let orgId: string;
  let slug: string;

  beforeAll(async () => {
    const owner = await createTestUser({ name: "Owner" });
    ownerId = owner.user.id;

    const superAdmin = await createTestUser({ name: "SuperAdmin", role: "admin" });
    superAdminId = superAdmin.user.id;
    superAdminHeaders = superAdmin.headers;

    const plainMember = await createTestUser({ name: "Plain member" });
    memberHeaders = plainMember.headers;

    const org = await createTestOrganization(ownerId, { name: "Public Org Test" });
    orgId = org.organizationId;
    slug = org.slug;
  });

  afterAll(async () => {
    await cleanupTestOrganization(orgId);
    await cleanupTestUser(ownerId);
    await cleanupTestUser(superAdminId);
  });

  it("returns 404 for an unknown slug", async () => {
    const res = await get("/api/organization/public-by-slug", {
      query: { slug: "this-slug-does-not-exist" },
    });
    expect(res.status).toBe(404);
  });

  it("returns 404 for a club that exists but isn't marked as a client", async () => {
    const [org] = await db.select().from(organization).where(eq(organization.id, orgId)).limit(1);
    expect(org?.isClient).toBe(false);

    const res = await get("/api/organization/public-by-slug", { query: { slug } });
    expect(res.status).toBe(404);
  });

  it("a non-admin cannot toggle isClient", async () => {
    const res = await post(
      "/api/admin/update-organization",
      { organizationId: orgId, data: { isClient: true } },
      { headers: memberHeaders },
    );
    expect(res.status).toBe(403);
  });

  it("a super-admin can toggle isClient, then the public route returns the minimal payload", async () => {
    const toggleRes = await post(
      "/api/admin/update-organization",
      { organizationId: orgId, data: { isClient: true } },
      { headers: superAdminHeaders },
    );
    expect(toggleRes.status).toBe(200);

    const res = await get("/api/organization/public-by-slug", { query: { slug } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      id: orgId,
      name: "Public Org Test",
      slug,
      logo: null,
    });
    // Never leaks address, PIN, metadata, or isClient itself.
    expect(body).not.toHaveProperty("isClient");
    expect(body).not.toHaveProperty("pin");
    expect(body).not.toHaveProperty("address");
  });

  it("the public route requires no authentication at all", async () => {
    const res = await get("/api/organization/public-by-slug", { query: { slug } });
    expect(res.status).toBe(200);
  });
});
