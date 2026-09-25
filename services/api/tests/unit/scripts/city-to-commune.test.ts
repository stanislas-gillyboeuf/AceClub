import { describe, it, expect } from "vitest";
import { cityKey, decideCityMigration, groupRowsByCity } from "../../../scripts/lib/city-to-commune";

describe("cityKey", () => {
  it("ignore la casse, les accents, les tirets et St/Ste", () => {
    expect(cityKey("St-Malo")).toBe(cityKey("saint malo"));
    expect(cityKey("Ste Foy")).toBe(cityKey("Sainte-Foy"));
    expect(cityKey("Rennes ")).toBe(cityKey("RENNES"));
    expect(cityKey("Cesson-Sévigné")).toBe(cityKey("cesson sevigne"));
  });
});

describe("decideCityMigration", () => {
  it("écrit quand un seul candidat a le même nom normalisé", () => {
    const decision = decideCityMigration("rennes", [
      { nom: "Rennes", code: "35238" },
      { nom: "Rennes-le-Château", code: "11322" },
    ]);
    expect(decision).toEqual({ status: "write", code: "35238", name: "Rennes" });
  });

  it("écrit malgré St/Saint et les tirets", () => {
    const decision = decideCityMigration("St Malo", [{ nom: "Saint-Malo", code: "35288" }]);
    expect(decision).toEqual({ status: "write", code: "35288", name: "Saint-Malo" });
  });

  it("ne fait qu'une suggestion quand le nom est seulement proche", () => {
    const decision = decideCityMigration("Rennes 35", [{ nom: "Rennes", code: "35238" }]);
    expect(decision.status).toBe("review");
  });

  it("refuse l'ambigu et l'introuvable", () => {
    expect(
      decideCityMigration("Saint-Denis", [
        { nom: "Saint-Denis", code: "93066" },
        { nom: "Saint Denis", code: "97411" },
      ]),
    ).toEqual({ status: "ambiguous" });
    expect(decideCityMigration("Zzzz", [])).toEqual({ status: "not_found" });
    expect(decideCityMigration("Lyon", [{ nom: "Paris", code: "75056" }])).toEqual({ status: "not_found" });
  });
});

describe("groupRowsByCity", () => {
  it("regroupe les profils par ville normalisée et ignore les vides", () => {
    const groups = groupRowsByCity([
      { id: "1", city: "Rennes" },
      { id: "2", city: " rennes " },
      { id: "3", city: "St-Malo" },
      { id: "4", city: "  " },
      { id: "5", city: null },
    ]);
    expect(groups.size).toBe(2);
    expect(groups.get(cityKey("Rennes"))?.ids).toEqual(["1", "2"]);
    expect(groups.get(cityKey("saint malo"))?.ids).toEqual(["3"]);
  });
});
