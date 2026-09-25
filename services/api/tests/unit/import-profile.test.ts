import { describe, expect, it } from "vitest";
import { buildImportProfileValues } from "../../server/club-member/lib/import-profile";

describe("buildImportProfileValues", () => {
  it("only returns the columns the row provides", () => {
    expect(buildImportProfileValues({})).toEqual({});
    expect(buildImportProfileValues({ phone: "0601020304" })).toEqual({ phoneOverride: "0601020304" });
    expect(buildImportProfileValues({ licenseNumber: "1234567" })).toEqual({ licenseNumber: "1234567" });
  });

  it("never yields null, so an upsert cannot wipe an existing value", () => {
    const values = buildImportProfileValues({ licenseNumber: "1234567" });
    expect(Object.values(values)).not.toContain(null);
    expect("phoneOverride" in values).toBe(false);
    expect("licenseValidUntil" in values).toBe(false);
  });

  it("treats empty strings as not provided", () => {
    expect(buildImportProfileValues({ licenseNumber: "", phone: "", licenseValidUntil: "" })).toEqual({});
  });

  it("parses the license expiry into a Date", () => {
    const values = buildImportProfileValues({ licenseValidUntil: "2027-08-31" });
    expect(values.licenseValidUntil).toBeInstanceOf(Date);
    expect(values.licenseValidUntil?.toISOString().slice(0, 10)).toBe("2027-08-31");
  });

  it("returns all provided columns together", () => {
    expect(
      buildImportProfileValues({ licenseNumber: "9", phone: "06", licenseValidUntil: "2027-01-01" }),
    ).toEqual({ licenseNumber: "9", phoneOverride: "06", licenseValidUntil: new Date("2027-01-01") });
  });

  it("carries the new columns only when provided", () => {
    expect(buildImportProfileValues({ dateOfBirth: "2012-05-04" })).toEqual({ dateOfBirth: "2012-05-04" });
    expect(buildImportProfileValues({ medicalCertificateValidUntil: "2027-01-01" }).medicalCertificateValidUntil)
      .toBeInstanceOf(Date);
  });

  it("keeps licensedElsewhere=false as an answer, but omits it when undefined", () => {
    expect(buildImportProfileValues({ licensedElsewhere: false })).toEqual({ licensedElsewhere: false });
    expect("licensedElsewhere" in buildImportProfileValues({})).toBe(false);
  });

  it("writes the commune only as a resolved (code, name) pair", () => {
    expect(buildImportProfileValues({ communeInsee: "35238" })).toEqual({});
    expect(buildImportProfileValues({ communeInsee: "35238", communeName: "Rennes" })).toEqual({
      communeInsee: "35238",
      communeName: "Rennes",
    });
  });
});
