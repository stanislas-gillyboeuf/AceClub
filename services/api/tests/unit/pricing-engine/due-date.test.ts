import { describe, expect, it } from "vitest";
import { DEFAULT_PAYMENT_DELAY_DAYS, effectiveDueDate, isOverdue } from "../../../server/pricing/lib/due-date";

const DAY = 24 * 60 * 60 * 1000;
const created = new Date("2026-09-01T10:00:00Z");
const issued = new Date("2026-09-10T10:00:00Z");

describe("effectiveDueDate", () => {
  it("uses the grid payment deadline when set", () => {
    const due = new Date("2026-10-15T00:00:00Z");
    expect(effectiveDueDate({ paymentDueDate: due, issuedAt: issued, createdAt: created })).toEqual(due);
  });

  it("falls back to 30 days after issuance", () => {
    const due = effectiveDueDate({ paymentDueDate: null, issuedAt: issued, createdAt: created });
    expect(due.getTime()).toBe(issued.getTime() + DEFAULT_PAYMENT_DELAY_DAYS * DAY);
  });

  it("falls back to creation date for records without issuedAt", () => {
    const due = effectiveDueDate({ paymentDueDate: null, issuedAt: null, createdAt: created });
    expect(due.getTime()).toBe(created.getTime() + 30 * DAY);
  });
});

describe("isOverdue", () => {
  const base = { paymentDueDate: null, issuedAt: issued, createdAt: created };

  it("is overdue once the effective due date has passed", () => {
    expect(isOverdue({ ...base, status: "pending" }, new Date(issued.getTime() + 31 * DAY))).toBe(true);
  });

  it("is not overdue before the due date", () => {
    expect(isOverdue({ ...base, status: "pending" }, new Date(issued.getTime() + 29 * DAY))).toBe(false);
  });

  it("never flags paid or waived cotisations", () => {
    const late = new Date(issued.getTime() + 90 * DAY);
    expect(isOverdue({ ...base, status: "paid" }, late)).toBe(false);
    expect(isOverdue({ ...base, status: "waived" }, late)).toBe(false);
  });

  it("uses the explicit deadline over the 30-day default", () => {
    const deadline = new Date("2026-09-20T00:00:00Z");
    expect(isOverdue({ ...base, paymentDueDate: deadline, status: "pending" }, new Date("2026-09-21T00:00:00Z"))).toBe(true);
  });
});
