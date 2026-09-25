import { describe, expect, it } from "vitest";
import { buildEventListScope } from "../../server/event/lib/list-visibility";

describe("buildEventListScope", () => {
  it("lists every club of the caller plus club-less events when no club is asked", () => {
    const scope = buildEventListScope({ isSuperAdmin: false, clubIds: ["A", "B", "A"] });
    expect(scope).toEqual({
      kind: "ok",
      unrestricted: false,
      organizationIds: ["A", "B"],
      includeClublessEvents: true,
    });
  });

  it("never widens access beyond the caller's own clubs", () => {
    const scope = buildEventListScope({ isSuperAdmin: false, clubIds: [] });
    expect(scope).toMatchObject({ kind: "ok", organizationIds: [], includeClublessEvents: true });
  });

  it("restricts to the requested club when the caller belongs to it", () => {
    const scope = buildEventListScope({
      isSuperAdmin: false,
      clubIds: ["A", "B"],
      requestedOrganizationId: "B",
    });
    expect(scope).toEqual({
      kind: "ok",
      unrestricted: false,
      organizationIds: ["B"],
      includeClublessEvents: false,
    });
  });

  it("refuses a club the caller is not a member of", () => {
    expect(
      buildEventListScope({ isSuperAdmin: false, clubIds: ["A"], requestedOrganizationId: "B" }),
    ).toEqual({ kind: "forbidden" });
  });

  it("lets a platform admin see everything, including clubs they are not in", () => {
    expect(
      buildEventListScope({ isSuperAdmin: true, clubIds: [], requestedOrganizationId: "B" }),
    ).toMatchObject({ kind: "ok", unrestricted: true });
  });
});
