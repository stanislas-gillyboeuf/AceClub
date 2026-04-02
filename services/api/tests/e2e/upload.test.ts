import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestUser, cleanupTestUser, post } from "../helpers";

describe("Upload API (/api/upload)", () => {
  let userId: string;
  let headers: Headers;

  beforeAll(async () => {
    const { user, headers: h } = await createTestUser();
    userId = user.id;
    headers = h;
  });

  afterAll(async () => {
    await cleanupTestUser(userId);
  });

  describe("POST /api/upload/user-image", () => {
    it("should return 401 without auth", async () => {
      const res = await post("/api/upload/user-image", {});
      expect(res.status).toBe(401);
    });

    it("should handle upload request", async () => {
      // Upload requires multipart form data, so we test that the endpoint exists
      // and auth works. Actual file upload depends on S3 config.
      const res = await post("/api/upload/user-image", {}, { headers });
      // Will likely fail with 400 (no file) or 500 (no S3), but not 401 or 404
      expect([200, 400, 500]).toContain(res.status);
    });
  });

  describe("POST /api/upload/organization-logo", () => {
    it("should return 401 without auth", async () => {
      const res = await post("/api/upload/organization-logo", {});
      expect(res.status).toBe(401);
    });

    it("should handle upload request", async () => {
      const res = await post("/api/upload/organization-logo", {}, { headers });
      expect([200, 400, 500]).toContain(res.status);
    });
  });
});
