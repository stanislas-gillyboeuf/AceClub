import { clubMemberProfile, clubMemberNote } from "./schema";

export type ClubMemberProfile = typeof clubMemberProfile.$inferSelect;
export type NewClubMemberProfile = typeof clubMemberProfile.$inferInsert;
export type ClubMemberNote = typeof clubMemberNote.$inferSelect;
export type NewClubMemberNote = typeof clubMemberNote.$inferInsert;
