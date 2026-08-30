import { matchIntent, matchIntentSwipe, matchIntentTeammate, matchRequest } from "./schema";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type MatchIntent = InferSelectModel<typeof matchIntent>;
export type MatchIntentSwipe = InferSelectModel<typeof matchIntentSwipe>;
export type MatchRequest = InferSelectModel<typeof matchRequest>;
export type MatchIntentTeammate = InferSelectModel<typeof matchIntentTeammate>;

export type NewMatchIntent = InferInsertModel<typeof matchIntent>;
export type NewMatchIntentSwipe = InferInsertModel<typeof matchIntentSwipe>;
export type NewMatchRequest = InferInsertModel<typeof matchRequest>;
export type NewMatchIntentTeammate = InferInsertModel<typeof matchIntentTeammate>;
