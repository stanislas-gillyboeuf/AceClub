import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { ulid } from "ulid";
import { eq, and } from "drizzle-orm";
import * as schema from "../db/schema/index";
import {
  user,
  organization,
  member,
  match,
  matchParticipant,
  set,
  setScore,
  userLevel,
  acesTransaction,
  userStreak,
  userPreference,
  badge,
  userBadge,
  title,
  userTitle,
} from "../db/schema/index";

const DEMO_USER_ID = "AtdCzdItXFiA3zIqzsroE2HlaClT5fex";

const GHOST_PLAYERS = [
  { name: "Pierre Dubois", image: null },
  { name: "Marie Laurent", image: null },
  { name: "Thomas Martin", image: null },
  { name: "Sophie Bernard", image: null },
  { name: "Lucas Petit", image: null },
  { name: "Emma Richard", image: null },
  { name: "Hugo Moreau", image: null },
  { name: "Chloé Simon", image: null },
];

// Match results to create a varied history
// Score format: [homeGames, awayGames] per set, demoUserSide, isWinner
const MATCH_HISTORY: Array<{
  sets: Array<[number, number]>;
  demoSide: "home" | "away";
  isWinner: boolean;
  daysAgo: number;
  status: "finished" | "scheduled" | "ongoing";
}> = [
  // Finished matches with varied results
  { sets: [[6, 4], [6, 3]], demoSide: "home", isWinner: true, daysAgo: 2, status: "finished" , type: "match"},
  { sets: [[4, 6], [6, 7]], demoSide: "away", isWinner: false, daysAgo: 5, status: "finished" },
  { sets: [[6, 2], [6, 1]], demoSide: "home", isWinner: true, daysAgo: 8, status: "finished" },
  { sets: [[7, 6], [3, 6], [6, 4]], demoSide: "away", isWinner: true, daysAgo: 12, status: "finished" },
  { sets: [[2, 6], [4, 6]], demoSide: "home", isWinner: false, daysAgo: 15, status: "finished" },
  { sets: [[6, 4], [4, 6], [7, 5]], demoSide: "home", isWinner: true, daysAgo: 20, status: "finished" },
  { sets: [[6, 0], [6, 2]], demoSide: "away", isWinner: true, daysAgo: 25, status: "finished" },
  { sets: [[3, 6], [6, 7]], demoSide: "home", isWinner: false, daysAgo: 30, status: "finished" },
  // Scheduled match (upcoming)
  { sets: [], demoSide: "home", isWinner: false, daysAgo: -3, status: "scheduled" },
  // Ongoing match
  { sets: [[6, 4]], demoSide: "away", isWinner: false, daysAgo: 0, status: "ongoing" },
];

const DEMO_ORG = {
  name: "Tennis Club Paris 15",
  slug: "tc-paris-15",
  logo: null,
};

if (!("DATABASE_URL" in process.env)) {
  throw new Error("DATABASE_URL not found. Set it in .env");
}

