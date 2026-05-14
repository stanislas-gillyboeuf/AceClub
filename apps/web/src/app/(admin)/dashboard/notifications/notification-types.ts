import type { NotificationType } from "@/types/admin"

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  match_request_accepted: "Demande de match acceptée",
  invitation_accepted: "Invitation au club acceptée",
  new_match_request: "Nouvelle demande de match",
  match_reminder: "Rappel de match",
  challenge_assigned: "Nouveaux défis",
  streak_warning: "Streak en danger",
  new_message: "Nouveau message",
  match_liked: "Match liké",
}

export const SAMPLE_VARIABLES: Record<string, string> = {
  accepterName: "Léa",
  memberName: "Tom",
  organizationName: "Tennis Club Paris 15",
  requesterName: "Hugo",
  matchTime: "demain à 18h",
  opponentName: "Sarah",
  currentStreak: "8",
  senderName: "Camille",
  messagePreview: "Hey, on confirme pour samedi ?",
  likerName: "Alex",
  userName: "Toi",
}

export const CRON_PRESETS: { label: string; value: string }[] = [
  { label: "Tous les jours à 19h UTC", value: "0 19 * * *" },
  { label: "Lundi à 9h UTC", value: "0 9 * * 1" },
  { label: "Vendredi à 18h UTC", value: "0 18 * * 5" },
  { label: "1er du mois à 8h UTC", value: "0 8 1 * *" },
]
