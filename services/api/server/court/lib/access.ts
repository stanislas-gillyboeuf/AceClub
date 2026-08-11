import { isOrgMember } from "../../../middleware/org-member";
import type { CourtAccessPolicyType } from "../../../db/schema";

export async function canAccessCourt(
  userId: string,
  organizationId: string,
  accessPolicy: CourtAccessPolicyType,
): Promise<boolean> {
  if (accessPolicy === "open") return true;
  return isOrgMember(userId, organizationId);
}
