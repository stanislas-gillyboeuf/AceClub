import { ulid } from "ulid";
import { title, userTitle } from "../../db/schema/index.js";
import type { Database } from "./context.js";

const TITLES = [
  { code: "debutant", nameFr: "Débutant", nameEn: "Beginner", requiredLevel: 1, displayOrder: 1 },
  {
    code: "intermediaire",
    nameFr: "Intermédiaire",
    nameEn: "Intermediate",
    requiredLevel: 2,
    displayOrder: 2,
  },
  { code: "confirme", nameFr: "Confirmé", nameEn: "Advanced", requiredLevel: 3, displayOrder: 3 },
  { code: "expert", nameFr: "Expert", nameEn: "Expert", requiredLevel: 5, displayOrder: 4 },
  { code: "maitre", nameFr: "Maître", nameEn: "Master", requiredLevel: 7, displayOrder: 5 },
];

export async function seedTitles(
  db: Database,
  ctx: {
    userIds: string[];
    userLevels: Map<string, { totalAces: number; currentLevel: number }>;
  },
): Promise<void> {
  // Insert title definitions
  const titleRows = TITLES.map((t) => ({
    id: ulid(),
    code: t.code,
    nameFr: t.nameFr,
    nameEn: t.nameEn,
    requiredLevel: t.requiredLevel,
    displayOrder: t.displayOrder,
    isActive: true,
  }));

  await db.insert(title).values(titleRows);
  console.log(`  Inserted ${titleRows.length} titles`);

  // Assign highest eligible title to each user
  const userTitleRows = [];

  for (const userId of ctx.userIds) {
    const level = ctx.userLevels.get(userId);
    const userCurrentLevel = level?.currentLevel ?? 1;

    // Find highest eligible title (sorted by requiredLevel desc)
    let bestTitle: (typeof titleRows)[0] | null = null;
    for (let i = titleRows.length - 1; i >= 0; i--) {
      if (TITLES[i].requiredLevel <= userCurrentLevel) {
        bestTitle = titleRows[i];
        break;
      }
    }

    if (bestTitle) {
      userTitleRows.push({
        id: ulid(),
        userId,
        titleId: bestTitle.id,
      });
    }
  }

  if (userTitleRows.length > 0) {
    await db.insert(userTitle).values(userTitleRows);
  }
  console.log(`  Inserted ${userTitleRows.length} user titles`);
}
