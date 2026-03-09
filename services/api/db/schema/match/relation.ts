import { match, matchParticipant, set, setScore, matchPhoto, matchComment, matchFeedback } from "./schema";
import { relations } from "drizzle-orm";
import { user, organization } from "../auth/schema";
import { conversation } from "../conversation/schema";

export const matchRelations = relations(match, ({ one, many }) => ({
  createdBy: one(user, {
    fields: [match.createdBy],
    references: [user.id],
  }),
  conversation: one(conversation, {
    fields: [match.conversationId],
    references: [conversation.id],
  }),
  venue: one(organization, {
    fields: [match.venueOrganizationId],
    references: [organization.id],
  }),
  participants: many(matchParticipant),
  sets: many(set),
  setScores: many(setScore),
  photos: many(matchPhoto),
  comments: many(matchComment),
  feedbacks: many(matchFeedback),
}));

export const matchPhotoRelations = relations(matchPhoto, ({ one }) => ({
  match: one(match, {
    fields: [matchPhoto.matchId],
    references: [match.id],
  }),
  user: one(user, {
    fields: [matchPhoto.userId],
    references: [user.id],
  }),
}));

export const matchCommentRelations = relations(matchComment, ({ one }) => ({
  match: one(match, {
    fields: [matchComment.matchId],
    references: [match.id],
  }),
  user: one(user, {
    fields: [matchComment.userId],
    references: [user.id],
  }),
}));

export const matchFeedbackRelations = relations(matchFeedback, ({ one }) => ({
  match: one(match, {
    fields: [matchFeedback.matchId],
    references: [match.id],
  }),
  user: one(user, {
    fields: [matchFeedback.userId],
    references: [user.id],
  }),
}));
