import { describe, expect, it } from "vitest";
import { normalizePhoneE164, phoneLookupCandidates } from "../../lib/phone";

describe("normalizePhoneE164", () => {
  it("reads a French national number as +33", () => {
    expect(normalizePhoneE164("0612345678")).toBe("+33612345678");
  });

  it("accepts spaces, dots and dashes", () => {
    expect(normalizePhoneE164("06 12 34 56 78")).toBe("+33612345678");
    expect(normalizePhoneE164("06.12.34.56.78")).toBe("+33612345678");
    expect(normalizePhoneE164("06-12-34-56-78")).toBe("+33612345678");
  });

  it("accepts an already-international number", () => {
    expect(normalizePhoneE164("+33612345678")).toBe("+33612345678");
  });

  it("accepts a 00-prefixed international number", () => {
    expect(normalizePhoneE164("0033612345678")).toBe("+33612345678");
  });

  it("rejects text and empty input", () => {
    expect(normalizePhoneE164("not a phone")).toBeNull();
    expect(normalizePhoneE164("")).toBeNull();
  });

  it("rejects a number that is too short or too long", () => {
    expect(normalizePhoneE164("+331")).toBeNull();
    expect(normalizePhoneE164("+" + "1".repeat(20))).toBeNull();
  });
});

describe("phoneLookupCandidates", () => {
  it("returns every plausible stored form of a French number", () => {
    const candidates = phoneLookupCandidates("06 12 34 56 78");
    expect(candidates).toEqual(
      expect.arrayContaining(["+33612345678", "33612345678", "0612345678"]),
    );
  });

  it("returns an empty list for an unparsable number", () => {
    expect(phoneLookupCandidates("nope")).toEqual([]);
  });
});
