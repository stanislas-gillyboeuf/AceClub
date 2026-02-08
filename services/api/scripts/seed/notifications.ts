import { faker } from "@faker-js/faker";
import { ulid } from "ulid";
import { notification } from "../../db/schema/index.js";
import type { Database } from "./context.js";

type NotifType =
  | "match_request_accepted"
  | "new_match_request"
  | "match_reminder"
  | "streak_warning";

interface NotifRow {
  id: string;
  userId: string;
  type: NotifType;
  title: string;
  body: string;
  referenceId: string | null;
  referenceType: string | null;
  isRead: boolean;
  readAt: Date | null;
  sentAt: Date;
  createdAt: Date;
}

export async function seedNotifications(
  db: Database,
  ctx: {
    userIds: string[];
    matchData: Array<{
      id: string;
      status: string;
      scheduledAt: Date;
      homeUserId: string;
      awayUserId: string;
    }>;
    userRows: Map<string, { name: string; image: string | null }>;
  },
): Promise<void> {
  const rows: NotifRow[] = [];
  const now = new Date();

  // match_request_accepted for finished/ongoing matches (accepted requests)
  for (const m of ctx.matchData) {
    if (m.status === "scheduled") continue;

    const receiverName = ctx.userRows.get(m.awayUserId)?.name ?? "Un joueur";
    const sentAt = new Date(m.scheduledAt.getTime() - 2 * 60 * 60 * 1000);
    const isOld = sentAt.getTime() < now.getTime() - 3 * 24 * 60 * 60 * 1000;

    rows.push({
      id: ulid(),
      userId: m.homeUserId,
      type: "match_request_accepted",
      title: "Demande acceptée",
      body: `${receiverName} a accepté votre demande de match`,
      referenceId: m.id,
      referenceType: "match",
      isRead: isOld,
      readAt: isOld ? new Date(sentAt.getTime() + 30 * 60 * 1000) : null,
      sentAt,
      createdAt: sentAt,
    });
  }

  // new_match_request for scheduled matches (pending)
  for (const m of ctx.matchData) {
    if (m.status !== "scheduled") continue;

    const requesterName = ctx.userRows.get(m.homeUserId)?.name ?? "Un joueur";
    const sentAt = faker.date.recent({ days: 2 });

    rows.push({
      id: ulid(),
      userId: m.awayUserId,
      type: "new_match_request",
      title: "Nouvelle demande",
      body: `${requesterName} vous a envoyé une demande de match`,
      referenceId: m.id,
      referenceType: "match",
      isRead: false,
      readAt: null,
      sentAt,
      createdAt: sentAt,
    });
  }

  // match_reminder for scheduled matches
  for (const m of ctx.matchData) {
    if (m.status !== "scheduled") continue;

    const reminderAt = new Date(m.scheduledAt.getTime() - 24 * 60 * 60 * 1000);
    if (reminderAt.getTime() > now.getTime()) continue; // Only send reminders for soon matches

    for (const userId of [m.homeUserId, m.awayUserId]) {
      rows.push({
        id: ulid(),
        userId,
        type: "match_reminder",
        title: "Rappel de match",
        body: "Votre match est prévu demain, n'oubliez pas !",
        referenceId: m.id,
        referenceType: "match",
        isRead: false,
        readAt: null,
        sentAt: reminderAt,
        createdAt: reminderAt,
      });
    }
  }

  // streak_warning for random active users
  const activeUsers = ctx.userIds.slice(0, 5);
  for (const userId of activeUsers) {
    const sentAt = faker.date.recent({ days: 1 });
    rows.push({
      id: ulid(),
      userId,
      type: "streak_warning",
      title: "Streak en danger !",
      body: "Jouez un match cette semaine pour maintenir votre série",
      referenceId: null,
      referenceType: null,
      isRead: false,
      readAt: null,
      sentAt,
      createdAt: sentAt,
    });
  }

  if (rows.length > 0) {
    await db.insert(notification).values(rows);
  }
  console.log(`  Inserted ${rows.length} notifications`);
}
