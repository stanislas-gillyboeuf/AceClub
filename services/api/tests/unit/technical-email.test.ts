import { describe, expect, it } from "vitest";
import {
  GHOST_EMAIL_DOMAIN,
  TECHNICAL_EMAIL_LIKE,
  isTechnicalEmail,
  makeGhostEmail,
  publicEmail,
} from "../../lib/technical-email";

describe("makeGhostEmail", () => {
  it("builds a lowercase ghost+<ulid> address on the technical domain", () => {
    const email = makeGhostEmail();
    expect(email).toMatch(/^ghost\+[0-9a-z]{26}@noreply\.aceclub\.app$/);
    expect(email.endsWith(`@${GHOST_EMAIL_DOMAIN}`)).toBe(true);
  });

  it("never repeats", () => {
    const set = new Set(Array.from({ length: 200 }, () => makeGhostEmail()));
    expect(set.size).toBe(200);
  });
});

describe("isTechnicalEmail", () => {
  it("recognises generated addresses, ignoring case and surrounding spaces", () => {
    expect(isTechnicalEmail(makeGhostEmail())).toBe(true);
    expect(isTechnicalEmail("  GHOST+01ARZ3NDEKTSV4RRFFQ69G5FAV@NOREPLY.ACEclub.app ")).toBe(true);
  });

  it("does not flag real addresses, lookalikes or empty values", () => {
    expect(isTechnicalEmail("marie@gmail.com")).toBe(false);
    expect(isTechnicalEmail("ghost@noreply.aceclub.app")).toBe(false);
    expect(isTechnicalEmail("ghost+abc@aceclub.app")).toBe(false);
    expect(isTechnicalEmail("ghost+abc@noreply.aceclub.app.evil.com")).toBe(false);
    expect(isTechnicalEmail("")).toBe(false);
    expect(isTechnicalEmail(null)).toBe(false);
    expect(isTechnicalEmail(undefined)).toBe(false);
  });
});

describe("publicEmail", () => {
  it("hides technical addresses and keeps real ones", () => {
    expect(publicEmail(makeGhostEmail())).toBeNull();
    expect(publicEmail("marie@gmail.com")).toBe("marie@gmail.com");
    expect(publicEmail(null)).toBeNull();
  });
});

describe("TECHNICAL_EMAIL_LIKE", () => {
  it("is a SQL LIKE pattern over the technical shape", () => {
    expect(TECHNICAL_EMAIL_LIKE).toBe("ghost+%@noreply.aceclub.app");
  });
});
