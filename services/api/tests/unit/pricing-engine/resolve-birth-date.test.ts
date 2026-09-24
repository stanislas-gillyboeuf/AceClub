import { describe, expect, it } from "vitest";
import { resolveBirthDate } from "../../../server/pricing/lib/resolve-birth-date";

describe("resolveBirthDate", () => {
  it("prefers the club-level date over the account's", () => {
    expect(resolveBirthDate("2010-12-31", "2000-01-01")).toBe("2010-12-31");
  });

  it("falls back to the account's date when the club has none", () => {
    expect(resolveBirthDate(null, "2000-01-01")).toBe("2000-01-01");
    expect(resolveBirthDate(undefined, "2000-01-01")).toBe("2000-01-01");
  });

  it("skips a non-ISO club value and uses the account's valid one", () => {
    expect(resolveBirthDate("31/12/2010", "2000-01-01")).toBe("2000-01-01");
  });

  it("returns undefined when neither source is a real ISO date", () => {
    expect(resolveBirthDate("31/12/2010", "2010-02-30")).toBeUndefined();
    expect(resolveBirthDate(null, null)).toBeUndefined();
    expect(resolveBirthDate("", "")).toBeUndefined();
  });
});
