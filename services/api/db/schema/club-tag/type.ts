import { clubTag, clubMemberTag } from "./schema";

export type ClubTag = typeof clubTag.$inferSelect;
export type NewClubTag = typeof clubTag.$inferInsert;
export type ClubMemberTag = typeof clubMemberTag.$inferSelect;
export type NewClubMemberTag = typeof clubMemberTag.$inferInsert;
