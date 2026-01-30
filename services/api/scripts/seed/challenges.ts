import type { Database } from "./context.js";
import { challengeTemplate } from "../../db/schema/challenge/schema.js";

const CHALLENGE_TEMPLATES = [
  // Quantitative - Easy
  {
    code: "play_1_match",
    type: "quantitative" as const,
    difficulty: "easy" as const,
    titleFr: "Premier pas",
    titleEn: "First Step",
    descriptionFr: "Joue 1 match cette semaine",
    descriptionEn: "Play 1 match this week",
    targetValue: 1,
    acesReward: 50,
    minLevel: 1,
    maxLevel: null,
  },
  {
    code: "play_3_matches",
    type: "quantitative" as const,
    difficulty: "easy" as const,
    titleFr: "Échauffement",
    titleEn: "Warm Up",
    descriptionFr: "Joue 3 matchs cette semaine",
    descriptionEn: "Play 3 matches this week",
    targetValue: 3,
    acesReward: 100,
    minLevel: 1,
    maxLevel: null,
  },
  // Quantitative - Medium
  {
    code: "play_5_matches",
    type: "quantitative" as const,
    difficulty: "medium" as const,
    titleFr: "Entraînement intensif",
    titleEn: "Intense Training",
    descriptionFr: "Joue 5 matchs cette semaine",
    descriptionEn: "Play 5 matches this week",
    targetValue: 5,
    acesReward: 200,
    minLevel: 3,
    maxLevel: null,
  },
  {
    code: "play_7_matches",
    type: "quantitative" as const,
    difficulty: "hard" as const,
    titleFr: "Machine de guerre",
    titleEn: "War Machine",
    descriptionFr: "Joue 7 matchs cette semaine",
    descriptionEn: "Play 7 matches this week",
    targetValue: 7,
    acesReward: 350,
    minLevel: 5,
    maxLevel: null,
  },
  // Social - Easy
  {
    code: "play_with_new_player",
    type: "social" as const,
    difficulty: "easy" as const,
    titleFr: "Nouvelle rencontre",
    titleEn: "New Encounter",
    descriptionFr: "Joue avec un joueur que tu n'as jamais affronté",
    descriptionEn: "Play with a player you've never faced before",
    targetValue: 1,
    acesReward: 75,
    minLevel: 1,
    maxLevel: null,
  },
  {
    code: "play_with_3_new_players",
    type: "social" as const,
    difficulty: "medium" as const,
    titleFr: "Explorateur",
    titleEn: "Explorer",
    descriptionFr: "Joue avec 3 joueurs différents cette semaine",
    descriptionEn: "Play with 3 different players this week",
    targetValue: 3,
    acesReward: 150,
    minLevel: 2,
    maxLevel: null,
  },
  {
    code: "play_with_5_new_players",
    type: "social" as const,
    difficulty: "hard" as const,
    titleFr: "Ambassadeur",
    titleEn: "Ambassador",
    descriptionFr: "Joue avec 5 joueurs différents cette semaine",
    descriptionEn: "Play with 5 different players this week",
    targetValue: 5,
    acesReward: 300,
    minLevel: 4,
    maxLevel: null,
  },
  // Performance - Easy
  {
    code: "win_1_match",
    type: "performance" as const,
    difficulty: "easy" as const,
    titleFr: "Première victoire",
    titleEn: "First Victory",
    descriptionFr: "Gagne 1 match cette semaine",
    descriptionEn: "Win 1 match this week",
    targetValue: 1,
    acesReward: 75,
    minLevel: 1,
    maxLevel: null,
  },
  {
    code: "win_3_matches",
    type: "performance" as const,
    difficulty: "medium" as const,
    titleFr: "Sur une lancée",
    titleEn: "On a Roll",
    descriptionFr: "Gagne 3 matchs cette semaine",
    descriptionEn: "Win 3 matches this week",
    targetValue: 3,
    acesReward: 175,
    minLevel: 3,
    maxLevel: null,
  },
  {
    code: "win_5_matches",
    type: "performance" as const,
    difficulty: "hard" as const,
    titleFr: "Inarrêtable",
    titleEn: "Unstoppable",
    descriptionFr: "Gagne 5 matchs cette semaine",
    descriptionEn: "Win 5 matches this week",
    targetValue: 5,
    acesReward: 400,
    minLevel: 5,
    maxLevel: null,
  },
  // Performance - Streak challenges
  {
    code: "win_2_consecutive",
    type: "performance" as const,
    difficulty: "medium" as const,
    titleFr: "Série gagnante",
    titleEn: "Winning Streak",
    descriptionFr: "Gagne 2 matchs consécutifs",
    descriptionEn: "Win 2 consecutive matches",
    targetValue: 2,
    acesReward: 150,
    minLevel: 2,
    maxLevel: null,
  },
  {
    code: "win_3_consecutive",
    type: "performance" as const,
    difficulty: "hard" as const,
    titleFr: "Invincible",
    titleEn: "Invincible",
    descriptionFr: "Gagne 3 matchs consécutifs",
    descriptionEn: "Win 3 consecutive matches",
    targetValue: 3,
    acesReward: 350,
    minLevel: 4,
    maxLevel: null,
  },
] as const;

export async function seedChallenges(db: Database): Promise<{ templateIds: string[] }> {
  console.log("  Seeding challenge templates...");

  const inserted = await db
    .insert(challengeTemplate)
    .values(
      CHALLENGE_TEMPLATES.map((t) => ({
        code: t.code,
        type: t.type,
        difficulty: t.difficulty,
        titleFr: t.titleFr,
        titleEn: t.titleEn,
        descriptionFr: t.descriptionFr,
        descriptionEn: t.descriptionEn,
        targetValue: t.targetValue,
        acesReward: t.acesReward,
        minLevel: t.minLevel,
        maxLevel: t.maxLevel,
        isActive: true,
      }))
    )
    .onConflictDoNothing()
    .returning({ id: challengeTemplate.id });

  const templateIds = inserted.map((r) => r.id);
  console.log(`  ✓ Inserted ${templateIds.length} challenge templates`);

  return { templateIds };
}
