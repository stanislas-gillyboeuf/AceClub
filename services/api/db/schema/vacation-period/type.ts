import { vacationPeriod } from "./schema";

export type VacationPeriod = typeof vacationPeriod.$inferSelect;
export type NewVacationPeriod = typeof vacationPeriod.$inferInsert;
