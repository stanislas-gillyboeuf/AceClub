import { faker } from "@faker-js/faker";
import { ulid } from "ulid";
import { matchComment } from "../../db/schema/index.js";
import type { Database } from "./context.js";

const COMMENT_CONTENTS_FR = [
  "Beau match !",
  "À la prochaine !",
  "Bien joué, c'était serré",
  "Super partie, merci !",
  "Très bon match, on remet ça bientôt",
  "T'étais vraiment en forme !",
  "Match compliqué mais enrichissant",
  "Bravo pour ta régularité",
  "C'était un plaisir de jouer",
  "Toujours sympa de se retrouver sur le court",
];

export async function seedComments(
  db: Database,
  ctx: {
    finishedMatchIds: string[];
    matchIdToParticipants: Map<
      string,
      {
        homeUserId: string;
        awayUserId: string;
      }
    >;
    userRows: Map<string, { name: string; image: string | null }>;
  },
): Promise<void> {
  const rows: Array<{
    id: string;
    matchId: string;
    userId: string;
    content: string;
    userName: string;
    userImage: string | null;
    createdAt: Date;
  }> = [];

  // ~60% of finished matches get comments
  for (const matchId of ctx.finishedMatchIds) {
    if (!faker.datatype.boolean(0.6)) continue;

    const participants = ctx.matchIdToParticipants.get(matchId);
    if (!participants) continue;

    // 1 comment per participant
    for (const userId of [participants.homeUserId, participants.awayUserId]) {
      const userData = ctx.userRows.get(userId);
      rows.push({
        id: ulid(),
        matchId,
        userId,
        content: faker.helpers.arrayElement(COMMENT_CONTENTS_FR),
        userName: userData?.name ?? "Joueur",
        userImage: userData?.image ?? null,
        createdAt: faker.date.recent({ days: 7 }),
      });
    }
  }

  if (rows.length > 0) {
    await db.insert(matchComment).values(rows);
  }
  console.log(`  Inserted ${rows.length} match comments`);
}
