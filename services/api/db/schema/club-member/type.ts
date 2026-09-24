import { clubMemberProfile, clubMemberNote, household } from "./schema";

export type ClubMemberProfile = typeof clubMemberProfile.$inferSelect;
export type NewClubMemberProfile = typeof clubMemberProfile.$inferInsert;
export type ClubMemberNote = typeof clubMemberNote.$inferSelect;
export type NewClubMemberNote = typeof clubMemberNote.$inferInsert;
export type Household = typeof household.$inferSelect;
export type NewHousehold = typeof household.$inferInsert;
