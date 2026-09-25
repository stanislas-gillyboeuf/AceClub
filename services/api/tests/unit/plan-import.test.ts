import { describe, expect, it } from "vitest";
import {
  normalizeText,
  planImport,
  type ExistingUserRef,
  type PlanRowInput,
  type PlanState,
  type PlannedRow,
} from "../../server/club-member/lib/plan-import";

function emptyState(overrides: Partial<PlanState> = {}): PlanState {
  return { usersByEmail: new Map(), clubMembers: [], households: [], tags: [], ...overrides };
}

function ref(overrides: Partial<ExistingUserRef> = {}): ExistingUserRef {
  return {
    userId: "u1",
    nameNorm: "jean martin",
    dateOfBirth: null,
    isClubMember: true,
    householdId: null,
    ...overrides,
  };
}

function imported(plan: ReturnType<typeof planImport>, index: number): PlannedRow {
  const row = plan.rows[index];
  if (row.kind !== "import") throw new Error(`row ${index} was skipped: ${row.reason}`);
  return row;
}

describe("normalizeText", () => {
  it("drops accents, case and punctuation", () => {
    expect(normalizeText("  Élodie-Anne  D'Hélène ")).toBe("elodie anne d helene");
  });
  it("expands ligatures", () => {
    expect(normalizeText("Cœur")).toBe("coeur");
  });
});

describe("planImport — identification", () => {
  it("rejects a row without name, or without email AND birth date", () => {
    const plan = planImport(
      [{ name: " ", email: "a@b.fr" }, { name: "Léa Durand" }],
      emptyState(),
    );
    expect(plan.rows[0]).toMatchObject({ kind: "skip", reason: "Nom manquant" });
    expect(plan.rows[1]).toMatchObject({ kind: "skip" });
  });

  it("refuses a technical address supplied by the client", () => {
    const plan = planImport(
      [{ name: "Léa Durand", email: "ghost+01abc@noreply.aceclub.app", dateOfBirth: "2012-05-01" }],
      emptyState(),
    );
    expect(plan.rows[0]).toMatchObject({ kind: "skip", reason: expect.stringContaining("technique") });
  });

  it("creates a new user with the real email", () => {
    const plan = planImport([{ name: "Claire Petit", email: "Claire@Mail.fr" }], emptyState());
    expect(imported(plan, 0)).toMatchObject({ existingUserId: null, emailKind: "real", email: "claire@mail.fr" });
  });

  it("gives a child without email a technical (ghost) identity", () => {
    const plan = planImport([{ name: "Lucas Petit", dateOfBirth: "2014-03-02" }], emptyState());
    expect(imported(plan, 0)).toMatchObject({ existingUserId: null, emailKind: "technical", email: null });
  });

  it("updates the existing user found by email (re-import)", () => {
    const state = emptyState({
      usersByEmail: new Map([["claire@mail.fr", ref({ userId: "u9", nameNorm: "claire petit" })]]),
    });
    const plan = planImport([{ name: "Claire Petit", email: "claire@mail.fr" }], state);
    expect(imported(plan, 0)).toMatchObject({ existingUserId: "u9", email: null });
  });

  it("matches a child without email to an existing CLUB member by name + birth date", () => {
    const state = emptyState({
      clubMembers: [ref({ userId: "kid", nameNorm: "lucas petit", dateOfBirth: "2014-03-02" })],
    });
    const plan = planImport([{ name: "LUCAS petit", dateOfBirth: "2014-03-02" }], state);
    expect(imported(plan, 0).existingUserId).toBe("kid");
  });

  it("never matches by name + birth date outside the club (isolation)", () => {
    // Same person exists in ANOTHER club: absent from clubMembers, so a new ghost is created.
    const plan = planImport([{ name: "Lucas Petit", dateOfBirth: "2014-03-02" }], emptyState());
    expect(imported(plan, 0).existingUserId).toBeNull();
  });

  it("flags a true duplicate (same name and birth date) in the file", () => {
    const plan = planImport(
      [
        { name: "Lucas Petit", dateOfBirth: "2014-03-02", email: "a@b.fr" },
        { name: "lucas PETIT", dateOfBirth: "2014-03-02", email: "c@d.fr" },
      ],
      emptyState(),
    );
    expect(plan.rows[0].kind).toBe("import");
    expect(plan.rows[1]).toMatchObject({ kind: "skip", reason: expect.stringContaining("Doublon") });
  });

  it("does not treat twins with different birth dates or names as duplicates", () => {
    const plan = planImport(
      [
        { name: "Léa Petit", dateOfBirth: "2014-03-02" },
        { name: "Lucas Petit", dateOfBirth: "2014-03-02" },
      ],
      emptyState(),
    );
    expect(plan.rows.map((r) => r.kind)).toEqual(["import", "import"]);
  });
});

