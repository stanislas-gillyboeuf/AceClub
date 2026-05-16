import { eq, and, lte, gte, or, isNull } from "drizzle-orm";
import { db } from "../../../db";
import { challengeTemplate, userChallenge } from "../../../db/schema/challenge/schema";
import type { ChallengeTemplate } from "../../../db/schema/challenge/type";
import { user } from "../../../db/schema/auth/schema";
import { userLevel } from "../../../db/schema/level/schema";
import { sendNotificationToUser } from "../../../services/expo-push/notification-service";

// Nombre de semaines à considérer pour éviter les répétitions
const RECENT_WEEKS_TO_AVOID = 3;

export function getISOWeekInfo(date: Date): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { week: weekNo, year: d.getUTCFullYear() };
}

export function getWeekEndDate(date: Date): Date {
  const d = new Date(date);
  const dayOfWeek = d.getDay();
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  d.setDate(d.getDate() + daysUntilSunday);
  d.setHours(23, 59, 59, 999);
  return d;
}

interface RecentChallengeInfo {
  templateId: string;
  status: string;
  weeksAgo: number;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function weightedRandomSelect(
  templates: ChallengeTemplate[],
  level: number,
  recentChallenges: RecentChallengeInfo[] = [],
): ChallengeTemplate {
  const shuffledTemplates = shuffleArray(templates);

  const recentTemplateIds = new Set(recentChallenges.map((c) => c.templateId));
  const completedRecently = new Set(
    recentChallenges.filter((c) => c.status === "completed").map((c) => c.templateId),
  );

  const weights = shuffledTemplates.map((t) => {
    let weight = 1;

    if (t.difficulty === "easy") weight *= level < 10 ? 2 : 1;
    if (t.difficulty === "medium") weight *= level >= 10 && level < 30 ? 2 : 1;
    if (t.difficulty === "hard") weight *= level >= 30 ? 2 : 1;

    if (recentTemplateIds.has(t.id)) {
      const recent = recentChallenges.find((c) => c.templateId === t.id);
      if (recent) {
        const reductionFactor = 0.1 + recent.weeksAgo * 0.2;
        weight *= Math.min(reductionFactor, 0.5);

        if (completedRecently.has(t.id)) {
          weight *= 0.5;
        }
      }
    }

    return weight;
  });

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < shuffledTemplates.length; i++) {
    random -= weights[i];
    if (random <= 0) return shuffledTemplates[i];
  }

  return shuffledTemplates[shuffledTemplates.length - 1];
}
async function getRecentChallengesForUser(
  userId: string,
  currentWeek: number,
  currentYear: number,
): Promise<RecentChallengeInfo[]> {
  const weeksToCheck: { week: number; year: number; weeksAgo: number }[] = [];

  for (let i = 1; i <= RECENT_WEEKS_TO_AVOID; i++) {
    let week = currentWeek - i;
    let year = currentYear;

    if (week <= 0) {
      week = 52 + week;
      year = currentYear - 1;
    }

    weeksToCheck.push({ week, year, weeksAgo: i });
  }

  const recentChallenges: RecentChallengeInfo[] = [];

  for (const { week, year, weeksAgo } of weeksToCheck) {
    const challenges = await db
      .select({
        templateId: userChallenge.templateId,
        status: userChallenge.status,
      })
      .from(userChallenge)
      .where(
        and(
          eq(userChallenge.userId, userId),
          eq(userChallenge.weekNumber, week),
          eq(userChallenge.year, year),
        ),
      );

    for (const c of challenges) {
      recentChallenges.push({
        templateId: c.templateId,
        status: c.status,
        weeksAgo,
      });
    }
  }

  return recentChallenges;
}

export async function assignWeeklyChallengesForUser(userId: string, level: number): Promise<void> {
  const now = new Date();
  const weekInfo = getISOWeekInfo(now);
  const expiresAt = getWeekEndDate(now);

  const existing = await db
    .select()
    .from(userChallenge)
    .where(
      and(
        eq(userChallenge.userId, userId),
        eq(userChallenge.weekNumber, weekInfo.week),
        eq(userChallenge.year, weekInfo.year),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    return;
  }

  const recentChallenges = await getRecentChallengesForUser(userId, weekInfo.week, weekInfo.year);

  const eligibleTemplates = await db
    .select()
    .from(challengeTemplate)
    .where(
      and(
        eq(challengeTemplate.isActive, true),
        lte(challengeTemplate.minLevel, level),
        or(isNull(challengeTemplate.maxLevel), gte(challengeTemplate.maxLevel, level)),
      ),
    );

  if (eligibleTemplates.length === 0) {
    return;
  }

  const byType: Record<string, ChallengeTemplate[]> = {
    quantitative: [],
    social: [],
    performance: [],
  };

  for (const t of eligibleTemplates) {
    if (byType[t.type]) {
      byType[t.type].push(t);
    }
  }

  const selected: ChallengeTemplate[] = [];

  if (byType.quantitative.length > 0) {
    selected.push(weightedRandomSelect(byType.quantitative, level, recentChallenges));
  }

  if (byType.social.length > 0) {
    selected.push(weightedRandomSelect(byType.social, level, recentChallenges));
  }

  if (byType.performance.length > 0 && level >= 5) {
    selected.push(weightedRandomSelect(byType.performance, level, recentChallenges));
  }

  const remaining = eligibleTemplates.filter((t) => !selected.includes(t));
  while (selected.length < 3 && remaining.length > 0) {
    const template = weightedRandomSelect(remaining, level, recentChallenges);
    const index = remaining.indexOf(template);
    if (index > -1) {
      remaining.splice(index, 1);
    }
    selected.push(template);
  }

  for (const template of selected) {
    await db.insert(userChallenge).values({
      userId,
      templateId: template.id,
      weekNumber: weekInfo.week,
      year: weekInfo.year,
      targetValue: template.targetValue,
      expiresAt,
    });
  }
}

/**
 * Assigne les défis hebdomadaires à TOUS les utilisateurs.
 * Appelée par le cron job chaque lundi.
 */
export async function assignWeeklyChallenges(): Promise<void> {
  const allUsers = await db
    .select({
      userId: user.id,
      currentLevel: userLevel.currentLevel,
    })
    .from(user)
    .leftJoin(userLevel, eq(user.id, userLevel.userId));

  console.log(`[CRON] Found ${allUsers.length} users to assign challenges to`);

  let assigned = 0;
  let skipped = 0;

  for (const u of allUsers) {
    const level = u.currentLevel ?? 1;
    try {
      await assignWeeklyChallengesForUser(u.userId, level);
      assigned++;
      await sendNotificationToUser({
        userId: u.userId,
        type: "challenge_assigned",
        title: "Nouveaux défis de la semaine 🎯",
        body: "Tes défis hebdomadaires sont disponibles. Relève-les pour gagner des Aces !",
        referenceId: u.userId,
        referenceType: "user",
      });
    } catch (error) {
      console.error(`[CRON] Failed to assign challenges for user ${u.userId}:`, error);
      skipped++;
    }
  }

  console.log(`[CRON] Assigned challenges to ${assigned} users, skipped ${skipped}`);
}
