import "dotenv/config";
import { and, inArray, isNotNull, isNull, sql } from "drizzle-orm";
import { db } from "../db";
import { clubMemberProfile } from "../db/schema";
import type { CommuneCandidate } from "../server/club-member/lib/commune";
import { decideCityMigration, groupRowsByCity } from "./lib/city-to-commune";

/**
 * One-off data fix: the member file used to have a free-text "Ville" (`club_member_profile.city`)
 * next to the "Commune" (INSEE code) the pricing engine reads. The two are now one field, so this
 * fills `commune_insee` / `commune_name` from the old city. `city` itself is left untouched.
 *
 *   bun run scripts/migrate-city-to-commune.ts --dry-run   # log only, writes nothing
 *   bun run scripts/migrate-city-to-commune.ts             # applies the updates
 *
 * Only writes when exactly one commune has the same normalized name. Ambiguous, unknown and
 * "looks similar" cities are listed for the club to fix by hand on the member file.
 */
const dryRun = process.argv.includes("--dry-run");
const TIMEOUT_MS = 3000;
const PAUSE_MS = 150;

async function fetchCandidates(city: string): Promise<CommuneCandidate[] | null> {
  const params = new URLSearchParams({ nom: city, fields: "nom,code", limit: "5" });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`https://geo.api.gouv.fr/communes?${params.toString()}`, { signal: controller.signal });
    if (!res.ok) return null;
    const data = (await res.json()) as unknown;
    if (!Array.isArray(data)) return null;
    return data.filter(
      (c): c is CommuneCandidate => !!c && typeof c.nom === "string" && typeof c.code === "string",
    );
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const rows = await db
    .select({ id: clubMemberProfile.id, city: clubMemberProfile.city })
    .from(clubMemberProfile)
    .where(
      and(
        isNotNull(clubMemberProfile.city),
        sql`btrim(${clubMemberProfile.city}) <> ''`,
        isNull(clubMemberProfile.communeInsee),
      ),
    );

  const groups = groupRowsByCity(rows);
  console.log(`${dryRun ? "[dry-run] " : ""}${rows.length} profile(s), ${groups.size} distinct city name(s).`);

  let written = 0;
  const ambiguous: string[] = [];
  const notFound: string[] = [];
  const review: string[] = [];
  const unavailable: string[] = [];

  for (const { label, ids } of groups.values()) {
    const candidates = await fetchCandidates(label);
    await sleep(PAUSE_MS);
    if (candidates === null) {
      unavailable.push(label);
      continue;
    }

    const decision = decideCityMigration(label, candidates);
    if (decision.status === "ambiguous") ambiguous.push(`${label} (${ids.length})`);
    else if (decision.status === "not_found") notFound.push(`${label} (${ids.length})`);
    else if (decision.status === "review") review.push(`${label} -> ${decision.name} ${decision.code} (${ids.length})`);
    else {
      console.log(`"${label}" -> ${decision.name} ${decision.code} (${ids.length} profile(s))`);
      if (!dryRun) {
        await db
          .update(clubMemberProfile)
          .set({ communeInsee: decision.code, communeName: decision.name })
          .where(inArray(clubMemberProfile.id, ids));
      }
      written += ids.length;
    }
  }

  console.log(`${dryRun ? "[dry-run] would update" : "Updated"} ${written} profile(s).`);
  const report = (title: string, items: string[]) => {
    if (items.length === 0) return;
    console.log(`${title} (${items.length}), left untouched:`);
    for (const item of items) console.log(`  ${item}`);
  };
  report("Ambiguous cities", ambiguous);
  report("Unknown cities", notFound);
  report("Similar name, to confirm by hand", review);
  report("Geo API unavailable, re-run later", unavailable);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
