import { testAuth } from "./test-auth";
import { app } from "../index";
import { db } from "../db";
import { ulid } from "ulid";
import {
  user as userTable,
  member as memberTable,
  organization as orgTable,
} from "../db/schema/auth/schema";
import { eq } from "drizzle-orm";

// Re-export db for direct queries in tests
export { db };

type TestHelpers = Awaited<ReturnType<typeof testAuth.$context>>["test"];

let _test: TestHelpers;

export async function getTestHelpers(): Promise<TestHelpers> {
  if (!_test) {
    const ctx = await testAuth.$context;
    _test = ctx.test;
  }
  return _test;
}

/**
 * Create a test user in the DB and return auth headers for authenticated requests.
 */
export async function createTestUser(overrides?: {
  email?: string;
  name?: string;
  role?: string;
  onboardingCompleted?: boolean;
}) {
  const test = await getTestHelpers();

  const user = test.createUser({
    email: overrides?.email ?? `test-${ulid().toLowerCase()}@example.com`,
    name: overrides?.name ?? "Test User",
    emailVerified: true,
  });

  const savedUser = await test.saveUser(user);

  // Set role if admin
  if (overrides?.role === "admin") {
    await db
      .update(userTable)
      .set({ role: "admin" })
      .where(eq(userTable.id, savedUser.id));
  }

  // Set onboarding completed
  if (overrides?.onboardingCompleted) {
    await db
      .update(userTable)
      .set({ onboarding_completed: true })
      .where(eq(userTable.id, savedUser.id));
  }

  const headers = await test.getAuthHeaders({ userId: savedUser.id });

  return { user: savedUser, headers };
}

/**
 * Create a test organization and add the user as owner.
 */
export async function createTestOrganization(
  userId: string,
  overrides?: { name?: string; slug?: string },
) {
  const orgId = ulid();
  const slug = overrides?.slug ?? `test-org-${orgId.toLowerCase()}`;

  await db.insert(orgTable).values({
    id: orgId,
    name: overrides?.name ?? "Test Organization",
    slug,
    createdAt: new Date(),
  });

  // Add user as owner
  const memberId = ulid();
  await db.insert(memberTable).values({
    id: memberId,
    userId,
    organizationId: orgId,
    role: "owner",
    createdAt: new Date(),
  });

  return { organizationId: orgId, slug, memberId };
}

/**
 * Clean up a test user and all related data.
 */
export async function cleanupTestUser(userId: string) {
  const test = await getTestHelpers();
  try {
    await test.deleteUser(userId);
  } catch {
    // Ignore if already deleted
  }
}

/**
 * Clean up a test organization.
 */
export async function cleanupTestOrganization(orgId: string) {
  try {
    await db.delete(memberTable).where(eq(memberTable.organizationId, orgId));
    await db.delete(orgTable).where(eq(orgTable.id, orgId));
  } catch {
    // Ignore
  }
}

/**
 * Make an authenticated request to the Hono app.
 */
export async function request(
  method: string,
  path: string,
  options?: {
    headers?: Headers;
    body?: Record<string, unknown>;
    query?: Record<string, string>;
  },
) {
  let url = `http://localhost:3000${path}`;

  if (options?.query) {
    const params = new URLSearchParams(options.query);
    url += `?${params.toString()}`;
  }

  const reqHeaders = new Headers(options?.headers ?? {});
  if (options?.body) {
    reqHeaders.set("Content-Type", "application/json");
  }

  const req = new Request(url, {
    method,
    headers: reqHeaders,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  return app.fetch(req);
}

/**
 * Shorthand: GET request
 */
export async function get(
  path: string,
  options?: { headers?: Headers; query?: Record<string, string> },
) {
  return request("GET", path, options);
}

/**
 * Shorthand: POST request
 */
export async function post(
  path: string,
  body?: Record<string, unknown>,
  options?: { headers?: Headers },
) {
  return request("POST", path, { ...options, body });
}

/**
 * Shorthand: PUT request
 */
export async function put(
  path: string,
  body?: Record<string, unknown>,
  options?: { headers?: Headers },
) {
  return request("PUT", path, { ...options, body });
}

/**
 * Shorthand: DELETE request
 */
export async function del(
  path: string,
  options?: { headers?: Headers; body?: Record<string, unknown> },
) {
  return request("DELETE", path, options);
}
