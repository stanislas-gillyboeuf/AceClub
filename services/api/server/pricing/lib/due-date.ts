export const DEFAULT_PAYMENT_DELAY_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

interface DueDateInput {
  paymentDueDate: Date | null;
  issuedAt: Date | null;
  createdAt: Date;
}

/** The grid's payment deadline, or 30 days after the cotisation was issued when none is set. */
export function effectiveDueDate({ paymentDueDate, issuedAt, createdAt }: DueDateInput): Date {
  if (paymentDueDate) return paymentDueDate;
  return new Date((issuedAt ?? createdAt).getTime() + DEFAULT_PAYMENT_DELAY_DAYS * DAY_MS);
}

/** Overdue = still pending once the effective due date has passed. */
export function isOverdue(input: DueDateInput & { status: string }, now: Date = new Date()): boolean {
  return input.status === "pending" && effectiveDueDate(input).getTime() < now.getTime();
}
