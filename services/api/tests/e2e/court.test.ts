import { describe, it, expect, beforeAll, afterAll } from "vitest";
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
import { court, courtBooking } from "../../db/schema";
import { eq } from "drizzle-orm";

function tomorrowDate(): string {
  const d = new Date(Date.now() + 86400000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

describe("Court API (/api/court)", () => {
  let userId: string;
  let headers: Headers;
  let otherUserId: string;
  let otherHeaders: Headers;
  let orgId: string;
  let courtId: string;
  let bookingId: string;

  const date = tomorrowDate();

  beforeAll(async () => {
    const { user, headers: h } = await createTestUser();
    userId = user.id;
    headers = h;

    const other = await createTestUser({ name: "Other Player" });
    otherUserId = other.user.id;
    otherHeaders = other.headers;

    const org = await createTestOrganization(userId);
    orgId = org.organizationId;

    const [createdCourt] = await db
      .insert(court)
      .values({
        id: ulid(),
        organizationId: orgId,
        name: "Court Test",
        surface: "hard",
        indoor: false,
        isActive: true,
      })
      .returning();
    courtId = createdCourt.id;
  });

  afterAll(async () => {
    await db.delete(courtBooking).where(eq(courtBooking.courtId, courtId));
    await db.delete(court).where(eq(court.id, courtId));
    await cleanupTestOrganization(orgId);
    await cleanupTestUser(otherUserId);
    await cleanupTestUser(userId);
  });

  describe("GET /api/court/list", () => {
    it("should list active courts for an organization", async () => {
      const res = await get("/api/court/list", {
        headers,
        query: { organizationId: orgId },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.some((c: { id: string }) => c.id === courtId)).toBe(true);
    });

    it("should return 401 without auth", async () => {
      const res = await get("/api/court/list", { query: { organizationId: orgId } });
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/court/availability", () => {
    it("should return a full day of slots, all available", async () => {
      const res = await get("/api/court/availability", {
        headers,
        query: { courtId, date },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.slots.length).toBe(14); // 8h-22h, 1h slots
      expect(data.slots.every((s: { available: boolean }) => s.available)).toBe(true);
    });
  });

  describe("POST /api/court/book", () => {
    it("should create a booking", async () => {
      const res = await post(
        "/api/court/book",
        { courtId, date, startTime: "10:00" },
        { headers },
      );
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.id).toBeDefined();
      expect(data.courtName).toBe("Court Test");
      bookingId = data.id;
    });

    it("should mark the slot as unavailable afterwards", async () => {
      const res = await get("/api/court/availability", {
        headers,
        query: { courtId, date },
      });
      const data = await res.json();
      const slot = data.slots.find((s: { startTime: string }) => s.startTime === "10:00");
      expect(slot.available).toBe(false);
    });

    it("should return 409 on overlapping booking from another user", async () => {
      const res = await post(
        "/api/court/book",
        { courtId, date, startTime: "10:00" },
        { headers: otherHeaders },
      );
      expect(res.status).toBe(409);
    });

    it("should return 401 without auth", async () => {
      const res = await post("/api/court/book", { courtId, date, startTime: "11:00" });
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/court/my-bookings", () => {
    it("should list the booking under upcoming", async () => {
      const res = await get("/api/court/my-bookings", {
        headers,
        query: { filter: "upcoming" },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.some((b: { id: string }) => b.id === bookingId)).toBe(true);
    });
  });

  describe("POST /api/court/cancel-booking", () => {
    it("should forbid cancelling someone else's booking", async () => {
      const res = await post("/api/court/cancel-booking", { bookingId }, { headers: otherHeaders });
      expect(res.status).toBe(403);
    });

    it("should cancel the booking", async () => {
      const res = await post("/api/court/cancel-booking", { bookingId }, { headers });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe("cancelled");
    });

    it("should free the slot back up", async () => {
      const res = await get("/api/court/availability", {
        headers,
        query: { courtId, date },
      });
      const data = await res.json();
      const slot = data.slots.find((s: { startTime: string }) => s.startTime === "10:00");
      expect(slot.available).toBe(true);
    });

    it("should list the cancelled booking under past", async () => {
      const res = await get("/api/court/my-bookings", {
        headers,
        query: { filter: "past" },
      });
      const data = await res.json();
      expect(data.some((b: { id: string }) => b.id === bookingId)).toBe(true);
    });
  });
});
