import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestUser, cleanupTestUser, get, post } from "../helpers";

describe("E2EE API (/api/e2ee)", () => {
  let userId: string;
  let headers: Headers;
  let otherUserId: string;
  let otherHeaders: Headers;

  beforeAll(async () => {
    const { user, headers: h } = await createTestUser();
    userId = user.id;
    headers = h;

    const other = await createTestUser({ name: "E2EE Peer" });
    otherUserId = other.user.id;
    otherHeaders = other.headers;
  });

  afterAll(async () => {
    await cleanupTestUser(otherUserId);
    await cleanupTestUser(userId);
  });

  // Note: e2ee router is not currently mounted in server/router.ts
  // These tests verify the routes return 404 until mounted

  describe("POST /api/e2ee/keys", () => {
    it("should return 404 (router not mounted)", async () => {
      const res = await post(
        "/api/e2ee/keys",
        { publicKey: "test-public-key-base64-encoded" },
        { headers },
      );
      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/e2ee/public-key/:userId", () => {
    it("should return 404 (router not mounted)", async () => {
      const res = await get(`/api/e2ee/public-key/${otherUserId}`, { headers });
      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/e2ee/key-backup", () => {
    it("should return 404 (router not mounted)", async () => {
      const res = await post(
        "/api/e2ee/key-backup",
        {
          encryptedPrivateKey: "encrypted-private-key-data",
          backupSalt: "random-salt-value",
        },
        { headers },
      );
      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/e2ee/key-backup", () => {
    it("should return 404 (router not mounted)", async () => {
      const res = await get("/api/e2ee/key-backup", { headers });
      expect(res.status).toBe(404);
    });
  });
});
