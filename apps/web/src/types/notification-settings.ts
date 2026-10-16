export interface ClubNotificationSettings {
  streakWarning: boolean
  challengeAssigned: boolean
  matchRequestUpdate: boolean
  matchLiked: boolean
  newMessage: boolean
  bookingReminder: boolean
  classReminder: boolean
  coachMessage: boolean
  cotisationRequestEmail: boolean
  cotisationReminderEmail: boolean
  invitationAccepted: boolean
  clubAnnouncement: boolean
  memberAlertDigestEmail: boolean
}

export interface UpsertClubNotificationSettingsInput extends ClubNotificationSettings {
  organizationId: string
}
