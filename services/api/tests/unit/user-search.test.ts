import { describe, expect, it } from "vitest";
import { classifySearchQuery, escapeLike, MIN_SEARCH_LENGTH } from "../../lib/user-search";

describe("classifySearchQuery", () => {
  it("classifies a query shorter than the minimum length as empty", () => {
    expect(classifySearchQuery("a")).toEqual({ kind: "empty" });
    expect(classifySearchQuery("  ")).toEqual({ kind: "empty" });
    expect("a".length).toBeLessThan(MIN_SEARCH_LENGTH);
  });

  it("classifies an email", () => {
    expect(classifySearchQuery("Player@Example.com")).toEqual({
      kind: "email",
      email: "player@example.com",
    });
  });

  it("classifies a phone number and lists its lookup forms", () => {
    const result = classifySearchQuery("06 12 34 56 78");
    expect(result.kind).toBe("phone");
    if (result.kind === "phone") {
      expect(result.candidates).toEqual(expect.arrayContaining(["+33612345678", "0612345678"]));
    }
  });

  it("classifies free text as text", () => {
    expect(classifySearchQuery("Jean Dup")).toEqual({ kind: "text", text: "Jean Dup" });
  });
});

describe("escapeLike", () => {
  it("escapes LIKE wildcard characters", () => {
    expect(escapeLike("50% off_deal")).toBe("50\\% off\\_deal");
  });

  it("escapes a literal backslash", () => {
    expect(escapeLike("a\\b")).toBe("a\\\\b");
  });

  it("leaves normal text untouched", () => {
    expect(escapeLike("Jean Dupont")).toBe("Jean Dupont");
  });
});
