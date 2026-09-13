import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { ClubOrganization } from "@/types/club-admin"

export type ClubAdminRole = "owner" | "admin" | "coach" | "member"
export type ClubAdminAccess = "full" | "coach" | "none"

interface ActiveMemberRoleResponse {
  role: ClubAdminRole
  onboardingCompleted: boolean
}

/** Resolves the current user's access level for /club on their active organization. */
export function useClubAdminAccess() {
  return useQuery({
    queryKey: ["club-admin-access"],
    queryFn: async () => {
      const result = await apiClient<ActiveMemberRoleResponse | null>(
        "/organization/get-active-member-role",
      )

      if (!result) {
        return { role: null, access: "none" as ClubAdminAccess, onboardingCompleted: true }
      }

      if (["owner", "admin"].includes(result.role)) {
        return {
          role: result.role,
          access: "full" as ClubAdminAccess,
          onboardingCompleted: result.onboardingCompleted,
        }
      }

      // A coach is a distinct role with its own scoped view — not a bridged-down variant of
      // the admin menu, so it never goes through onboarding.
      if (result.role === "coach") {
        return { role: result.role, access: "coach" as ClubAdminAccess, onboardingCompleted: true }
      }

      return { role: result.role, access: "none" as ClubAdminAccess, onboardingCompleted: true }
    },
  })
}

export function useClubOrganizations() {
  return useQuery({
    queryKey: ["club-admin-organizations"],
    queryFn: () => apiClient<ClubOrganization[]>("/organization/list-organizations-user"),
  })
}
