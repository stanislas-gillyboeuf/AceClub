import { describe, it, expect } from "vitest";
import { computeCotisation } from "../../../server/pricing/lib/engine";
import type {
  AdditionalLineSnapshot,
  MemberPricingProfile,
  RuleSnapshot,
  TarifAgeReferenceMode,
  TarifGridSnapshot,
} from "../../../server/pricing/lib/engine";

// --- Shared fixture: two age categories with base tariffs, no rules/additional lines by default.
// Each scenario spreads this and adds exactly the rules it needs, to keep scenarios isolated from
// each other (no accidental cross-rule interaction).

const CAT_ADULT = "cat-adult";
const CAT_YOUNG = "cat-young";

function baseGrid(overrides: Partial<TarifGridSnapshot> = {}): TarifGridSnapshot {
  return {
    ageReferenceMode: "season_start",
    cumulMode: "cumulative",
    reductionCapPercent: null,
    roundingIncrement: "none",
    seasonStartDate: "2026-09-01",
    seasonEndDate: "2027-08-31",
    ageCategories: [
      { id: CAT_ADULT, name: "Adulte", minAge: 26, maxAge: 64, sortOrder: 0 },
      { id: CAT_YOUNG, name: "Jeune", minAge: 8, maxAge: 17, sortOrder: 1 },
    ],
    baseRates: [
      { categoryId: CAT_ADULT, membershipFeeCents: 15000, licenseFeeCents: 3500 },
      { categoryId: CAT_YOUNG, membershipFeeCents: 9000, licenseFeeCents: 2200 },
    ],
    lessonRates: [
      { categoryId: CAT_ADULT, lessonsPerWeek: 0, priceCents: 0 },
      { categoryId: CAT_ADULT, lessonsPerWeek: 1, priceCents: 15000 },
      { categoryId: CAT_ADULT, lessonsPerWeek: 2, priceCents: 28000 },
      { categoryId: CAT_ADULT, lessonsPerWeek: 3, priceCents: 38000 },
      { categoryId: CAT_ADULT, lessonsPerWeek: 4, priceCents: 46000 },
      { categoryId: CAT_YOUNG, lessonsPerWeek: 0, priceCents: 0 },
      { categoryId: CAT_YOUNG, lessonsPerWeek: 1, priceCents: 16000 },
      { categoryId: CAT_YOUNG, lessonsPerWeek: 2, priceCents: 26000 },
      { categoryId: CAT_YOUNG, lessonsPerWeek: 3, priceCents: 34000 },
      { categoryId: CAT_YOUNG, lessonsPerWeek: 4, priceCents: 40000 },
    ],
    additionalLines: [],
    rules: [],
    ...overrides,
  };
}

const ADULT_BIRTH_DATE = "1980-06-15"; // 46 at season start 2026-09-01
const YOUNG_BIRTH_DATE = "2014-03-10"; // 12 at season start 2026-09-01

function rule(
  partial: Pick<RuleSnapshot, "id" | "name" | "conditions" | "effectType" | "effectValue" | "targetType"> &
    Partial<RuleSnapshot>,
): RuleSnapshot {
  return {
    targetAdditionalLineId: null,
    exclusivityGroup: null,
    isActive: true,
    sortOrder: 0,
    ...partial,
  };
}

function additionalLine(
  partial: Pick<AdditionalLineSnapshot, "id" | "name" | "amountCents"> & Partial<AdditionalLineSnapshot>,
): AdditionalLineSnapshot {
  return { conditions: [], isActive: true, sortOrder: 0, ...partial };
}

function expectComplete(grid: TarifGridSnapshot, profile: MemberPricingProfile) {
  const result = computeCotisation(grid, profile);
  if (result.status !== "complete") {
    throw new Error(`Expected status "complete", got "incomplete" with missingFields: ${JSON.stringify(result.missingFields)}`);
  }
  return result;
}

