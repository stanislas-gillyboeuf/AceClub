import { clubMemberProfile } from "./schema";

export type ClubMemberProfile = typeof clubMemberProfile.$inferSelect;
export type NewClubMemberProfile = typeof clubMemberProfile.$inferInsert;