async function seedDemoUser(): Promise<void> {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const db = drizzle(pool, { schema }) as unknown as typeof schema & ReturnType<typeof drizzle>;

  console.log("🎾 Seeding demo data for user:", DEMO_USER_ID);

  // 1. Verify the demo user exists
  const [demoUser] = await db.select().from(user).where(eq(user.id, DEMO_USER_ID)).limit(1);
  if (!demoUser) {
    console.error("❌ Demo user not found with ID:", DEMO_USER_ID);
    await pool.end();
    process.exit(1);
  }
  console.log("  ✓ Found demo user:", demoUser.name);

  // 2. Create ghost users for opponents
  console.log("  Creating ghost players...");
  const ghostUserIds: string[] = [];

  for (const ghost of GHOST_PLAYERS) {
    const id = ulid();
    ghostUserIds.push(id);
    await db.insert(user).values({
      id,
      name: ghost.name,
      email: `ghost-${id.toLowerCase()}@aceclub.demo`,
      emailVerified: false,
      image: ghost.image,
      is_ghost: true,
      onboarding_completed: true,
    }).onConflictDoNothing();
  }
  console.log(`  ✓ Created ${ghostUserIds.length} ghost players`);

  // 3. Create organization and add demo user as member
  console.log("  Creating demo organization...");
  const orgId = ulid();

  // Check if org with same slug exists
  const [existingOrg] = await db.select().from(organization).where(eq(organization.slug, DEMO_ORG.slug)).limit(1);

  let finalOrgId = orgId;
  if (!existingOrg) {
    await db.insert(organization).values({
      id: orgId,
      name: DEMO_ORG.name,
      slug: DEMO_ORG.slug,
      logo: DEMO_ORG.logo,
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
    });
    console.log(`  ✓ Created organization: ${DEMO_ORG.name}`);
  } else {
    finalOrgId = existingOrg.id;
    console.log(`  ✓ Organization already exists: ${DEMO_ORG.name}`);
  }

  // Add demo user as owner if not already member
  const [existingMember] = await db
    .select()
    .from(member)
    .where(and(eq(member.organizationId, finalOrgId), eq(member.userId, DEMO_USER_ID)))
    .limit(1);

  if (!existingMember) {
    await db.insert(member).values({
      id: ulid(),
      organizationId: finalOrgId,
      userId: DEMO_USER_ID,
      role: "owner",
      createdAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000),
    });
    console.log("  ✓ Added demo user as organization owner");
  } else {
    console.log("  ✓ Demo user already member of organization");
  }

  // Add some ghost players as members too
  for (let i = 0; i < 4 && i < ghostUserIds.length; i++) {
    const ghostId = ghostUserIds[i];
    const [existingGhostMember] = await db
      .select()
      .from(member)
      .where(and(eq(member.organizationId, finalOrgId), eq(member.userId, ghostId)))
      .limit(1);

    if (!existingGhostMember) {
      await db.insert(member).values({
        id: ulid(),
        organizationId: finalOrgId,
        userId: ghostId,
        role: "member",
        createdAt: new Date(Date.now() - (70 - i * 10) * 24 * 60 * 60 * 1000),
      });
    }
  }
  console.log("  ✓ Added ghost players to organization");

  // 4. Create matches with varied history
  console.log("  Creating match history...");
  let matchCount = 0;

  for (let i = 0; i < MATCH_HISTORY.length; i++) {
    const matchData = MATCH_HISTORY[i];
    const opponentId = ghostUserIds[i % ghostUserIds.length];
    const matchId = ulid();

    const matchDate = new Date();
    matchDate.setDate(matchDate.getDate() - matchData.daysAgo);

    // Create the match
    await db.insert(match).values({
      id: matchId,
      createdBy: DEMO_USER_ID,
      status: matchData.status,
      type: "match",
      createdAt: matchDate,
      scheduledAt: matchData.status === "scheduled" ? matchDate : null,
      startedAt: matchData.status !== "scheduled" ? matchDate : null,
      finishedAt: matchData.status === "finished" ? matchDate : null,
    });

    // Create participants
    const homeParticipantId = ulid();
    const awayParticipantId = ulid();

    const demoParticipantId = matchData.demoSide === "home" ? homeParticipantId : awayParticipantId;
    const opponentParticipantId = matchData.demoSide === "home" ? awayParticipantId : homeParticipantId;

    await db.insert(matchParticipant).values([
      {
        id: homeParticipantId,
        matchId,
        userId: matchData.demoSide === "home" ? DEMO_USER_ID : opponentId,
        side: "home",
        isWinner: matchData.status === "finished"
          ? (matchData.demoSide === "home" ? matchData.isWinner : !matchData.isWinner)
          : false,
      },
      {
        id: awayParticipantId,
        matchId,
        userId: matchData.demoSide === "away" ? DEMO_USER_ID : opponentId,
        side: "away",
        isWinner: matchData.status === "finished"
          ? (matchData.demoSide === "away" ? matchData.isWinner : !matchData.isWinner)
          : false,
      },
    ]);

    // Create sets and scores for matches that have them
    for (let s = 0; s < matchData.sets.length; s++) {
      const [homeGames, awayGames] = matchData.sets[s];
      const setId = ulid();

      await db.insert(set).values({
        id: setId,
        matchId,
        setNumber: (s + 1) as 1 | 2 | 3 | 4 | 5,
      });

      await db.insert(setScore).values([
        {
          id: ulid(),
          setId,
          participantId: homeParticipantId,
          games: homeGames,
        },
        {
          id: ulid(),
          setId,
          participantId: awayParticipantId,
          games: awayGames,
        },
      ]);
    }

    matchCount++;
  }

  console.log(`  ✓ Created ${matchCount} matches with scores`);

  // 5. Create user level and aces transactions
  console.log("  Creating user level and aces...");

  const finishedMatches = MATCH_HISTORY.filter((m) => m.status === "finished");
  const wins = finishedMatches.filter((m) => m.isWinner).length;
  const losses = finishedMatches.length - wins;

  // Calculate total aces: 10 per match participation + 25 per win
  const ACES_PER_MATCH = 10;
  const ACES_PER_WIN = 25;
  const totalAces = finishedMatches.length * ACES_PER_MATCH + wins * ACES_PER_WIN;

  // Calculate level (every 100 aces = 1 level, starting at level 1)
  const currentLevel = Math.floor(totalAces / 100) + 1;

  // Check if userLevel already exists
  const [existingLevel] = await db
    .select()
    .from(userLevel)
    .where(eq(userLevel.userId, DEMO_USER_ID))
    .limit(1);

  if (!existingLevel) {
    await db.insert(userLevel).values({
      id: ulid(),
      userId: DEMO_USER_ID,
      totalAces,
      currentLevel,
    });
    console.log(`  ✓ Created user level: Level ${currentLevel} with ${totalAces} aces`);
  } else {
    // Update existing level
    await db
      .update(userLevel)
      .set({ totalAces, currentLevel })
      .where(eq(userLevel.userId, DEMO_USER_ID));
    console.log(`  ✓ Updated user level: Level ${currentLevel} with ${totalAces} aces`);
  }

  // 6. Create aces transactions history
  console.log("  Creating aces transactions...");

  for (let i = 0; i < finishedMatches.length; i++) {
    const matchData = finishedMatches[i];
    const matchDate = new Date();
    matchDate.setDate(matchDate.getDate() - matchData.daysAgo);

    // Transaction for match participation
    await db.insert(acesTransaction).values({
      id: ulid(),
      userId: DEMO_USER_ID,
      type: "match_participation",
      amount: ACES_PER_MATCH,
      description: "Match joué",
      createdAt: matchDate,
    });

    // Transaction for victory
    if (matchData.isWinner) {
      await db.insert(acesTransaction).values({
        id: ulid(),
        userId: DEMO_USER_ID,
        type: "match_victory",
        amount: ACES_PER_WIN,
        description: "Victoire",
        createdAt: matchDate,
      });
    }
  }
  console.log(`  ✓ Created ${finishedMatches.length + wins} aces transactions`);

  // 7. Create user streak
  console.log("  Creating user streak...");

  // Calculate current week number
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const currentWeek = Math.ceil(
    ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
  );

  const [existingStreak] = await db
    .select()
    .from(userStreak)
    .where(eq(userStreak.userId, DEMO_USER_ID))
    .limit(1);

  if (!existingStreak) {
    await db.insert(userStreak).values({
      id: ulid(),
      userId: DEMO_USER_ID,
      currentStreak: 4, // 4 weeks active
      longestStreak: 6,
      lastActiveWeek: currentWeek,
      lastActiveYear: now.getFullYear(),
      streakStartDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), // 4 weeks ago
      totalActiveWeeks: 12,
    });
    console.log("  ✓ Created user streak: 4 weeks current, 6 weeks best");
  } else {
    await db
      .update(userStreak)
      .set({
        currentStreak: 4,
        longestStreak: 6,
        lastActiveWeek: currentWeek,
        lastActiveYear: now.getFullYear(),
        totalActiveWeeks: 12,
      })
      .where(eq(userStreak.userId, DEMO_USER_ID));
    console.log("  ✓ Updated user streak: 4 weeks current, 6 weeks best");
  }

  // 8. Create user preference
  console.log("  Creating user preference...");

  const [existingPref] = await db
    .select()
    .from(userPreference)
    .where(eq(userPreference.userId, DEMO_USER_ID))
    .limit(1);

  if (!existingPref) {
    await db.insert(userPreference).values({
      id: ulid(),
      userId: DEMO_USER_ID,
      organizationId: finalOrgId,
      sport: "tennis",
      skillLevel: "intermediate", // 15/2 equivalent
    });
    console.log("  ✓ Created user preference: Tennis, Intermediate");
  } else {
    console.log("  ✓ User preference already exists");
  }

  // 9. Assign badges if they exist
  console.log("  Checking for badges to assign...");

  const existingBadges = await db.select().from(badge).limit(10);
  let badgesAssigned = 0;

  if (existingBadges.length > 0) {
    // Assign first 3 badges to demo user
    for (let i = 0; i < Math.min(3, existingBadges.length); i++) {
      const b = existingBadges[i];
      const [existingUserBadge] = await db
        .select()
        .from(userBadge)
        .where(and(eq(userBadge.userId, DEMO_USER_ID), eq(userBadge.badgeId, b.id)))
        .limit(1);

      if (!existingUserBadge) {
        await db.insert(userBadge).values({
          id: ulid(),
          userId: DEMO_USER_ID,
          badgeId: b.id,
          unlockedAt: new Date(Date.now() - (30 - i * 10) * 24 * 60 * 60 * 1000),
        });
        badgesAssigned++;
      }
    }
    console.log(`  ✓ Assigned ${badgesAssigned} badges`);
  } else {
    console.log("  ⚠ No badges found in database");
  }

  // 10. Assign title if they exist
  console.log("  Checking for titles to assign...");

  const existingTitles = await db.select().from(title).limit(5);

  if (existingTitles.length > 0) {
    // Find a title matching current level or lower
    const eligibleTitle = existingTitles.find((t) => t.requiredLevel <= currentLevel);

    if (eligibleTitle) {
      const [existingUserTitle] = await db
        .select()
        .from(userTitle)
        .where(eq(userTitle.userId, DEMO_USER_ID))
        .limit(1);

      if (!existingUserTitle) {
        await db.insert(userTitle).values({
          id: ulid(),
          userId: DEMO_USER_ID,
          titleId: eligibleTitle.id,
        });
        console.log(`  ✓ Assigned title: ${eligibleTitle.nameFr}`);
      } else {
        console.log(`  ✓ User already has a title equipped`);
      }
    } else {
      console.log("  ⚠ No eligible title found for current level");
    }
  } else {
    console.log("  ⚠ No titles found in database");
  }

  // Summary
  console.log("\n📊 Demo data summary:");
  console.log(`   - Ghost players: ${ghostUserIds.length}`);
  console.log(`   - Organization: ${DEMO_ORG.name}`);
  console.log(`   - Total matches: ${matchCount}`);
  console.log(`   - Wins: ${wins}, Losses: ${losses}`);
  console.log(`   - Win rate: ${((wins / (wins + losses)) * 100).toFixed(0)}%`);
  console.log(`   - Level: ${currentLevel}`);
  console.log(`   - Total Aces: ${totalAces}`);
  console.log(`   - Current Streak: 4 weeks`);
  console.log(`   - Badges: ${badgesAssigned}`);

  await pool.end();
  console.log("\n✅ Demo seed completed!");
}

seedDemoUser().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