describe("planImport — shared email = household", () => {
  const rows: PlanRowInput[] = [
    { name: "Sophie Martin", email: "sophie@mail.fr", dateOfBirth: "1980-01-01" },
    { name: "Hugo Martin", email: "sophie@mail.fr", dateOfBirth: "2012-06-06" },
    { name: "Emma Martin", email: "sophie@mail.fr", dateOfBirth: "2015-09-09" },
  ];

  it("first occurrence keeps the email, the others get a technical identity", () => {
    const plan = planImport(rows, emptyState());
    expect(imported(plan, 0)).toMatchObject({ emailKind: "real", email: "sophie@mail.fr" });
    expect(imported(plan, 1)).toMatchObject({ emailKind: "technical", email: null });
    expect(imported(plan, 2)).toMatchObject({ emailKind: "technical", email: null });
    expect(plan.warnings.map((w) => w.row)).toEqual([1, 2]);
  });

  it("forms ONE household, payer = the email owner, contact = the shared address", () => {
    const plan = planImport(rows, emptyState());
    expect(plan.households).toHaveLength(1);
    expect(plan.households[0]).toMatchObject({
      groupKey: "sophie@mail.fr",
      contactEmail: "sophie@mail.fr",
      name: "Famille Martin",
      payerRowIndex: 0,
      memberRowIndexes: [0, 1, 2],
    });
  });

  it("rejects a shared-email row without birth date (it could not be recognised on re-import)", () => {
    const plan = planImport(
      [
        { name: "Sophie Martin", email: "sophie@mail.fr", dateOfBirth: "1980-01-01" },
        { name: "Hugo Martin", email: "sophie@mail.fr" },
      ],
      emptyState(),
    );
    expect(plan.rows[1]).toMatchObject({ kind: "skip", reason: expect.stringContaining("date de naissance") });
    expect(plan.households).toHaveLength(0);
  });

  it("re-import: a child using the parent's existing address stays a separate person", () => {
    const state = emptyState({
      usersByEmail: new Map([["sophie@mail.fr", ref({ userId: "parent", nameNorm: "sophie martin", dateOfBirth: "1980-01-01" })]]),
    });
    const plan = planImport(
      [{ name: "Hugo Martin", email: "sophie@mail.fr", dateOfBirth: "2012-06-06" }],
      state,
    );
    expect(imported(plan, 0)).toMatchObject({ existingUserId: null, emailKind: "technical" });
  });

  it("re-import: the same person with a different name spelling and no birth date is the same person", () => {
    const state = emptyState({
      usersByEmail: new Map([["sophie@mail.fr", ref({ userId: "parent", nameNorm: "sophie martin" })]]),
    });
    const plan = planImport([{ name: "Sophie Martin-Durand", email: "sophie@mail.fr" }], state);
    expect(imported(plan, 0).existingUserId).toBe("parent");
  });
});

describe("planImport — explicit household key", () => {
  it("groups rows sharing the responsible's email and links the parent row as payer", () => {
    const plan = planImport(
      [
        { name: "Paul Roux", email: "paul@mail.fr", dateOfBirth: "1978-02-02" },
        { name: "Zoé Roux", dateOfBirth: "2013-04-04", householdKey: "paul@mail.fr" },
        { name: "Tom Roux", dateOfBirth: "2016-08-08", householdKey: "paul@mail.fr" },
      ],
      emptyState(),
    );
    expect(plan.households).toHaveLength(1);
    expect(plan.households[0]).toMatchObject({
      contactEmail: "paul@mail.fr",
      payerRowIndex: 0,
      memberRowIndexes: [0, 1, 2],
    });
    expect(imported(plan, 1)).toMatchObject({ emailKind: "technical", householdGroup: "paul@mail.fr" });
  });

  it("keeps a responsible email that is not in the file as contact, without payer row", () => {
    const plan = planImport(
      [
        { name: "Zoé Roux", dateOfBirth: "2013-04-04", householdKey: "papa@mail.fr" },
        { name: "Tom Roux", dateOfBirth: "2016-08-08", householdKey: "papa@mail.fr" },
      ],
      emptyState(),
    );
    expect(plan.households[0]).toMatchObject({ contactEmail: "papa@mail.fr", payerRowIndex: null });
  });

  it("uses a non-email household value as a plain group (no contact email)", () => {
    const plan = planImport(
      [
        { name: "Ana Diaz", dateOfBirth: "2010-01-01", householdKey: "famille diaz" },
        { name: "Leo Diaz", dateOfBirth: "2012-01-01", householdKey: "famille diaz" },
      ],
      emptyState(),
    );
    expect(plan.households[0]).toMatchObject({ contactEmail: null, payerRowIndex: null, name: "Famille Diaz" });
  });

  it("reuses an existing household with the same contact email", () => {
    const plan = planImport(
      [{ name: "Zoé Roux", dateOfBirth: "2013-04-04", householdKey: "papa@mail.fr" }],
      emptyState({ households: [{ id: "h1", name: "Famille Roux", contactEmail: "papa@mail.fr" }] }),
    );
    expect(plan.households[0].existingHouseholdId).toBe("h1");
  });

  it("does not move a member who already belongs to another household", () => {
    const state = emptyState({
      clubMembers: [ref({ userId: "z", nameNorm: "zoe roux", dateOfBirth: "2013-04-04", householdId: "other" })],
      households: [{ id: "h1", name: "Famille Roux", contactEmail: "papa@mail.fr" }],
    });
    const plan = planImport([{ name: "Zoé Roux", dateOfBirth: "2013-04-04", householdKey: "papa@mail.fr" }], state);
    expect(imported(plan, 0).assignHousehold).toBe(false);
    expect(plan.warnings[0].message).toContain("autre foyer");
  });
});

