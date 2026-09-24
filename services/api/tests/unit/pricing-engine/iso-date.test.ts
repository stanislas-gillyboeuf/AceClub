import { describe, it, expect } from "vitest";
import { isValidIsoDate } from "../../../server/pricing/lib/engine";

describe("isValidIsoDate", () => {
  it.each(["2010-12-31", "2000-02-29", "1999-01-01"])("accepte la date réelle %s", (value) => {
    expect(isValidIsoDate(value)).toBe(true);
  });

  it.each([
    ["2010-02-30", "jour inexistant"],
    ["2001-02-29", "29 février d'une année non bissextile"],
    ["2010-13-01", "mois inexistant"],
    ["2010-00-10", "mois zéro"],
    ["31/12/2010", "format français"],
    ["2010-1-5", "sans zéros de remplissage"],
    ["", "chaîne vide"],
    ["2010-12-31T00:00:00Z", "datetime complet"],
  ])("refuse %j (%s)", (value) => {
    expect(isValidIsoDate(value)).toBe(false);
  });
});
