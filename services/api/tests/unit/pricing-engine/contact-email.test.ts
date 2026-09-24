import { describe, expect, it } from "vitest";
import { pickContactEmail } from "../../../server/pricing/lib/contact-email";
import { makeGhostEmail } from "../../../lib/technical-email";
import { dedupeRecipientEmails, type SegmentMember } from "../../../server/messaging/lib/segments";

describe("pickContactEmail", () => {
  it("prefers the member's own real email", () => {
    expect(
      pickContactEmail({ ownEmail: "kid@mail.fr", householdContactEmail: "parent@mail.fr", payerEmail: "p@mail.fr" }),
    ).toBe("kid@mail.fr");
  });

  it("falls back to the household contact when the member's email is technical or missing", () => {
    expect(
      pickContactEmail({ ownEmail: makeGhostEmail(), householdContactEmail: "parent@mail.fr", payerEmail: "p@mail.fr" }),
    ).toBe("parent@mail.fr");
    expect(pickContactEmail({ ownEmail: null, householdContactEmail: "parent@mail.fr", payerEmail: null })).toBe(
      "parent@mail.fr",
    );
  });

  it("then falls back to the payer's real email", () => {
    expect(pickContactEmail({ ownEmail: makeGhostEmail(), householdContactEmail: null, payerEmail: "p@mail.fr" })).toBe(
      "p@mail.fr",
    );
  });

  it("never returns a technical address, even from the household or the payer", () => {
    expect(
      pickContactEmail({
        ownEmail: makeGhostEmail(),
        householdContactEmail: makeGhostEmail(),
        payerEmail: makeGhostEmail(),
      }),
    ).toBeNull();
    expect(pickContactEmail({ ownEmail: "", householdContactEmail: "  ", payerEmail: undefined })).toBeNull();
  });

  it("trims the chosen address", () => {
    expect(pickContactEmail({ ownEmail: "  a@b.fr ", householdContactEmail: null, payerEmail: null })).toBe("a@b.fr");
  });
});

function segmentMember(userId: string, contactEmail: string | null): SegmentMember {
  return { userId, name: userId, email: null, contactEmail, image: null };
}

describe("dedupeRecipientEmails", () => {
  it("sends one email per address (a parent with three children gets it once)", () => {
    const { emails, noContact } = dedupeRecipientEmails([
      segmentMember("a", "Parent@Mail.fr"),
      segmentMember("b", "parent@mail.fr"),
      segmentMember("c", "parent@mail.fr "),
      segmentMember("d", "other@mail.fr"),
    ]);
    expect(emails).toEqual(["Parent@Mail.fr", "other@mail.fr"]);
    expect(noContact).toEqual([]);
  });

  it("reports members nobody can be written to instead of dropping them silently", () => {
    const { emails, noContact } = dedupeRecipientEmails([segmentMember("a", null), segmentMember("b", "x@y.fr")]);
    expect(emails).toEqual(["x@y.fr"]);
    expect(noContact.map((m) => m.userId)).toEqual(["a"]);
  });
});
