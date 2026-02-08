import { ulid } from "ulid";
import { userStreak } from "../../db/schema/index.js";
import type { Database } from "./context.js";

function getISOWeek(date: Date): { week: number; year: number } {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { week, year: d.getFullYear() };
}

export async function seedStreaks(
  db: Database,
  ctx: {
    userIds: string[];
    matchData: Array<{
      status: string;
      startedAt: Date | null;
      homeUserId: string;
      awayUserId: string;
    }>;
  },
): Promise<void> {
  // Collect active weeks per user from matches that started
  const userWeeks = new Map<string, Set<string>>();

  for (const m of ctx.matchData) {
    if (!m.startedAt) continue; // scheduled matches have no startedAt
    const { week, year } = getISOWeek(m.startedAt);
    const weekKey = `${year}-W${week}`;

    for (const userId of [m.homeUserId, m.awayUserId]) {
      if (!userWeeks.has(userId)) userWeeks.set(userId, new Set());
      userWeeks.get(userId)!.add(weekKey);
    }
  }

  const rows = [];

  for (const userId of ctx.userIds) {
    const weeks = userWeeks.get(userId);
    if (!weeks || weeks.size === 0) {
      // Users with no matches get a default streak of 0
      rows.push({
        id: ulid(),
        userId,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveWeek: null,
        lastActiveYear: null,
        streakStartDate: null,
        totalActiveWeeks: 0,
      });
      continue;
    }

    // Sort weeks chronologically
    const sortedWeeks = [...weeks].sort();
    const totalActiveWeeks = sortedWeeks.length;

    // Parse week keys into { year, week } for streak calculation
    const parsed = sortedWeeks.map((wk) => {
      const [y, w] = wk.split("-W");
      return { year: parseInt(y), week: parseInt(w) };
    });

    // Calculate consecutive weeks (streak)
    let currentStreak = 1;
    let longestStreak = 1;
    let tempStreak = 1;

    for (let i = 1; i < parsed.length; i++) {
      const prev = parsed[i - 1];
      const curr = parsed[i];

      // Check if consecutive: same year next week, or year boundary
      const isConsecutive =
        (curr.year === prev.year && curr.week === prev.week + 1) ||
        (curr.year === prev.year + 1 && prev.week >= 52 && curr.week === 1);

      if (isConsecutive) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Current streak is the streak ending at the most recent week
    const now = new Date();
    const { week: currentWeek, year: currentYear } = getISOWeek(now);
    const lastParsed = parsed[parsed.length - 1];

    // If last active week is current or previous week, streak is alive
    const isRecentlyActive =
      (lastParsed.year === currentYear && lastParsed.week >= currentWeek - 1) ||
      (lastParsed.year === currentYear - 1 && currentWeek === 1 && lastParsed.week >= 52);

    currentStreak = isRecentlyActive ? tempStreak : 0;

    rows.push({
      id: ulid(),
      userId,
      currentStreak,
      longestStreak,
      lastActiveWeek: lastParsed.week,
      lastActiveYear: lastParsed.year,
      streakStartDate: null,
      totalActiveWeeks,
    });
  }

  if (rows.length > 0) {
    await db.insert(userStreak).values(rows);
  }
  console.log(`  Inserted ${rows.length} user streaks`);
}
