import { eq, and, lte, or, isNull } from "drizzle-orm";
import { db } from "../../../db";
import { challengeTemplate, userChallenge, ChallengeType } from "../../../db/schema/challenge/schema";
import type { ChallengeTemplate } from "../../../db/schema/challenge/type";

function getISOWeekInfo(date: Date): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { week: weekNo, year: d.getUTCFullYear() };
}

function getWeekEndDate(date: Date): Date {
  const d = new Date(date);
  const dayOfWeek = d.getDay();
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  d.setDate(d.getDate() + daysUntilSunday);
  d.setHours(23, 59, 59, 999);
  return d;
}

function weightedRandomSelect(
  templates: ChallengeTemplate[],
  userLevel: number
): ChallengeTemplate {
  const weights = templates.map((t) => {
    let weight = 1;
    if (t.difficulty === "easy") weight *= userLevel < 10 ? 2 : 1;
    if (t.difficulty === "medium") weight *= userLevel >= 10 && userLevel < 30 ? 2 : 1;
    if (t.difficulty === "hard") weight *= userLevel >= 30 ? 2 : 1;
    return weight;
  });

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < templates.length; i++) {
    random -= weights[i];
    if (random <= 0) return templates[i];
  }

  return templates[templates.length - 1];
}

export async function assignWeeklyChallenges(
  userId: string,
  userLevel: number
): Promise<void> {
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
        eq(userChallenge.year, weekInfo.year)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return;
  }

  const eligibleTemplates = await db
    .select()
    .from(challengeTemplate)
    .where(
      and(
        eq(challengeTemplate.isActive, true),
        lte(challengeTemplate.minLevel, userLevel),
        or(
          isNull(challengeTemplate.maxLevel),
          lte(userLevel, challengeTemplate.maxLevel!)
        )
      )
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
    selected.push(weightedRandomSelect(byType.quantitative, userLevel));
  }

  if (byType.social.length > 0) {
    selected.push(weightedRandomSelect(byType.social, userLevel));
  }

  if (byType.performance.length > 0 && userLevel >= 5) {
    selected.push(weightedRandomSelect(byType.performance, userLevel));
  }

  const remaining = eligibleTemplates.filter((t) => !selected.includes(t));
  while (selected.length < 3 && remaining.length > 0) {
    const index = Math.floor(Math.random() * remaining.length);
    selected.push(remaining.splice(index, 1)[0]);
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
