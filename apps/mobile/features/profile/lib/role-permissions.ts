import type { MemberRole } from "@/types/common";

export const ROLE_LABELS: Record<MemberRole, string> = {
  owner: "Propriétaire",
  admin: "Administrateur",
  member: "Membre",
};

export function canAccessHub(role?: MemberRole | null): boolean {
  return role === "owner" || role === "admin";
}

export function canActOnMember(
  actorRole: MemberRole,
  targetRole: MemberRole,
  actorId: string,
  targetId: string,
): boolean {
  if (actorId === targetId) return false;
  if (actorRole === "owner") return true;
  if (actorRole === "admin") return targetRole === "member";
  return false;
}

export function getAssignableRoles(
  actorRole: MemberRole,
  targetRole: MemberRole,
): MemberRole[] {
  if (actorRole === "owner") {
    return (["owner", "admin", "member"] as MemberRole[]).filter(
      (r) => r !== targetRole,
    );
  }
  if (actorRole === "admin" && targetRole === "member") {
    return ["admin"];
  }
  return [];
}
