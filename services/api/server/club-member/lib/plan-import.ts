import { isTechnicalEmail } from "../../../lib/technical-email";

/**
 * Pure planner for the bulk member import: no I/O, so every rule below is unit-tested.
 *
 * Given the rows of one batch and what the club already holds, it decides per row whether to
 * create a person, update an existing one, or skip it; how to identify people who share an email
 * (a family); which households to create; and which statuses (tags) are missing. The mutation
 * (`mutations/bulk-import.ts`) only executes the plan.
 */

/** Lowercase, accent-free, punctuation-free: the comparison form for names and tags. */
export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export interface PlanRowInput {
  name: string;
  email?: string;
  dateOfBirth?: string;
  householdKey?: string;
  tags?: string[];
}

export interface ExistingUserRef {
  userId: string;
  nameNorm: string;
  dateOfBirth: string | null;
  isClubMember: boolean;
  householdId: string | null;
}

export interface ExistingHousehold {
  id: string;
  name: string;
  contactEmail: string | null;
}

export interface PlanState {
  /** Real emails only, lowercased; global (an email is unique across clubs). */
  usersByEmail: Map<string, ExistingUserRef>;
  /** Members of THIS club — the only place a (name, birth date) match is allowed. */
  clubMembers: ExistingUserRef[];
  households: ExistingHousehold[];
  tags: { id: string; name: string }[];
}

export interface PlannedRow {
  kind: "import";
  index: number;
  /** null → a new ghost user is created. */
  existingUserId: string | null;
  /** For a NEW user: keep the row's real email, or get a fabricated technical one. */
  emailKind: "real" | "technical";
  email: string | null;
  householdGroup: string | null;
  /** False when the person already belongs to a different household (kept as is). */
  assignHousehold: boolean;
  tagKeys: string[];
}

export interface SkippedRow {
  kind: "skip";
  index: number;
  reason: string;
}

export interface PlannedHousehold {
  groupKey: string;
  existingHouseholdId: string | null;
  name: string;
  contactEmail: string | null;
  payerRowIndex: number | null;
  payerExistingUserId: string | null;
  memberRowIndexes: number[];
}

export interface PlannedTag {
  key: string;
  name: string;
  existingId: string | null;
}

export interface ImportPlan {
  rows: (PlannedRow | SkippedRow)[];
  households: PlannedHousehold[];
  tags: PlannedTag[];
  warnings: { row: number; message: string }[];
}

export function tagKey(name: string): string {
  return normalizeText(name);
}

function lastToken(name: string): string {
  const tokens = name.trim().split(/\s+/);
  return tokens[tokens.length - 1] ?? name;
}

