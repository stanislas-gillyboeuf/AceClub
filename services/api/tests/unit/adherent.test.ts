import { describe, expect, it } from "vitest";
import { isEffectiveAdherent } from "../../server/club-member/lib/adherent";

describe("isEffectiveAdherent", () => {
  it("follows the role when the flag is not set", () => {
    expect(isEffectiveAdherent(null, "member")).toBe(true);
    expect(isEffectiveAdherent(undefined, "member")).toBe(true);
    for (const role of ["owner", "admin", "coach"]) {
      expect(isEffectiveAdherent(null, role)).toBe(false);
    }
  });

  it("lets an explicit flag override the role in both directions", () => {
    expect(isEffectiveAdherent(true, "coach")).toBe(true);
    expect(isEffectiveAdherent(true, "owner")).toBe(true);
    expect(isEffectiveAdherent(false, "member")).toBe(false);
  });
});