describe("planImport — statuses (tags)", () => {
  it("resolves names ignoring case and accents, and lists only missing ones to create", () => {
    const plan = planImport(
      [
        { name: "A B", email: "a@b.fr", tags: ["étudiant", "Bureau"] },
        { name: "C D", email: "c@d.fr", tags: ["ETUDIANT", "bénévole"] },
      ],
      emptyState({ tags: [{ id: "t1", name: "Étudiant" }] }),
    );
    const byKey = Object.fromEntries(plan.tags.map((t) => [t.key, t]));
    expect(byKey["etudiant"].existingId).toBe("t1");
    expect(byKey["bureau"].existingId).toBeNull();
    expect(byKey["benevole"]).toMatchObject({ existingId: null, name: "bénévole" });
    expect(plan.tags).toHaveLength(3);
    expect(imported(plan, 1).tagKeys.sort()).toEqual(["benevole", "etudiant"]);
  });

  it("does not list a club tag nobody uses in this import", () => {
    const plan = planImport(
      [{ name: "A B", email: "a@b.fr" }],
      emptyState({ tags: [{ id: "t1", name: "Étudiant" }] }),
    );
    expect(plan.tags).toEqual([]);
  });

  it("ignores empty tag values and duplicates within a row", () => {
    const plan = planImport([{ name: "A B", email: "a@b.fr", tags: ["Bureau", " bureau ", ""] }], emptyState());
    expect(imported(plan, 0).tagKeys).toEqual(["bureau"]);
  });
});

describe("planImport — reference scenario (families of the 30-line example file)", () => {
  // Same shapes as apps/web/public/modeles/exemple-import-30-membres.csv, described by hand.
  const rows: PlanRowInput[] = [
    { name: "Élodie Lefèvre", email: "elodie.lefevre@mail.fr", dateOfBirth: "1984-03-12", tags: ["Bureau"] },
    { name: "Gaëtan Lefèvre", dateOfBirth: "2011-11-03", householdKey: "elodie.lefevre@mail.fr" },
    { name: "Noël Lefèvre", dateOfBirth: "2014-12-24", householdKey: "elodie.lefevre@mail.fr" },
    { name: "Hélène Girard", email: "helene.girard@mail.fr", dateOfBirth: "1979-07-30" },
    { name: "François Girard", email: "helene.girard@mail.fr", dateOfBirth: "1977-01-15" },
    { name: "Inès Girard", email: "helene.girard@mail.fr", dateOfBirth: "2010-05-05", tags: ["Étudiant"] },
    { name: "Marc Solo", email: "marc.solo@mail.fr" },
    { name: "Marc Solo", email: "marc.solo@mail.fr" },
    { name: "Sans Rien" },
  ];

  it("plans families, ghosts, duplicates and rejects as expected", () => {
    const plan = planImport(rows, emptyState());
    expect(plan.rows.map((r) => r.kind)).toEqual([
      "import", "import", "import", "import", "import", "import", "import", "skip", "skip",
    ]);
    expect(plan.households.map((h) => h.name).sort()).toEqual(["Famille Girard", "Famille Lefèvre"]);
    const lefevre = plan.households.find((h) => h.groupKey === "elodie.lefevre@mail.fr")!;
    expect(lefevre.memberRowIndexes).toEqual([0, 1, 2]);
    expect(lefevre.payerRowIndex).toBe(0);
    expect(imported(plan, 1).emailKind).toBe("technical");
    expect(imported(plan, 3).emailKind).toBe("real");
    expect(imported(plan, 4).emailKind).toBe("technical");
    expect(plan.tags.map((t) => t.key).sort()).toEqual(["bureau", "etudiant"]);
  });
});
