import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { ClubOrganization } from "@/types/club-admin"

export type ClubAdminRole = "owner" | "admin" | "member"
export type ClubAdminAccess = "full" | "restricted" | "none"

interface ActiveMemberRoleResponse {
  role: ClubAdminRole
  restrictedDashboardAccess: boolean
}

/** Resolves the current user's access level for /club on their active organization. */
export function useClubAdminAccess() {
  return useQuery({
    queryKey: ["club-admin-access"],
    queryFn: async () => {
      const result = await apiClient<ActiveMemberRoleResponse | null>(
        "/organization/get-active-member-role",
      )

      if (!result || !["owner", "admin"].includes(result.role)) {
        return { role: result?.role ?? null, access: "none" as ClubAdminAccess }
      }

      return {
        role: result.role,
        access: (result.restrictedDashboardAccess ? "restricted" : "full") as ClubAdminAccess,
      }
    },
  })
}

export function useClubOrganizations() {
  return useQuery({
    queryKey: ["club-admin-organizations"],
    queryFn: () => apiClient<ClubOrganization[]>("/organization/list-organizations-user"),
  })
}