describe("computeCotisation — 10 scenarios obligatoires (grille de test du client)", () => {
  it("1. Adulte, résident Rennes, 2 cours, licencié ailleurs, 2e du foyer, mode cumulatif → 372,00€", () => {
    const grid = baseGrid({
      cumulMode: "cumulative",
      rules: [
        rule({
          id: "resident",
          name: "Résident Rennes",
          conditions: [{ type: "commune", mode: "in", communeInseeCodes: ["35238"] }],
          effectType: "percent_discount",
          effectValue: 1000, // 10.00%
          targetType: "membership",
        }),
        rule({
          id: "famille2",
          name: "Famille 2e",
          conditions: [{ type: "household_rank", minRank: 2, maxRank: 2 }],
          effectType: "percent_discount",
          effectValue: 1000, // 10.00%
          targetType: "total_excluding_license",
        }),
      ],
    });
    const profile: MemberPricingProfile = {
      birthDate: ADULT_BIRTH_DATE,
      communeInsee: "35238",
      householdRank: 2,
      lessonsPerWeek: 2,
      licensedElsewhere: true,
    };

    const result = expectComplete(grid, profile);

    expect(result.lines.find((l) => l.key === "membership")?.finalAmountCents).toBe(12000);
    expect(result.lines.find((l) => l.key === "license")?.finalAmountCents).toBe(0);
    expect(result.lines.find((l) => l.key === "lessons")?.finalAmountCents).toBe(25200);
    expect(result.appliedRules).toHaveLength(2);
    expect(result.skippedRules).toHaveLength(0);
    expect(result.totalCents).toBe(37200); // 372,00€
  });

  it("2. Même profil, mode « plus avantageuse seule » → seule la règle famille (-43€) s'applique → 387,00€", () => {
    const grid = baseGrid({
      cumulMode: "best_only",
      rules: [
        rule({
          id: "resident",
          name: "Résident Rennes",
          conditions: [{ type: "commune", mode: "in", communeInseeCodes: ["35238"] }],
          effectType: "percent_discount",
          effectValue: 1000,
          targetType: "membership",
        }),
        rule({
          id: "famille2",
          name: "Famille 2e",
          conditions: [{ type: "household_rank", minRank: 2, maxRank: 2 }],
          effectType: "percent_discount",
          effectValue: 1000,
          targetType: "total_excluding_license",
        }),
      ],
    });
    const profile: MemberPricingProfile = {
      birthDate: ADULT_BIRTH_DATE,
      communeInsee: "35238",
      householdRank: 2,
      lessonsPerWeek: 2,
      licensedElsewhere: true,
    };

    const result = expectComplete(grid, profile);

    expect(result.appliedRules).toHaveLength(1);
    expect(result.appliedRules[0].ruleId).toBe("famille2");
    expect(result.skippedRules).toHaveLength(1);
    expect(result.skippedRules[0].ruleId).toBe("resident");
    expect(result.skippedRules[0].reason).toMatch(/plus avantageuse/i);
    expect(result.totalCents).toBe(38700); // 387,00€
  });

  it("3. Jeune 12 ans, hors commune, 1 cours, non licencié ailleurs, 3e du foyer → 237,00€", () => {
    const grid = baseGrid({
      cumulMode: "cumulative",
      rules: [
        rule({
          id: "hors_commune",
          name: "Hors commune",
          conditions: [{ type: "commune", mode: "not_in", communeInseeCodes: ["35238"] }],
          effectType: "surcharge_amount",
          effectValue: 1500, // +15,00€
          targetType: "membership",
        }),
        rule({
          id: "famille3",
          name: "Famille 3e et plus",
          conditions: [{ type: "household_rank", minRank: 3 }],
          effectType: "percent_discount",
          effectValue: 2000, // 20.00%
          targetType: "total_excluding_license",
        }),
      ],
    });
    const profile: MemberPricingProfile = {
      birthDate: YOUNG_BIRTH_DATE,
      communeInsee: "44109",
      householdRank: 3,
      lessonsPerWeek: 1,
      licensedElsewhere: false,
    };

    const result = expectComplete(grid, profile);

    expect(result.lines.find((l) => l.key === "membership")?.finalAmountCents).toBe(8700); // 90 +15 -18
    expect(result.lines.find((l) => l.key === "license")?.finalAmountCents).toBe(2200); // licence pleine
    expect(result.lines.find((l) => l.key === "lessons")?.finalAmountCents).toBe(12800); // 160 -32
    expect(result.totalCents).toBe(23700); // 237,00€
  });

  it("4. Adulte étudiant ET demandeur d'emploi (même groupe d'exclusivité) → seule -30% appliquée", () => {
    const grid = baseGrid({
      cumulMode: "cumulative",
      baseRates: [{ categoryId: CAT_ADULT, membershipFeeCents: 15000, licenseFeeCents: 0 }],
      lessonRates: [],
      rules: [
        rule({
          id: "etudiant",
          name: "Étudiant",
          conditions: [{ type: "tag", tagIds: ["etudiant"] }],
          effectType: "percent_discount",
          effectValue: 2000, // 20%
          targetType: "membership",
          exclusivityGroup: "statut_social",
        }),
        rule({
          id: "chomeur",
          name: "Demandeur d'emploi",
          conditions: [{ type: "tag", tagIds: ["demandeur_emploi"] }],
          effectType: "percent_discount",
          effectValue: 3000, // 30%
          targetType: "membership",
          exclusivityGroup: "statut_social",
        }),
      ],
    });
    const profile: MemberPricingProfile = { birthDate: ADULT_BIRTH_DATE, tags: ["etudiant", "demandeur_emploi"] };

    const result = expectComplete(grid, profile);

    expect(result.appliedRules).toHaveLength(1);
    expect(result.appliedRules[0].ruleId).toBe("chomeur");
    expect(result.lines.find((l) => l.key === "membership")?.finalAmountCents).toBe(10500); // 150 - 45
    expect(result.skippedRules).toHaveLength(1);
    expect(result.skippedRules[0].ruleId).toBe("etudiant");
    expect(result.skippedRules[0].reason).toMatch(/exclusivité|cumulable/i);
  });

  it("5. Membre du bureau → adhésion à 0€, aucune autre réduction sur adhésion, cours/licence normaux", () => {
    const grid = baseGrid({
      cumulMode: "cumulative",
      rules: [
        rule({
          id: "bureau",
          name: "Membre du bureau",
          conditions: [{ type: "tag", tagIds: ["membre_bureau"] }],
          effectType: "fixed_price",
          effectValue: 0,
          targetType: "membership",
        }),
        rule({
          id: "etudiant",
          name: "Étudiant",
          conditions: [{ type: "tag", tagIds: ["etudiant"] }],
          effectType: "percent_discount",
          effectValue: 2000,
          targetType: "membership",
        }),
      ],
    });
    const profile: MemberPricingProfile = {
      birthDate: ADULT_BIRTH_DATE,
      tags: ["membre_bureau", "etudiant"],
      lessonsPerWeek: 2,
      licensedElsewhere: false,
    };

    const result = expectComplete(grid, profile);

    expect(result.lines.find((l) => l.key === "membership")?.finalAmountCents).toBe(0);
    expect(result.lines.find((l) => l.key === "license")?.finalAmountCents).toBe(3500); // normal
    expect(result.lines.find((l) => l.key === "lessons")?.finalAmountCents).toBe(28000); // normal
    expect(result.appliedRules).toHaveLength(1);
    expect(result.appliedRules[0].ruleId).toBe("bureau");
    expect(result.skippedRules).toHaveLength(1);
    expect(result.skippedRules[0].ruleId).toBe("etudiant");
    expect(result.skippedRules[0].reason).toMatch(/prix fixe/i);
  });

  it("6. Plafond -20% du total hors licence avec des règles cumulant -30% → plafonné exactement à -20%", () => {
    const grid = baseGrid({
      cumulMode: "cumulative",
      reductionCapPercent: 20,
      baseRates: [{ categoryId: CAT_ADULT, membershipFeeCents: 15000, licenseFeeCents: 0 }],
      lessonRates: [],
      rules: [
        rule({
          id: "reduc_a",
          name: "Réduction A",
          conditions: [{ type: "tag", tagIds: ["a"] }],
          effectType: "percent_discount",
          effectValue: 2000, // 20%
          targetType: "membership",
        }),
        rule({
          id: "reduc_b",
          name: "Réduction B",
          conditions: [{ type: "tag", tagIds: ["b"] }],
          effectType: "percent_discount",
          effectValue: 1000, // 10% -> 30% cumulé avant plafond
          targetType: "membership",
        }),
      ],
    });
    const profile: MemberPricingProfile = { birthDate: ADULT_BIRTH_DATE, tags: ["a", "b"] };

    const result = expectComplete(grid, profile);

    expect(result.capApplied).toBe(true);
    expect(result.lines.find((l) => l.key === "membership")?.finalAmountCents).toBe(12000); // 150 - 20% = 120
    expect(result.totalCents).toBe(12000);
  });

  it("7. Date de naissance manquante → status incomplete, missingFields: [\"birthDate\"], pas de total", () => {
    const grid = baseGrid();
    const profile: MemberPricingProfile = {};

    const result = computeCotisation(grid, profile);

    expect(result.status).toBe("incomplete");
    if (result.status === "incomplete") {
      expect(result.missingFields).toEqual(["birthDate"]);
    }
    expect("totalCents" in result).toBe(false);
  });

  describe("8. Âge frontière — né le 1er janvier ou le 31 décembre, testé avec chaque mode de référence", () => {
    function boundaryGrid(mode: TarifAgeReferenceMode): TarifGridSnapshot {
      return {
        ageReferenceMode: mode,
        cumulMode: "cumulative",
        reductionCapPercent: null,
        roundingIncrement: "none",
        seasonStartDate: "2026-09-01",
        seasonEndDate: "2027-08-31",
        ageCategories: [
          { id: "minor", name: "Mineur", minAge: 0, maxAge: 17, sortOrder: 0 },
          { id: "major", name: "Majeur", minAge: 18, maxAge: null, sortOrder: 1 },
        ],
        baseRates: [
          { categoryId: "minor", membershipFeeCents: 5000, licenseFeeCents: 0 },
          { categoryId: "major", membershipFeeCents: 20000, licenseFeeCents: 0 },
        ],
        lessonRates: [],
        additionalLines: [],
        rules: [],
      };
    }

    it("season_start: né le 2008-09-01, saison démarrant le 2026-09-01 → 18 ans pile → Majeur", () => {
      const result = expectComplete(boundaryGrid("season_start"), { birthDate: "2008-09-01" });
      expect(result.totalCents).toBe(20000);
    });

    it("season_start: né le 2009-01-01 → 17 ans à la rentrée → Mineur", () => {
      const result = expectComplete(boundaryGrid("season_start"), { birthDate: "2009-01-01" });
      expect(result.totalCents).toBe(5000);
    });

    it("dec_31_start_year: né le 2008-12-31, année de début 2026 → 18 ans pile au 31/12/2026 → Majeur", () => {
      const result = expectComplete(boundaryGrid("dec_31_start_year"), { birthDate: "2008-12-31" });
      expect(result.totalCents).toBe(20000);
    });

    it("season_end_year: né le 2009-12-31, année de fin 2027 → 18 ans pile au 31/12/2027 → Majeur", () => {
      const result = expectComplete(boundaryGrid("season_end_year"), { birthDate: "2009-12-31" });
      expect(result.totalCents).toBe(20000);
    });
  });

  it("9. Réduction fixe supérieure au montant de la ligne (-50€ sur une ligne additionnelle à 30€) → ligne à 0€", () => {
    const grid = baseGrid({
      cumulMode: "cumulative",
      baseRates: [{ categoryId: CAT_ADULT, membershipFeeCents: 15000, licenseFeeCents: 0 }],
      lessonRates: [],
      additionalLines: [additionalLine({ id: "droit_entree", name: "Droit d'entrée", amountCents: 3000 })],
      rules: [
        rule({
          id: "gros_geste",
          name: "Geste commercial",
          conditions: [],
          effectType: "fixed_discount",
          effectValue: 5000, // -50€, supérieur aux 30€ de la ligne ciblée
          targetType: "additional_line",
          targetAdditionalLineId: "droit_entree",
        }),
      ],
    });
    const profile: MemberPricingProfile = { birthDate: ADULT_BIRTH_DATE };

    const result = expectComplete(grid, profile);

    expect(result.lines.find((l) => l.key === "additional:droit_entree")?.finalAmountCents).toBe(0);
  });

  it("compléments — un trou de configuration dans les catégories d'âge rend le calcul incomplete (pas une erreur)", () => {
    const gapGrid = baseGrid({
      ageCategories: [
        { id: "young-only", name: "Jeune", minAge: 8, maxAge: 17, sortOrder: 0 },
        // deliberate gap: nothing covers ages 18-25
        { id: "adult-only", name: "Adulte", minAge: 26, maxAge: 64, sortOrder: 1 },
      ],
    });
    const result = computeCotisation(gapGrid, { birthDate: "2006-09-01" }); // age 20 at season start, in the gap
    expect(result.status).toBe("incomplete");
    if (result.status === "incomplete") {
      expect(result.missingFields[0]).toMatch(/no_matching_category/);
    }
  });

  it("compléments — une ligne de base nécessitant une donnée absente (licensedElsewhere) rend le calcul incomplete", () => {
    const grid = baseGrid();
    const result = computeCotisation(grid, { birthDate: ADULT_BIRTH_DATE, lessonsPerWeek: 2 }); // licensedElsewhere absent
    expect(result.status).toBe("incomplete");
    if (result.status === "incomplete") {
      expect(result.missingFields).toEqual(["licensedElsewhere"]);
    }
  });

  it("10. Arrondi 1€ inférieur sur un total en centimes non ronds", () => {
    const grid = baseGrid({
      roundingIncrement: "one_euro",
      baseRates: [{ categoryId: CAT_ADULT, membershipFeeCents: 12345, licenseFeeCents: 0 }],
      lessonRates: [],
      rules: [],
    });
    const profile: MemberPricingProfile = { birthDate: ADULT_BIRTH_DATE };

    const result = expectComplete(grid, profile);

    expect(result.totalCents).toBe(12300); // 123,45€ -> 123,00€ (floor, jamais arrondi au plus proche)
  });
});