function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function planImport(rows: PlanRowInput[], state: PlanState): ImportPlan {
  const warnings: { row: number; message: string }[] = [];
  const planned: (PlannedRow | SkippedRow)[] = new Array(rows.length);
  const refById = new Map<string, ExistingUserRef>();
  for (const ref of state.clubMembers) refById.set(ref.userId, ref);
  for (const ref of state.usersByEmail.values()) if (!refById.has(ref.userId)) refById.set(ref.userId, ref);

  const seenDup = new Set<string>();
  // email → index of the row that owns it (first non-demoted occurrence)
  const emailOwners = new Map<string, number>();
  const rowEmail: (string | null)[] = new Array(rows.length).fill(null);
  const demoted = new Array<boolean>(rows.length).fill(false);
  const sharedOwnerEmails = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = row.name.trim();
    const nameNorm = normalizeText(name);
    const email = row.email?.trim().toLowerCase() || undefined;
    const dob = row.dateOfBirth || undefined;

    if (!name) {
      planned[i] = { kind: "skip", index: i, reason: "Nom manquant" };
      continue;
    }
    if (email && isTechnicalEmail(email)) {
      planned[i] = { kind: "skip", index: i, reason: "Adresse email technique non autorisée" };
      continue;
    }
    if (!email && !dob) {
      planned[i] = { kind: "skip", index: i, reason: "Email ou date de naissance requis pour identifier la personne" };
      continue;
    }

    const dupKey = dob ? `n|${nameNorm}|${dob}` : `e|${nameNorm}|${email ?? ""}`;
    if (seenDup.has(dupKey)) {
      planned[i] = { kind: "skip", index: i, reason: "Doublon dans le fichier (même nom et même date de naissance)" };
      continue;
    }
    seenDup.add(dupKey);
    rowEmail[i] = email ?? null;

    // 1. Same name + birth date as a member of THIS club → that person (re-import is an update).
    let existing: ExistingUserRef | null = null;
    if (dob) {
      existing = state.clubMembers.find((m) => m.nameNorm === nameNorm && m.dateOfBirth === dob) ?? null;
    }

    let emailKind: "real" | "technical" = email ? "real" : "technical";
    let keptEmail: string | null = email ?? null;

    // 2. By email — unless that email belongs to someone else (a parent's address on a child's row).
    if (!existing && email) {
      const ownerIndex = emailOwners.get(email);
      const byEmail = state.usersByEmail.get(email);
      // A different name AND a birth date that is not the account holder's → another person
      // (a child using a parent's address). Without a birth date we cannot tell, so same email = same person.
      const differsFromExisting =
        !!byEmail && byEmail.nameNorm !== nameNorm && !!dob && byEmail.dateOfBirth !== dob;

      if (ownerIndex !== undefined || differsFromExisting) {
        if (!dob) {
          // Without a birth date the person could not be recognised on a re-import: it would
          // create a new account every time.
          planned[i] = {
            kind: "skip",
            index: i,
            reason: "Email partagé avec une autre personne : date de naissance requise pour la distinguer",
          };
          continue;
        }
        demoted[i] = true;
        emailKind = "technical";
        keptEmail = null;
        if (ownerIndex !== undefined) sharedOwnerEmails.add(email);
        warnings.push({
          row: i,
          message:
            "Email partagé avec une autre personne : rattaché au foyer, sans compte propre (l'adresse sert de contact du foyer)",
        });
      } else {
        emailOwners.set(email, i);
        if (byEmail) existing = byEmail;
      }
    }

    planned[i] = {
      kind: "import",
      index: i,
      existingUserId: existing?.userId ?? null,
      emailKind: existing ? "real" : emailKind,
      email: existing ? null : keptEmail,
      householdGroup: null,
      assignHousehold: true,
      tagKeys: [],
    };
  }

  // --- Households -------------------------------------------------------------------------
  const explicitKey: (string | null)[] = rows.map((r) => r.householdKey?.trim().toLowerCase() || null);
  const referencedKeys = new Set(explicitKey.filter((k): k is string => !!k));
  const groupOf: (string | null)[] = new Array(rows.length).fill(null);

  for (let i = 0; i < rows.length; i++) {
    const p = planned[i];
    if (p.kind !== "import") continue;
    const own = rowEmail[i];
    if (explicitKey[i]) groupOf[i] = explicitKey[i];
    else if (demoted[i] && own) groupOf[i] = own;
    else if (own && sharedOwnerEmails.has(own)) groupOf[i] = own;
    else if (own && referencedKeys.has(own)) groupOf[i] = own;
  }

  const groups = new Map<string, number[]>();
  for (let i = 0; i < rows.length; i++) {
    const key = groupOf[i];
    if (!key) continue;
    const list = groups.get(key) ?? [];
    list.push(i);
    groups.set(key, list);
  }

  const households: PlannedHousehold[] = [];
  for (const [groupKey, memberRowIndexes] of groups) {
    const contactEmail = looksLikeEmail(groupKey) && !isTechnicalEmail(groupKey) ? groupKey : null;

    let existingHouseholdId: string | null =
      (contactEmail
        ? state.households.find((h) => h.contactEmail?.toLowerCase() === contactEmail)?.id
        : state.households.find((h) => normalizeText(h.name) === normalizeText(groupKey))?.id) ?? null;
    if (!existingHouseholdId) {
      for (const idx of memberRowIndexes) {
        const p = planned[idx] as PlannedRow;
        const householdId = p.existingUserId ? refById.get(p.existingUserId)?.householdId : null;
        if (householdId) {
          existingHouseholdId = householdId;
          break;
        }
      }
    }

    const payerRowIndex = contactEmail
      ? (memberRowIndexes.find((idx) => rowEmail[idx] === contactEmail && !demoted[idx]) ?? null)
      : null;
    const payerRef = contactEmail ? state.usersByEmail.get(contactEmail) : undefined;
    const payerExistingUserId =
      payerRowIndex === null && payerRef?.isClubMember ? payerRef.userId : null;

    const nameSource = payerRowIndex ?? memberRowIndexes[0];
    households.push({
      groupKey,
      existingHouseholdId,
      name: `Famille ${lastToken(rows[nameSource].name)}`,
      contactEmail,
      payerRowIndex,
      payerExistingUserId,
      memberRowIndexes,
    });

    for (const idx of memberRowIndexes) {
      const p = planned[idx] as PlannedRow;
      p.householdGroup = groupKey;
      const currentHousehold = p.existingUserId ? refById.get(p.existingUserId)?.householdId : null;
      if (currentHousehold && currentHousehold !== existingHouseholdId) {
        p.assignHousehold = false;
        warnings.push({ row: idx, message: "Déjà rattaché à un autre foyer : foyer conservé" });
      }
    }
  }

  // --- Tags ---------------------------------------------------------------------------------
  const catalog = new Map<string, PlannedTag>();
  for (const tag of state.tags) {
    const key = tagKey(tag.name);
    if (key && !catalog.has(key)) catalog.set(key, { key, name: tag.name, existingId: tag.id });
  }
  for (let i = 0; i < rows.length; i++) {
    const p = planned[i];
    if (p.kind !== "import") continue;
    const keys = new Set<string>();
    for (const raw of rows[i].tags ?? []) {
      const key = tagKey(raw);
      if (!key) continue;
      if (!catalog.has(key)) catalog.set(key, { key, name: raw.trim(), existingId: null });
      keys.add(key);
    }
    p.tagKeys = [...keys];
  }
  const usedKeys = new Set<string>();
  for (const p of planned) if (p.kind === "import") for (const k of p.tagKeys) usedKeys.add(k);
  const tags = [...catalog.values()].filter((t) => usedKeys.has(t.key));

  return { rows: planned, households, tags, warnings };
}
