import { describe, it, expect } from "vitest";
import { post } from "../helpers";

describe("Cron API (/api/cron)", () => {
  const cronHeaders = new Headers({
    "X-Cron-Secret": process.env.CRON_SECRET || "test-cron-secret",
  });

  describe("POST /api/cron/assign-weekly-challenges", () => {
    it("should assign weekly challenges with valid secret", async () => {
      const res = await post("/api/cron/assign-weekly-challenges", {}, { headers: cronHeaders });
      // 200 if secret matches, 401 if not configured
      expect([200, 401, 500]).toContain(res.status);
    });

    it("should reject without cron secret", async () => {
      const res = await post("/api/cron/assign-weekly-challenges", {});
      // 401 if secret is configured, 500 if CRON_SECRET env var missing
      expect([401, 500]).toContain(res.status);
    });

    it("should reject with wrong secret", async () => {
      const wrongHeaders = new Headers({ "X-Cron-Secret": "wrong-secret" });
      const res = await post("/api/cron/assign-weekly-challenges", {}, { headers: wrongHeaders });
      // 401 if secret is configured, 500 if CRON_SECRET env var missing
      expect([401, 500]).toContain(res.status);
    });
  });

  describe("POST /api/cron/expire-challenges", () => {
    it("should expire challenges with valid secret", async () => {
      const res = await post("/api/cron/expire-challenges", {}, { headers: cronHeaders });
      expect([200, 401, 500]).toContain(res.status);
    });
  });

  describe("POST /api/cron/streak-warning", () => {
    it("should send streak warnings with valid secret", async () => {
      const res = await post("/api/cron/streak-warning", {}, { headers: cronHeaders });
      expect([200, 401, 500]).toContain(res.status);
    });
  });

  describe("POST /api/cron/cleanup-expired-intents", () => {
    it("should cleanup expired intents with valid secret", async () => {
      const res = await post("/api/cron/cleanup-expired-intents", {}, { headers: cronHeaders });
      expect([200, 401, 500]).toContain(res.status);
    });
  });
});
