import { relations } from "drizzle-orm";
import { tournament, tournamentMatch, tournamentSeed } from "./schema";
import { organization, user } from "../auth/schema";
import { event } from "../event/schema";

export const tournamentRelations = relations(tournament, ({ one, many }) => ({
  event: one(event, {
    fields: [tournament.eventId],
    references: [event.id],
  }),
  organization: one(organization, {
    fields: [tournament.organizationId],
    references: [organization.id],
  }),
  seeds: many(tournamentSeed),
  matches: many(tournamentMatch),
}));

export const tournamentSeedRelations = relations(tournamentSeed, ({ one }) => ({
  tournament: one(tournament, {
    fields: [tournamentSeed.tournamentId],
    references: [tournament.id],
  }),
  user: one(user, {
    fields: [tournamentSeed.userId],
    references: [user.id],
  }),
}));

export const tournamentMatchRelations = relations(tournamentMatch, ({ one }) => ({
  tournament: one(tournament, {
    fields: [tournamentMatch.tournamentId],
    references: [tournament.id],
  }),
}));
