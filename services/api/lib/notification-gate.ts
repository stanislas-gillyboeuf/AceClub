import { db } from "../db";
import { organizationNotificationSettings } from "../db/schema/notification/schema";
import { member } from "../db/schema/auth/schema";
import { eq } from "drizzle-orm";

/** One toggle per notification "kind" a club can turn off — see the Drizzle table for the
 * exact column each key maps to. Deliberately not the push `NotificationType` enum: a few of
 * these (the `*Email` keys) are email-only and have no `NotificationType` value at all. */
export type NotificationSettingKey =
  | "streakWarning"
  | "challengeAssigned"
  | "matchRequestUpdate"
  | "matchLiked"
  | "newMessage"
  | "bookingReminder"
  | "classReminder"
  | "coachMessage"
  | "cotisationRequestEmail"
  | "cotisationReminderEmail"
  | "invitationAccepted"
  | "clubAnnouncement"
  | "memberAlertDigestEmail";

export type ResolvedNotificationSettings = Record<NotificationSettingKey, boolean>;

/** No row yet for this org = every notification behaves as enabled — same "no row = defaults"
 * convention as `court_settings` (see services/api/server/court/lib/settings.ts). */
export const DEFAULT_NOTIFICATION_SETTINGS: ResolvedNotificationSettings = {
  streakWarning: true,
  challengeAssigned: true,
  matchRequestUpdate: true,
  matchLiked: true,
  newMessage: true,
  bookingReminder: true,
  classReminder: true,
  coachMessage: true,
  cotisationRequestEmail: true,
  cotisationReminderEmail: true,
  invitationAccepted: true,
  clubAnnouncement: true,
  memberAlertDigestEmail: true,
};

export async function getClubNotificationSettings(
  organizationId: string,
): Promise<ResolvedNotificationSettings> {
  const [row] = await db
    .select()
    .from(organizationNotificationSettings)
    .where(eq(organizationNotificationSettings.organizationId, organizationId))
    .limit(1);

  if (!row) return DEFAULT_NOTIFICATION_SETTINGS;

  return {
    streakWarning: row.streakWarning,
    challengeAssigned: row.challengeAssigned,
    matchRequestUpdate: row.matchRequestUpdate,
    matchLiked: row.matchLiked,
    newMessage: row.newMessage,
    bookingReminder: row.bookingReminder,
    classReminder: row.classReminder,
    coachMessage: row.coachMessage,
    cotisationRequestEmail: row.cotisationRequestEmail,
    cotisationReminderEmail: row.cotisationReminderEmail,
    invitationAccepted: row.invitationAccepted,
    clubAnnouncement: row.clubAnnouncement,
    memberAlertDigestEmail: row.memberAlertDigestEmail,
  };
}

/** Maps the push `NotificationType` enum (services/expo-push/notification-service.ts) to its
 * club toggle. `match_request_accepted` is kept for backward-compat with old `notification`
 * rows but no longer sent (see `match_request_update`); mapped here only so old rows deciding
 * to resend would still be gated sensibly. Types with no sensible per-club toggle (none today)
 * would be omitted and always allowed. */
export const PUSH_TYPE_TO_SETTING_KEY: Record<string, NotificationSettingKey> = {
  streak_warning: "streakWarning",
  challenge_assigned: "challengeAssigned",
  match_request_update: "matchRequestUpdate",
  match_request_accepted: "matchRequestUpdate",
  match_liked: "matchLiked",
  new_message: "newMessage",
  booking_reminder: "bookingReminder",
  class_reminder: "classReminder",
  coach_message: "coachMessage",
  invitation_accepted: "invitationAccepted",
  club_announcement: "clubAnnouncement",
};

/**
 * The single place every notification sender checks before actually sending — wired into the
 * shared push/email primitives (services/expo-push/*, services/mailer/index.ts) rather than at
 * each call site, so it can't be forgotten and covers every scheduler (Trigger.dev, Railway
 * cron, direct sends) that ultimately calls through them.
 *
 * No `organizationId` (e.g. a notification with no obvious club context) means there is nothing
 * to gate against — always allowed.
 */
/** For notifications with no single obvious club (match intents aren't club-scoped in the
 * schema; streak/challenge notifications are per-user, not per-club) — resolves whichever club
 * membership was created first for that user, purely so the gate has *something* to check
 * against. A user in no club at all means there's nothing to gate, same as passing no org. */
export async function resolvePrimaryOrganizationId(userId: string): Promise<string | null> {
  const [row] = await db
    .select({ organizationId: member.organizationId })
    .from(member)
    .where(eq(member.userId, userId))
    .orderBy(member.createdAt)
    .limit(1);
  return row?.organizationId ?? null;
}

export async function isNotificationEnabled(
  organizationId: string | null | undefined,
  key: NotificationSettingKey,
): Promise<boolean> {
  if (!organizationId) return true;
  const settings = await getClubNotificationSettings(organizationId);
  return settings[key];
}
