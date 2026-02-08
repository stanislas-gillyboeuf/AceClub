import "dotenv/config";
import { db } from "../db";
import { badge } from "../db/schema/reward/schema";
import { ulid } from "ulid";

const BADGES = [
  {
    id: ulid(),
    code: "premiers_pas",
    category: "achievement" as const,
    nameFr: "Premiers pas",
    nameEn: "First steps",
    descriptionFr: "Bienvenue dans le club !",
    descriptionEn: "Welcome to the club!",
    imageUrl:
      "https://bucket-production-f7ab.up.railway.app/aceclub-production/badges/premiers_pas.png",
    requiredLevel: null,
    isActive: true,
    displayOrder: 10,
  },
  {
    id: ulid(),
    code: "joueur_regulier",
    category: "achievement" as const,
    nameFr: "Joueur régulier",
    nameEn: "Regular player",
    descriptionFr: "A joué 5 fois dans le mois",
    descriptionEn: "Played 5 times this month",
    imageUrl:
      "https://bucket-production-f7ab.up.railway.app/aceclub-production/badges/joueur_regulier.png",
    requiredLevel: null,
    isActive: true,
    displayOrder: 11,
  },
  {
    id: ulid(),
    code: "en_forme",
    category: "achievement" as const,
    nameFr: "En forme",
    nameEn: "In shape",
    descriptionFr: "A joué 5 fois par mois pendant 3 mois",
    descriptionEn: "Played 5 times per month for 3 months",
    imageUrl:
      "https://bucket-production-f7ab.up.railway.app/aceclub-production/badges/en_forme.png",
    requiredLevel: null,
    isActive: true,
    displayOrder: 12,
  },
];

async function main() {
  console.log("Seeding badges...\n");

  for (const badgeData of BADGES) {
    try {
      await db.insert(badge).values(badgeData).onConflictDoNothing();
      console.log(`Inserted: ${badgeData.code}`);
    } catch (error) {
      console.error(`Failed to insert ${badgeData.code}:`, error);
    }
  }

  console.log("\nDone!");
  process.exit(0);
}

main();
