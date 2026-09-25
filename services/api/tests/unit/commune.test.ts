import { describe, expect, it } from "vitest";
import { normalizeCommuneName, pickCommune } from "../../server/club-member/lib/commune";

describe("normalizeCommuneName", () => {
  it("makes St / Saint, accents, hyphens and apostrophes comparable", () => {
    expect(normalizeCommuneName("St-Malo")).toBe("saint malo");
    expect(normalizeCommuneName("Saint Malo")).toBe("saint malo");
    expect(normalizeCommuneName("Ste Foy")).toBe("sainte foy");
    expect(normalizeCommuneName("L'Haÿ-les-Roses")).toBe("l hay les roses");
    expect(normalizeCommuneName("Saint-Étienne")).toBe("saint etienne");
  });

  it("does not rewrite st inside a word", () => {
    expect(normalizeCommuneName("Stains")).toBe("stains");
  });
});

describe("pickCommune", () => {
  const rennes = { nom: "Rennes", code: "35238" };
  const cesson = { nom: "Cesson-Sévigné", code: "35051" };

  it("returns not_found for no candidate", () => {
    expect(pickCommune([], "Rennes")).toEqual({ status: "not_found" });
    expect(pickCommune([])).toEqual({ status: "not_found" });
  });

  it("accepts the single candidate when no name is given", () => {
    expect(pickCommune([rennes])).toEqual({ status: "found", code: "35238", name: "Rennes" });
  });

  it("is ambiguous with several candidates and no name", () => {
    expect(pickCommune([rennes, cesson])).toEqual({ status: "ambiguous" });
  });

  it("picks the candidate whose normalized name matches, among several (shared postal code)", () => {
    expect(pickCommune([rennes, cesson], "cesson sevigne")).toEqual({
      status: "found",
      code: "35051",
      name: "Cesson-Sévigné",
    });
  });

  it("matches St/Saint spellings", () => {
    expect(pickCommune([{ nom: "Saint-Malo", code: "35288" }], "St Malo")).toMatchObject({ code: "35288" });
  });

  it("accepts a single candidate whose name contains the wanted one", () => {
    expect(pickCommune([{ nom: "Cesson-Sévigné", code: "35051" }], "Cesson")).toMatchObject({ code: "35051" });
  });

  it("refuses a single candidate that does not look like the wanted name (never guess an INSEE code)", () => {
    expect(pickCommune([rennes], "Nantes")).toEqual({ status: "not_found" });
  });

  it("stays ambiguous when several candidates share the wanted name", () => {
    const twin = [
      { nom: "Saint-Denis", code: "93066" },
      { nom: "Saint Denis", code: "97411" },
    ];
    expect(pickCommune(twin, "Saint-Denis")).toEqual({ status: "ambiguous" });
  });

  it("returns not_found when several candidates and none matches", () => {
    expect(pickCommune([rennes, cesson], "Vitré")).toEqual({ status: "not_found" });
  });
});
