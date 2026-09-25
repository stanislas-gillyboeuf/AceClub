import { timingSafeEqual } from "node:crypto";

/** Constant-time string comparison (a different length is a mismatch, without leaking where). */
export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    timingSafeEqual(left, left);
    return false;
  }
  return timingSafeEqual(left, right);
}

function toRoles(role: string | string[]): string[] {
  return (Array.isArray(role) ? role : [role]).flatMap((r) => r.split(",")).map((r) => r.trim());
}

export interface AddMemberContext {
  actorId: string;
  targetUserId: string | null | undefined;
  role: string | string[];
  isSuperAdmin: boolean;
  isOrgAdmin: boolean;
  /** The club asks for a PIN and this request supplied the right one. */
  pinValid: boolean;
  orgPinRequired: boolean;
}

export type AddMemberDecision = { allowed: true } | { allowed: false; reason: string };

/**
 * Who may add a member to a club:
 * - super-admin: anyone, any role;
 * - owner/admin of the club: anyone, but never the `owner` role;
 * - a user adding THEMSELVES as a plain `member` (legacy « join » call kept for installed apps):
 *   only when the club has no PIN, or the right PIN came with the request.
 */
export function decideAddMember(ctx: AddMemberContext): AddMemberDecision {
  if (ctx.isSuperAdmin) return { allowed: true };

  const roles = toRoles(ctx.role);
  if (ctx.isOrgAdmin) {
    if (roles.includes("owner")) return { allowed: false, reason: "Only a platform admin can assign the owner role" };
    return { allowed: true };
  }

  const selfJoin = !!ctx.targetUserId && ctx.targetUserId === ctx.actorId;
  const plainMember = roles.length === 1 && roles[0] === "member";
  if (selfJoin && plainMember && (!ctx.orgPinRequired || ctx.pinValid)) return { allowed: true };

  return { allowed: false, reason: "You are not allowed to add members to this club" };
}

export interface InvitationRow {
  email: string;
  status: string;
  expiresAt: Date;
}

/** An invitation can be accepted only by its recipient, while pending and not expired. */
export function isInvitationAcceptable(
  inv: InvitationRow | undefined | null,
  userEmail: string,
  now: Date = new Date(),
): boolean {
  if (!inv) return false;
  if (inv.status !== "pending") return false;
  if (inv.expiresAt.getTime() <= now.getTime()) return false;
  return inv.email.trim().toLowerCase() === userEmail.trim().toLowerCase();
}

/** Better Auth throws APIError with `statusCode`/`status`; map it to an HTTP status (default 500). */
export function httpStatusFromAuthError(error: unknown): 400 | 401 | 403 | 404 | 409 | 500 {
  const e = error as { statusCode?: number; status?: number | string };
  const code = typeof e?.statusCode === "number" ? e.statusCode : typeof e?.status === "number" ? e.status : undefined;
  if (code === 400 || code === 401 || code === 403 || code === 404 || code === 409) return code;
  if (typeof e?.status === "string") {
    const byName: Record<string, 400 | 401 | 403 | 404 | 409> = {
      BAD_REQUEST: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      CONFLICT: 409,
    };
    return byName[e.status] ?? 500;
  }
  return 500;
}
