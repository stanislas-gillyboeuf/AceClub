import { broadcastMessage } from "./schema";

export type BroadcastMessage = typeof broadcastMessage.$inferSelect;
export type NewBroadcastMessage = typeof broadcastMessage.$inferInsert;
export type BroadcastChannelType = "email" | "push" | "both";
export type BroadcastSegmentType = "all" | "unpaid_dues" | "inactive_30d";
